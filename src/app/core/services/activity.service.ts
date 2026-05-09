import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable, BehaviorSubject, exhaustMap, shareReplay } from 'rxjs';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as jsonpatch from 'fast-json-patch';
import { ConfigStore } from '../state/config.store';
import { ApiResponse } from '../interfaces/api-response';

interface ActivityObject extends Record<string, unknown> { '@type'?: string; type?: string }
interface JsonPatchItem { path: string; value?: unknown; op: string }

interface ActivityData {
  type: string;
  actor?: ActivityObject;
  object?: ActivityObject | ActivityObject[];
  target?: ActivityObject;
  origin?: ActivityObject;
  inReplyTo?: ActivityObject;
  result?: JsonPatchItem[];
  resultObject?: ActivityObject;
}

export interface ActivityItem {
  id: string;
  updatedAt: string;
  data: ActivityData;
  string?: string;
  values?: Record<string, unknown>;
  isNew?: boolean;
}

export interface ActivityGroup {
  referer: string;
  values: ActivityItem[];
}

export interface ActivityContext {
  groupId?: string;
  topicId?: string;
  include?: string | null;
}

@Injectable({ providedIn: 'root' })
export class ActivityService {
  private http = inject(HttpClient);
  private configStore = inject(ConfigStore);
  private translate = inject(TranslateService);
  private router = inject(Router);

  private get apiUrl() { return this.configStore.api.baseUrl(); }

  readonly filters = ['all', 'userTopics', 'userGroups', 'user', 'self'];

  private limit = 10;
  private offset = 0;
  private ctx: ActivityContext = {};
  private lastViewTime: string | null = null;

  readonly hasMore = signal(false);

  private loadTrigger$ = new BehaviorSubject<{ offset: number; ctx: ActivityContext }>({ offset: 0, ctx: {} });
  private unreadTrigger$ = new BehaviorSubject<void>(undefined);

  loadItems(ctx?: ActivityContext): Observable<ActivityGroup[]> {
    this.ctx = ctx ?? {};
    this.offset = 0;
    this.loadTrigger$.next({ offset: 0, ctx: this.ctx });
    return this.loadTrigger$.pipe(
      exhaustMap(({ offset, ctx: c }) => this.fetchPage({ ...c, offset })),
      shareReplay(1)
    );
  }

  loadMore(): void {
    this.offset += this.limit;
    this.loadTrigger$.next({ offset: this.offset, ctx: this.ctx });
  }

  reset(): void {
    this.offset = 0;
    this.lastViewTime = null;
    this.ctx = {};
  }

  reloadUnreadItems(): void {
    this.unreadTrigger$.next();
  }

  unreadCount$(params?: { groupId?: string; topicId?: string }): Observable<number> {
    return this.unreadTrigger$.pipe(
      exhaustMap(() => this.getUnreadCount(params)),
      shareReplay(1)
    );
  }

  getUnreadCount(params?: { groupId?: string; topicId?: string }): Observable<number> {
    let url: string;
    if (params?.groupId) {
      url = `${this.apiUrl}/api/groups/${params.groupId}/activities/unread`;
    } else if (params?.topicId) {
      url = `${this.apiUrl}/api/topics/${params.topicId}/activities/unread`;
    } else {
      url = `${this.apiUrl}/api/users/self/activities/unread`;
    }
    return this.http.get<ApiResponse<{ count: number }>>(url, { withCredentials: true })
      .pipe(map(res => res.data?.count ?? 0));
  }

  private fetchPage(params: ActivityContext & { offset: number }): Observable<ActivityGroup[]> {
    let url: string;
    if (params.groupId) {
      url = `${this.apiUrl}/api/groups/${params.groupId}/activities`;
    } else if (params.topicId) {
      url = `${this.apiUrl}/api/topics/${params.topicId}/activities`;
    } else {
      url = `${this.apiUrl}/api/users/self/activities`;
    }
    const httpParams: { offset: number; limit: number; include?: string } = { offset: params.offset, limit: this.limit };
    if (params.include) httpParams.include = params.include;

    return this.http
      .get<ApiResponse<ActivityItem[]>>(url, { withCredentials: true, params: httpParams as Record<string, string | number> })
      .pipe(map(res => this.processActivities(res.data ?? [])));
  }

  private processActivities(data: ActivityItem[]): ActivityGroup[] {
    const parsed: ActivityItem[] = [];

    data.forEach((activity: ActivityItem) => {
      if (!activity.data) return;

      const obj = activity.data.object;
      const objFirst = Array.isArray(obj) ? obj[0] : obj;

      if (
        activity.data.type === 'Create' &&
        !activity.data.target &&
        obj &&
        (objFirst?.['@type'] === 'Vote' ||
          (Array.isArray(obj) && obj[0]?.['@type'] === 'VoteOption'))
      ) {
        return;
      }

      if (activity.data.type === 'Update' && Array.isArray(activity.data.result)) {
        if (activity.data.origin?.['@type'] === 'Topic') {
          (activity.data.origin as Record<string, unknown>)['description'] = null;
        }
        const resultObject = Object.assign({}, activity.data.origin);
        if ((resultObject as Record<string, unknown>)['demographicsConfig'] === null) {
          (resultObject as Record<string, unknown>)['demographicsConfig'] = {};
        }
        activity.data.resultObject = jsonpatch.applyPatch(resultObject, activity.data.result as jsonpatch.Operation[]).newDocument as ActivityObject;

        const resultItems: JsonPatchItem[] = [];
        activity.data.result.forEach((item: JsonPatchItem) => {
          const field = item.path.split('/')[1];
          if (['deletedById', 'deletedByReportId', 'edits'].indexOf(field) > -1) return;
          const existing = resultItems.find((r: JsonPatchItem) => r.path.indexOf(field) > -1);
          if (!existing) {
            resultItems.push(item);
          } else if (item.value) {
            if (!Array.isArray(existing.value)) existing.value = [existing.value];
            (existing.value as unknown[]).push(item.value);
          }
        });
        activity.data.result = resultItems;

        resultItems.forEach((change: JsonPatchItem) => {
          const act = { ...activity, data: { ...activity.data, result: [change] } };
          act.id = activity.id + '_' + change.path;
          this.buildActivityString(act);
          parsed.push(this.getActivityValues(act));
        });
      } else {
        this.buildActivityString(activity);
        parsed.push(this.getActivityValues(activity));
      }
    });

    const groups = this.activitiesToGroups(parsed);
    groups.forEach((group: ActivityGroup) => {
      group.values.forEach((activity: ActivityItem) => {
        activity.isNew = !this.lastViewTime || activity.updatedAt > this.lastViewTime;
        if (activity.data?.type === 'View') {
          if (!this.lastViewTime || activity.updatedAt > this.lastViewTime) {
            this.lastViewTime = activity.updatedAt;
          }
        }
      });
    });

    this.hasMore.set(data.length >= this.limit);
    return groups;
  }

  buildActivityString(activity: ActivityItem): void {
    const parts = ['ACTIVITY'];
    const keys = Object.keys(activity.data);
    ['actor', 'type', 'object', 'origin', 'target', 'inReplyTo'].forEach(key => {
      if (!keys.includes(key)) return;
      const value = (activity.data as Record<string, unknown>)[key] as ActivityObject | ActivityObject[] | string;
      switch (key) {
        case 'actor': parts.push((value as ActivityObject)['type'] as string); break;
        case 'type': parts.push(value as string); break;
        case 'target': parts.push((value as ActivityObject)['@type'] as string); break;
        case 'inReplyTo': parts.push('IN_REPLY_TO', (value as ActivityObject)['@type'] as string); break;
        case 'object': {
          const v = value as ActivityObject | ActivityObject[];
          parts.push(Array.isArray(v) ? v[0]['@type'] as string : ((v['@type'] || v['type']) as string));
          if (!Array.isArray(v) && v['object']) parts.push(((v['object'] as ActivityObject)['@type']) as string);
          break;
        }
        case 'origin': {
          const v = value as ActivityObject | ActivityObject[];
          const vType = Array.isArray(v) ? v[0]['@type'] as string : v['@type'] as string;
          if (parts.includes(vType)) break;
          parts.push(vType);
          if (
            activity.data.object?.['@type'] &&
            activity.data.result?.[0]?.path.includes('level') &&
            activity.data.result[0].value === 'none'
          ) {
            parts.push('none');
          }
          break;
        }
      }
    });

    if (
      activity.data.object?.['@type'] === 'CommentVote' &&
      activity.data.type !== 'Delete'
    ) {
      const res = activity.data.resultObject;
      const obj = Array.isArray(activity.data.object) ? activity.data.object[0] : activity.data.object;
      let val = 'up';
      if ((res && res['value'] === -1) || (!res && obj?.['value'] === -1)) val = 'down';
      if (res && res['value'] === 0) val = 'remove';
      parts.push(val);
    }

    activity.string = 'ACTIVITY_FEED.' + parts.join('_').toUpperCase();
  }

  getActivityValues(activity: ActivityItem): ActivityItem {
    const values: Record<string, unknown> = {};
    if (activity.data.object) {
      this.getActivityUsers(activity, values);
      values['topicTitle'] = this.getActivityTopicTitle(activity) ?? '';
      values['className'] = this.getActivityClassName(activity);
      values['description'] = this.getActivityDescription(activity);
      values['groupName'] = this.getActivityGroupName(activity);
      values['attachmentName'] = this.getActivityAttachmentName(activity);
      values['connectionName'] = this.getActivityUserConnectionName(activity);
      this.getActivityUserLevel(activity, values);

      let obj = activity.data.object;
      if (Array.isArray(obj)) obj = obj[0];
      if (obj['@type'] === 'CommentVote' && activity.data.type === 'Create') {
        const str = 'ACTIVITY_FEED.ACTIVITY_COMMENTVOTE_FIELD_VALUE_';
        let val = 'UP';
        if (obj['value'] === -1) val = 'DOWN';
        else if (obj['value'] === 0) val = 'REMOVE';
        values['reaction'] = this.translate.instant(str + val);
      }
    }
    activity.values = values;
    if (activity.data.type === 'Update') this.getUpdatedTranslations(activity);
    return activity;
  }

  activitiesToGroups(activities: ActivityItem[]): ActivityGroup[] {
    const final: Record<string, ActivityItem[]> = {};
    activities.forEach(activity => { final[activity.id] = [activity]; });
    const result = Object.entries(final).map(([referer, values]) => ({ referer, values }));
    result.sort((a: ActivityGroup, b: ActivityGroup) => {
      const ta = a.values[0]?.updatedAt ?? '';
      const tb = b.values[0]?.updatedAt ?? '';
      return ta < tb ? -1 : ta > tb ? 1 : 0;
    });
    return result;
  }

  showActivityUpdateVersions(activity: ActivityItem): boolean {
    if (activity.data.type !== 'Update') return false;
    const obj = Array.isArray(activity.data.object) ? activity.data.object[0] : activity.data.object;
    const result = activity.data.result;
    if (result && (obj?.['@type'] === 'Topic' && result[0]?.path.includes('description'))) return false;
    if (obj?.['@type'] === 'UserNotificationSettings') return false;
    if (obj?.['@type'] === 'CommentVote' && activity.data.resultObject?.['value'] === 0) return false;
    if (obj?.['@type'] === 'TopicMemberUser' && result?.[0]?.path.includes('level') && result[0].value === 'none') return false;
    return true;
  }

  showActivityDescription(activity: ActivityItem): boolean {
    const obj = activity.data?.object;
    const target = activity.data?.target;
    const objFirst = Array.isArray(obj) ? obj[0] : obj;
    if (obj && (Array.isArray(obj) && obj[0]['@type'] === 'Comment' || objFirst?.['@type'] === 'Comment' || objFirst?.['text'])) return true;
    if (target?.['@type'] === 'Comment') return true;
    return false;
  }

  handleActivityRedirect(activity: ActivityItem): void {
    if (!activity.data) return;
    const lang = this.translate.currentLang;
    const { type: activityType } = activity.data;
    const object = this.getActivityObject(activity);
    const target = activity.data.target;
    const origin = activity.data.origin;
    let state: string[] = [lang];

    if (activityType === 'Invite' && target?.['@type'] === 'User' && object?.['@type'] === 'Topic') {
      state = state.concat(['topics', object['id'] as string]);
    } else if (activityType === 'Invite' && target?.['@type'] === 'User' && object?.['@type'] === 'Group') {
      state = state.concat(['groups', object['id'] as string]);
    } else if (object?.['@type'] === 'Topic') {
      state = state.concat(['topics', object['id'] as string]);
    } else if (object?.['@type'] === 'TopicMemberUser') {
      state = state.concat(['topics', object['topicId'] as string]);
    } else if (['Comment', 'CommentVote'].includes(object?.['@type'] as string)) {
      const topicId = object?.['topicId'] || target?.['topicId'] || target?.['id'];
      if (topicId) state = state.concat(['topics', topicId as string]);
    } else if (['Vote', 'VoteList'].includes(object?.['@type'] as string) && target?.['@type'] === 'Topic') {
      state = state.concat(['topics', (target?.['topicId'] || target?.['id']) as string, 'votes', (object?.['voteId'] || object?.['id']) as string]);
    } else if (['Group', 'TopicMemberGroup'].includes(object?.['@type'] as string)) {
      state = state.concat(['groups', (object?.['id'] || object?.['groupId']) as string]);
    } else if (['Vote', 'VoteFinalContainer'].includes(object?.['@type'] as string)) {
      state = state.concat(['topics', (object?.['topicId'] || object?.['id']) as string, 'votes', (object?.['voteId'] || object?.['id']) as string]);
    } else if (target?.['@type'] === 'Topic' || target?.['topicId']) {
      state = state.concat(['topics', (target?.['topicId'] || target?.['id']) as string]);
    }

    if (target?.['@type'] === 'Group' && activityType !== 'Invite') {
      state = [lang, 'groups', target['id'] as string];
    }

    if (state[1] !== 'topics' && origin?.['@type'] === 'Topic' && activityType !== 'Invite') {
      state = state.concat(['topics', origin['id'] as string]);
    }

    if (['Idea', 'IdeaVote'].includes(object?.['@type'] as string)) {
      state = state.concat(['topics', object?.['topicId'] as string]);
    }

    if (state.length > 1) {
      if (state.length > 3 && activityType !== 'Invite') state = state.slice(0, 3);
      this.router.navigate(state);
    }
  }

  private getActivityObject(activity: ActivityItem): ActivityObject | undefined {
    const obj = (activity.data.object as ActivityObject)?.['object'] ?? activity.data.object;
    return Array.isArray(obj) ? obj[0] : obj;
  }

  private getActivityTopicTitle(activity: ActivityItem): string | undefined {
    const obj = this.getActivityObject(activity);
    if (!obj) return undefined;
    if (['Topic', 'VoteFinalContainer'].includes(obj['@type'] as string)) return obj['title'] as string;
    if (obj['topicTitle']) return obj['topicTitle'] as string;
    if (activity.data.target?.['title']) return activity.data.target['title'] as string;
    if (activity.data.target?.['topicTitle']) return activity.data.target['topicTitle'] as string;
    if (activity.data.origin?.['title']) return activity.data.origin['title'] as string;
    if (activity.data.origin?.['topicTitle']) return activity.data.origin['topicTitle'] as string;
    return undefined;
  }

  private getActivityClassName(activity: ActivityItem): string {
    const obj = this.getActivityObject(activity);
    const { type, actor, target } = activity.data;
    const objectType = (Array.isArray(activity.data.object) ? activity.data.object[0] : activity.data.object)?.['@type'];
    const targetType = target?.['@type'];

    if (type === 'Accept' || type === 'Invite' || (type === 'Add' && actor?.['type'] === 'User' && objectType === 'User' && targetType === 'Group')) return 'invite';
    if (['Topic', 'TopicMemberUser', 'Attachment', 'TopicFavourite'].includes(obj?.['@type'] as string) || targetType === 'Topic') return 'discussion';
    if (['Group'].includes(obj?.['@type'] as string) || obj?.['groupName']) return 'group';
    if (['Vote', 'VoteList', 'VoteUserContainer', 'VoteFinalContainer', 'VoteOption', 'VoteDelegation'].includes(obj?.['@type'] as string)) return 'vote';
    if (['Comment', 'CommentVote'].includes(obj?.['@type'] as string)) return 'comment';
    if (['User', 'UserConnection'].includes(obj?.['@type'] as string) || obj?.['text']) return 'personal';
    return 'topic';
  }

  private getActivityDescription(activity: ActivityItem): string | undefined {
    const obj = this.getActivityObject(activity);
    if (obj?.['@type'] === 'Comment' || obj?.['text']) return obj?.['text'] as string;
    if (activity.data.target?.['@type'] === 'Comment') return activity.data.target['text'] as string;
    return undefined;
  }

  private getActivityGroupName(activity: ActivityItem): string | undefined {
    const obj = this.getActivityObject(activity);
    const { target, origin } = activity.data;
    if (obj?.['@type'] === 'Group') return obj['name'] as string;
    if (obj?.['groupName']) return obj['groupName'] as string;
    if (target?.['@type'] === 'Group') return target['name'] as string;
    if (target?.['groupName']) return target['groupName'] as string;
    if (origin?.['@type'] === 'Group') return origin['name'] as string;
    if (origin?.['groupName']) return origin['groupName'] as string;
    return undefined;
  }

  private getActivityAttachmentName(activity: ActivityItem): string | undefined {
    let obj = activity.data.object;
    if (Array.isArray(obj)) obj = obj[0];
    if (obj?.['@type'] === 'Attachment' || obj?.['name']) return obj?.['name'] as string;
    return undefined;
  }

  private getActivityUserConnectionName(activity: ActivityItem): string | undefined {
    let obj = activity.data.object;
    if (Array.isArray(obj)) obj = obj[0];
    if (obj?.['@type'] !== 'UserConnection') return undefined;
    const key = ('ACTIVITY_FEED.ACTIVITY_USERCONNECTION_CONNECTION_NAME_' + obj['connectionId']).toUpperCase();
    const t = this.translate.instant(key);
    const connId = obj['connectionId'] as string;
    return !t || t === key
      ? connId.charAt(0).toUpperCase() + connId.slice(1)
      : t;
  }

  private getActivityUsers(activity: ActivityItem, values: Record<string, unknown>): void {
    let obj = activity.data.object;
    if (Array.isArray(obj)) obj = obj[0];
    if (activity.data.actor?.['name']) values['userName'] = activity.data.actor['name'];
    if (obj?.['@type'] === 'User') {
      values['userName2'] = obj['name'];
    } else if (obj?.['userName']) {
      values['userName2'] = obj['userName'];
    } else if (activity.data.target?.['@type'] === 'User') {
      values['userName2'] = activity.data.target['name'];
    } else if (activity.data.target?.['userName']) {
      values['userName2'] = activity.data.target['userName'];
    } else if (activity.data.actor?.['type'] === 'Moderator') {
      values['userName'] = '';
    }
  }

  private getActivityUserLevel(activity: ActivityItem, values: Record<string, unknown>): void {
    const prefix = 'ACTIVITY_FEED.ACTIVITY_TOPIC_LEVELS_';
    let key: string | undefined;
    if (activity.data.actor?.['level']) key = prefix + activity.data.actor['level'];
    else if (activity.data.target?.['level']) key = prefix + activity.data.target['level'];
    if (key && key !== prefix) values['accessLevel'] = this.translate.instant(key.toUpperCase());
  }

  private getUpdatedTranslations(activity: ActivityItem): void {
    const fieldName = activity.data.result![0].path.split('/')[1];
    activity.values!['fieldName'] = fieldName;
    const originType = activity.data.origin?.['@type'] as string | undefined;
    let prevValue = activity.data.origin?.[fieldName];
    let newValue = activity.data.resultObject?.[fieldName];

    if (Array.isArray(prevValue) && prevValue.length === 0) prevValue = '';

    const toKey = (prefix: string, val: string) => prefix + val.toUpperCase();

    if (originType === 'Topic' || originType === 'Comment' || originType === 'Group' || originType === 'Idea') {
      const fieldKey = `ACTIVITY_FEED.ACTIVITY_${originType.toUpperCase()}_FIELD_${fieldName.toUpperCase()}`;
      activity.values!['fieldName'] = this.translate.instant(fieldKey);
    }

    if (originType === 'Topic') {
      if (fieldName === 'status' || fieldName === 'visibility') {
        if (prevValue) prevValue = this.translate.instant(toKey(`ACTIVITY_FEED.ACTIVITY_TOPIC_FIELD_${fieldName.toUpperCase()}_`, prevValue as string));
        if (newValue) newValue = this.translate.instant(toKey(`ACTIVITY_FEED.ACTIVITY_TOPIC_FIELD_${fieldName.toUpperCase()}_`, newValue as string));
      }
      if (fieldName === 'categories') {
        if (prevValue) prevValue = this.getCategoryKeys(prevValue as string[] | string).map(k => this.translate.instant(k)).join(', ');
        if (newValue) newValue = this.getCategoryKeys(newValue as string[] | string).map(k => this.translate.instant(k)).join(', ');
      }
    }

    if (originType === 'CommentVote' && fieldName === 'value') {
      const mapVal = (v: number) => v === 1 ? 'UP' : v === -1 ? 'DOWN' : 'REMOVE';
      if (prevValue !== undefined) prevValue = this.translate.instant('ACTIVITY_FEED.ACTIVITY_COMMENTVOTE_FIELD_VALUE_' + mapVal(prevValue as number));
      if (newValue !== undefined) newValue = this.translate.instant('ACTIVITY_FEED.ACTIVITY_COMMENTVOTE_FIELD_VALUE_' + mapVal(newValue as number));
    }

    if ((originType === 'Comment' || originType === 'Idea') && fieldName === 'deletedReasonType') {
      newValue = this.translate.instant('ACTIVITY_FEED.ACTIVITY_COMMENT_FIELD_DELETEDREASONTYPE_' + (newValue as string)?.toUpperCase());
    }

    activity.values!['previousValue'] = prevValue;
    activity.values!['newValue'] = newValue;
  }

  private getCategoryKeys(cats: string[] | string): string[] {
    return Array.isArray(cats)
      ? cats.map(c => 'TXT_TOPIC_CATEGORY_' + c.toUpperCase())
      : ['TXT_TOPIC_CATEGORY_' + cats.toUpperCase()];
  }
}
