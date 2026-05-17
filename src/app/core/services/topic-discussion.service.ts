import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, EMPTY } from 'rxjs';
import { ApiResponse } from '../interfaces/api-response';
import { Discussion, DiscussionData } from '../interfaces/discussion';
import { Topic } from '../interfaces/topic';
import { ConfigStore } from '../state/config.store';
import { UserStore } from '../state/user.store';

@Injectable({ providedIn: 'root' })
export class TopicDiscussionService {
  private http = inject(HttpClient);
  private configStore = inject(ConfigStore);
  private userStore = inject(UserStore);

  private base(topicId: string): string {
    const prefix = this.userStore.isAuthenticated() ? '/api/users/self' : '/api';
    return `${this.configStore.api.baseUrl()}${prefix}/topics/${topicId}/discussions`;
  }

  get(topicId: string, discussionId: string): Observable<Discussion> {
    if (!topicId || !discussionId || topicId === 'undefined' || discussionId === 'undefined') {
      return EMPTY;
    }
    return this.http
      .get<ApiResponse<Discussion>>(`${this.base(topicId)}/${discussionId}`, { withCredentials: true })
      .pipe(map(r => r.data!));
  }

  create(topicId: string, payload: DiscussionData): Observable<Discussion> {
    if (!topicId || topicId === 'undefined') {
       return EMPTY;
    }
    return this.http
      .post<ApiResponse<Discussion>>(this.base(topicId), payload, { withCredentials: true })
      .pipe(map(r => r.data!));
  }

  update(topicId: string, discussionId: string, payload: DiscussionData): Observable<Discussion> {
    if (!topicId || !discussionId || topicId === 'undefined' || discussionId === 'undefined') {
      return EMPTY;
    }
    return this.http
      .put<ApiResponse<Discussion>>(`${this.base(topicId)}/${discussionId}`, payload, { withCredentials: true })
      .pipe(map(r => r.data!));
  }

  hasDiscussionEndedExpired(topic: Topic, discussion: Discussion) {
    return (['draft', 'followUp', 'closed'].indexOf(topic.status) > -1) || (!!discussion.deadline && (new Date() > new Date(discussion.deadline)));
  }
}
