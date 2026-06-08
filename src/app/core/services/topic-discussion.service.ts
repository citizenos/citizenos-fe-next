import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, EMPTY } from 'rxjs';
import { ApiResponse } from '../interfaces/api-response';
import { Discussion, DiscussionData } from '../interfaces/discussion';
import { Topic } from '../interfaces/topic';
import { ConfigStore } from '../state/config.store';
import { UserStore } from '../state/user.store';

@Service()
export class TopicDiscussionService {
  private http = inject(HttpClient);
  private configStore = inject(ConfigStore);
  private userStore = inject(UserStore);

  private getAbsoluteUrlApi(path: string, forceAuthorized = false): string {
    const isPublicPath = !forceAuthorized && (
      path.includes('/discussions/')
    );
    const prefix = (this.userStore.isAuthenticated() && !isPublicPath) ? '/api/users/self' : '/api';
    return `${this.configStore.api.baseUrl()}${prefix}${path}`;
  }

  get(topicId: string, discussionId: string): Observable<Discussion> {
    if (!topicId || !discussionId || topicId === 'undefined' || discussionId === 'undefined') {
      return EMPTY;
    }
    const url = this.getAbsoluteUrlApi(`/topics/${topicId}/discussions/${discussionId}`);
    return this.http.get<ApiResponse<Discussion>>(url, { withCredentials: true })
      .pipe(map(res => res.data!));
  }

  save(topicId: string | DiscussionData, data?: DiscussionData): Observable<Discussion> {
    let tId: string;
    let d: DiscussionData;
    if (typeof topicId === 'object') {
      tId = topicId.topicId!;
      d = topicId;
    } else {
      tId = topicId;
      d = data!;
    }
    const url = this.getAbsoluteUrlApi(`/topics/${tId}/discussions`, true);
    return this.http.post<ApiResponse<Discussion>>(url, d, { withCredentials: true })
      .pipe(map(res => res.data!));
  }

  create(topicId: string | DiscussionData, data?: DiscussionData): Observable<Discussion> {
    return this.save(topicId, data);
  }

  update(topicId: string | DiscussionData, discussionId?: string, data?: DiscussionData): Observable<Discussion> {
    let tId: string;
    let dId: string;
    let d: DiscussionData;

    if (typeof topicId === 'object') {
      tId = topicId.topicId!;
      dId = topicId.discussionId!;
      d = topicId;
    } else {
      tId = topicId;
      dId = discussionId!;
      d = data!;
    }
    const url = this.getAbsoluteUrlApi(`/topics/${tId}/discussions/${dId}`, true);
    return this.http.put<ApiResponse<Discussion>>(url, d, { withCredentials: true })
      .pipe(map(r => r.data!));
  }

  patch(topicId: string | DiscussionData, discussionId?: string, data?: DiscussionData): Observable<Discussion> {
    let tId: string;
    let dId: string;
    let d: DiscussionData;

    if (typeof topicId === 'object') {
      tId = topicId.topicId!;
      dId = topicId.discussionId!;
      d = topicId;
    } else {
      tId = topicId;
      dId = discussionId!;
      d = data!;
    }
    const url = this.getAbsoluteUrlApi(`/topics/${tId}/discussions/${dId}`, true);
    return this.http.patch<ApiResponse<Discussion>>(url, d, { withCredentials: true })
      .pipe(map(r => r.data!));
  }

  hasDiscussionEnded(topic: Topic, discussion: Discussion) {
    return (['draft', 'followUp', 'closed'].indexOf(topic.status) > -1) || (!!discussion.deadline && (new Date() > new Date(discussion.deadline)));
  }

  hasDiscussionEndedExpired(topic: Topic, discussion: Discussion) {
    return this.hasDiscussionEnded(topic, discussion);
  }
}
