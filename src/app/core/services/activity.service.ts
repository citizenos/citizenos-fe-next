import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, BehaviorSubject, exhaustMap, shareReplay } from 'rxjs';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as jsonpatch from 'fast-json-patch';
import { ConfigStore } from '../state/config.store';
import { ApiResponse } from '../interfaces/api-response';

export interface ActivityGroup {
  referer: string;
  values: any[];
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
    const httpParams: any = { offset: params.offset, limit: this.limit };
    if (params.include) httpParams.include = params.include;

    return this.http
      .get<ApiResponse<any[]>>(url, { withCredentials: true, params: httpParams })
      .pipe(map(res => this.processActivities(res.data ?? [])));
  }

  private processActivities(data: any[]): ActivityGroup[] {
    const parsed: any[] = [];

    data.forEach((activity: any) => {
      if (!activity.data) return;

      if (
        activity.data.type === 'Create' &&
        !activity.data.target &&
        activity.data.object &&
        (activity.data.object['@type'] === 'Vote' ||
          (Array.isArray(activity.data.object) && activity.data.object[0]['@type'] === 'VoteOption'))
      ) {
        return;
      }

      if (activity.data.type === 'Update' && Array.isArray(activity.data.result)) {
        if (activity.data.origin['@type'] === 'Topic') {
          activity.data.origin.description = null;
        }
        const resultObject = Object.assign({}, activity.data.origin);
        if (resultObject.demographicsConfig === null) {
          resultObject.demographicsConfig = {};
        }
        activity.data.resultObject = jsonpatch.applyPatch(resultObject, activity.data.result).newDocument;

        const resultItems: any[] = [];
        activity.data.result.forEach((item: any) => {
          const field = item.path.split('/')[1];
          if (['deletedById', 'deletedByReportId', 'edits'].indexOf(field) > -1) return;
          const existing = resultItems.find((r: any) => r.path.indexOf(field) > -1);
          if (!existing) {
            resultItems.push(item);
          } else if (item.value) {
            if (!Array.isArray(existing.value)) existing.value = [existing.value];
            existing.value.push(item.value);
          }
        });
        activity.data.result = resultItems;

        resultItems.forEach((change: any) => {
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
    groups.forEach((group: any) => {
      group.values.forEach((activity: any) => {
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

  buildActivityString(activity: any): void {
    const parts = ['ACTIVITY'];
    const keys = Object.keys(activity.data);
    ['actor', 'type', 'object', 'origin', 'target', 'inReplyTo'].forEach(key => {
      if (!keys.includes(key)) return;
      const value = activity.data[key];
      switch (key) {
        case 'actor': parts.push(value.type); break;
        case 'type': parts.push(value); break;
        case 'target': parts.push(value['@type']); break;
        case 'inReplyTo': parts.push('IN_REPLY_TO', value['@type']); break;
        case 'object':
          parts.push(Array.isArray(value) ? value[0]['@type'] : (value['@type'] || value.type));
          if (value.object) parts.push(value.object['@type']);
          break;
        case 'origin':
          if (parts.includes(value['@type'])) break;
          parts.push(Array.isArray(value) ? value[0]['@type'] : value['@type']);
          if (
            activity.data.object?.['@type'] &&
            activity.data.result?.[0]?.path.includes('level') &&
            activity.data.result[0].value === 'none'
          ) {
            parts.push('none');
          }
          break;
      }
    });

    if (
      activity.data.object?.['@type'] === 'CommentVote' &&
      activity.data.type !== 'Delete'
    ) {
      const res = activity.data.resultObject;
      const obj = activity.data.object;
      let val = 'up';
      if ((res && res.value === -1) || (!res && obj.value === -1)) val = 'down';
      if (res && res.value === 0) val = 'remove';
      parts.push(val);
    }

    activity.string = 'ACTIVITY_FEED.' + parts.join('_').toUpperCase();
  }

  getActivityValues(activity: any): any {
    const values: any = {};
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
        if (obj.value === -1) val = 'DOWN';
        else if (obj.value === 0) val = 'REMOVE';
        values['reaction'] = this.translate.instant(str + val);
      }
    }
    activity.values = values;
    if (activity.data.type === 'Update') this.getUpdatedTranslations(activity);
    return activity;
  }

  activitiesToGroups(activities: any[]): ActivityGroup[] {
    const final: Record<string, any[]> = {};
    activities.forEach(activity => { final[activity.id] = [activity]; });
    const result = Object.entries(final).map(([referer, values]) => ({ referer, values }));
    result.sort((a: any, b: any) => {
      const ta = a.values[0]?.updatedAt ?? '';
      const tb = b.values[0]?.updatedAt ?? '';
      return ta < tb ? -1 : ta > tb ? 1 : 0;
    });
    return result;
  }

  showActivityUpdateVersions(activity: any): boolean {
    if (activity.data.type !== 'Update') return false;
    const obj = activity.data.object;
    const result = activity.data.result;
    if (result && (obj?.['@type'] === 'Topic' && result[0]?.path.includes('description'))) return false;
    if (obj?.['@type'] === 'UserNotificationSettings') return false;
    if (obj?.['@type'] === 'CommentVote' && activity.data.resultObject?.value === 0) return false;
    if (obj?.['@type'] === 'TopicMemberUser' && result?.[0]?.path.includes('level') && result[0].value === 'none') return false;
    return true;
  }

  showActivityDescription(activity: any): boolean {
    const obj = activity.data?.object;
    const target = activity.data?.target;
    if (obj && (Array.isArray(obj) && obj[0]['@type'] === 'Comment' || obj['@type'] === 'Comment' || obj.text)) return true;
    if (target?.['@type'] === 'Comment') return true;
    return false;
  }

  handleActivityRedirect(activity: any): void {
    if (!activity.data) return;
    const lang = this.translate.currentLang;
    const { type: activityType } = activity.data;
    const object = this.getActivityObject(activity);
    const target = activity.data.target;
    const origin = activity.data.origin;
    let state: string[] = [lang];

    if (activityType === 'Invite' && target?.['@type'] === 'User' && object['@type'] === 'Topic') {
      state = state.concat(['topics', object.id]);
    } else if (activityType === 'Invite' && target?.['@type'] === 'User' && object['@type'] === 'Group') {
      state = state.concat(['groups', object.id]);
    } else if (object['@type'] === 'Topic') {
      state = state.concat(['topics', object.id]);
    } else if (object['@type'] === 'TopicMemberUser') {
      state = state.concat(['topics', object.topicId]);
    } else if (['Comment', 'CommentVote'].includes(object['@type'])) {
      const topicId = object.topicId || target?.topicId || target?.id;
      if (topicId) state = state.concat(['topics', topicId]);
    } else if (['Vote', 'VoteList'].includes(object['@type']) && target?.['@type'] === 'Topic') {
      state = state.concat(['topics', target.topicId || target.id, 'votes', object.voteId || object.id]);
    } else if (['Group', 'TopicMemberGroup'].includes(object['@type'])) {
      state = state.concat(['groups', object.id || object.groupId]);
    } else if (['Vote', 'VoteFinalContainer'].includes(object['@type'])) {
      state = state.concat(['topics', object.topicId || object.id, 'votes', object.voteId || object.id]);
    } else if (target?.['@type'] === 'Topic' || target?.topicId) {
      state = state.concat(['topics', target.topicId || target.id]);
    }

    if (target?.['@type'] === 'Group' && activityType !== 'Invite') {
      state = [lang, 'groups', target.id];
    }

    if (state[1] !== 'topics' && origin?.['@type'] === 'Topic' && activityType !== 'Invite') {
      state = state.concat(['topics', origin.id]);
    }

    if (['Idea', 'IdeaVote'].includes(object['@type'])) {
      state = state.concat(['topics', object.topicId]);
    }

    if (state.length > 1) {
      if (state.length > 3 && activityType !== 'Invite') state = state.slice(0, 3);
      this.router.navigate(state);
    }
  }

  private getActivityObject(activity: any): any {
    const obj = activity.data.object?.object ?? activity.data.object;
    return Array.isArray(obj) ? obj[0] : obj;
  }

  private getActivityTopicTitle(activity: any): string | undefined {
    const obj = this.getActivityObject(activity);
    if (['Topic', 'VoteFinalContainer'].includes(obj['@type'])) return obj.title;
    if (obj.topicTitle) return obj.topicTitle;
    if (activity.data.target?.title) return activity.data.target.title;
    if (activity.data.target?.topicTitle) return activity.data.target.topicTitle;
    if (activity.data.origin?.title) return activity.data.origin.title;
    if (activity.data.origin?.topicTitle) return activity.data.origin.topicTitle;
    return undefined;
  }

  private getActivityClassName(activity: any): string {
    const obj = this.getActivityObject(activity);
    const { type, actor, target } = activity.data;
    const objectType = activity.data.object?.['@type'];
    const targetType = target?.['@type'];

    if (type === 'Accept' || type === 'Invite' || (type === 'Add' && actor?.type === 'User' && objectType === 'User' && targetType === 'Group')) return 'invite';
    if (['Topic', 'TopicMemberUser', 'Attachment', 'TopicFavourite'].includes(obj['@type']) || targetType === 'Topic') return 'discussion';
    if (['Group'].includes(obj['@type']) || obj.groupName) return 'group';
    if (['Vote', 'VoteList', 'VoteUserContainer', 'VoteFinalContainer', 'VoteOption', 'VoteDelegation'].includes(obj['@type'])) return 'vote';
    if (['Comment', 'CommentVote'].includes(obj['@type'])) return 'comment';
    if (['User', 'UserConnection'].includes(obj['@type']) || obj.text) return 'personal';
    return 'topic';
  }

  private getActivityDescription(activity: any): string | undefined {
    const obj = this.getActivityObject(activity);
    if (obj['@type'] === 'Comment' || obj.text) return obj.text;
    if (activity.data.target?.['@type'] === 'Comment') return activity.data.target.text;
    return undefined;
  }

  private getActivityGroupName(activity: any): string | undefined {
    const obj = this.getActivityObject(activity);
    const { target, origin } = activity.data;
    if (obj['@type'] === 'Group') return obj.name;
    if (obj.groupName) return obj.groupName;
    if (target?.['@type'] === 'Group') return target.name;
    if (target?.groupName) return target.groupName;
    if (origin?.['@type'] === 'Group') return origin.name;
    if (origin?.groupName) return origin.groupName;
    return undefined;
  }

  private getActivityAttachmentName(activity: any): string | undefined {
    let obj = activity.data.object;
    if (Array.isArray(obj)) obj = obj[0];
    if (obj['@type'] === 'Attachment' || obj.name) return obj.name;
    return undefined;
  }

  private getActivityUserConnectionName(activity: any): string | undefined {
    let obj = activity.data.object;
    if (Array.isArray(obj)) obj = obj[0];
    if (obj['@type'] !== 'UserConnection') return undefined;
    const key = ('ACTIVITY_FEED.ACTIVITY_USERCONNECTION_CONNECTION_NAME_' + obj.connectionId).toUpperCase();
    const t = this.translate.instant(key);
    return !t || t === key
      ? obj.connectionId.charAt(0).toUpperCase() + obj.connectionId.slice(1)
      : t;
  }

  private getActivityUsers(activity: any, values: any): void {
    let obj = activity.data.object;
    if (Array.isArray(obj)) obj = obj[0];
    if (activity.data.actor?.name) values.userName = activity.data.actor.name;
    if (obj['@type'] === 'User') {
      values.userName2 = obj.name;
    } else if (obj.userName) {
      values.userName2 = obj.userName;
    } else if (activity.data.target?.['@type'] === 'User') {
      values.userName2 = activity.data.target.name;
    } else if (activity.data.target?.userName) {
      values.userName2 = activity.data.target.userName;
    } else if (activity.data.actor?.type === 'Moderator') {
      values.userName = '';
    }
  }

  private getActivityUserLevel(activity: any, values: any): void {
    const prefix = 'ACTIVITY_FEED.ACTIVITY_TOPIC_LEVELS_';
    let key: string | undefined;
    if (activity.data.actor?.level) key = prefix + activity.data.actor.level;
    else if (activity.data.target?.level) key = prefix + activity.data.target.level;
    if (key && key !== prefix) values.accessLevel = this.translate.instant(key.toUpperCase());
  }

  private getUpdatedTranslations(activity: any): void {
    const fieldName = activity.data.result[0].path.split('/')[1];
    activity.values.fieldName = fieldName;
    const originType = activity.data.origin?.['@type'];
    let prevValue = activity.data.origin?.[fieldName];
    let newValue = activity.data.resultObject?.[fieldName];

    if (Array.isArray(prevValue) && prevValue.length === 0) prevValue = '';

    const toKey = (prefix: string, val: string) => prefix + val.toUpperCase();

    if (originType === 'Topic' || originType === 'Comment' || originType === 'Group' || originType === 'Idea') {
      const fieldKey = `ACTIVITY_FEED.ACTIVITY_${originType.toUpperCase()}_FIELD_${fieldName.toUpperCase()}`;
      activity.values.fieldName = this.translate.instant(fieldKey);
    }

    if (originType === 'Topic') {
      if (fieldName === 'status' || fieldName === 'visibility') {
        if (prevValue) prevValue = this.translate.instant(toKey(`ACTIVITY_FEED.ACTIVITY_TOPIC_FIELD_${fieldName.toUpperCase()}_`, prevValue));
        if (newValue) newValue = this.translate.instant(toKey(`ACTIVITY_FEED.ACTIVITY_TOPIC_FIELD_${fieldName.toUpperCase()}_`, newValue));
      }
      if (fieldName === 'categories') {
        if (prevValue) prevValue = this.getCategoryKeys(prevValue).map(k => this.translate.instant(k)).join(', ');
        if (newValue) newValue = this.getCategoryKeys(newValue).map(k => this.translate.instant(k)).join(', ');
      }
    }

    if (originType === 'CommentVote' && fieldName === 'value') {
      const mapVal = (v: any) => v === 1 ? 'UP' : v === -1 ? 'DOWN' : 'REMOVE';
      if (prevValue !== undefined) prevValue = this.translate.instant('ACTIVITY_FEED.ACTIVITY_COMMENTVOTE_FIELD_VALUE_' + mapVal(prevValue));
      if (newValue !== undefined) newValue = this.translate.instant('ACTIVITY_FEED.ACTIVITY_COMMENTVOTE_FIELD_VALUE_' + mapVal(newValue));
    }

    if ((originType === 'Comment' || originType === 'Idea') && fieldName === 'deletedReasonType') {
      newValue = this.translate.instant('ACTIVITY_FEED.ACTIVITY_COMMENT_FIELD_DELETEDREASONTYPE_' + newValue?.toUpperCase());
    }

    activity.values.previousValue = prevValue;
    activity.values.newValue = newValue;
  }

  private getCategoryKeys(cats: any): string[] {
    return Array.isArray(cats)
      ? cats.map(c => 'TXT_TOPIC_CATEGORY_' + c.toUpperCase())
      : ['TXT_TOPIC_CATEGORY_' + cats.toUpperCase()];
  }
}
