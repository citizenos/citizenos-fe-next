import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ConfigStore } from '../state/config.store';
import { UserStore } from '../state/user.store';
import { ApiResponse } from '../interfaces/api-response';
import { Topic } from '../interfaces/topic';

export interface GroupTopicRequest {
  id: string;
  groupId: string;
  topicId: string;
  level: string;
  topic: Topic;
  text?: string;
}

export interface TopicRequest extends GroupTopicRequest {}

@Injectable({ providedIn: 'root' })
export class GroupRequestTopicService {
  private http = inject(HttpClient);
  private configStore = inject(ConfigStore);
  private userStore = inject(UserStore);

  private get baseUrl() { return this.configStore.api.baseUrl(); }

  private getAbsoluteUrlApi(path: string): string {
    const prefix = this.userStore.isAuthenticated() ? '/api/users/self' : '/api';
    return `${this.baseUrl}${prefix}${path}`;
  }

  loadItems(groupId: string): Observable<GroupTopicRequest[]> {
    return this.http.get<ApiResponse<GroupTopicRequest[]>>(
      this.getAbsoluteUrlApi(`/groups/${groupId}/requests/topics`),
      { withCredentials: true }
    ).pipe(map(res => res.data ?? []));
  }

  getRequests(groupId: string): Observable<{ rows: GroupTopicRequest[]; count: number }> {
    return this.http.get<ApiResponse<GroupTopicRequest[]>>(
      this.getAbsoluteUrlApi(`/groups/${groupId}/requests/topics`),
      { withCredentials: true }
    ).pipe(map(res => ({ rows: res.data ?? [], count: res.data?.length ?? 0 })));
  }

  save(groupId: string, topicId: string, level: string, text?: string): Observable<unknown> {
    return this.http.post<ApiResponse<unknown>>(
      this.getAbsoluteUrlApi(`/groups/${groupId}/requests/topics`),
      { topicId, level, text }, { withCredentials: true }
    ).pipe(map(res => res.data));
  }

  request(groupId: string, topicId: string, level: string, text?: string): Observable<unknown> {
    return this.save(groupId, topicId, level, text);
  }

  accept(groupId: string, requestId: string): Observable<unknown> {
    return this.http.post<ApiResponse<unknown>>(
      this.getAbsoluteUrlApi(`/groups/${groupId}/requests/topics/${requestId}/accept`),
      {}, { withCredentials: true }
    ).pipe(map(res => res.data));
  }

  reject(groupId: string, requestId: string): Observable<unknown> {
    return this.http.post<ApiResponse<unknown>>(
      this.getAbsoluteUrlApi(`/groups/${groupId}/requests/topics/${requestId}/reject`),
      {}, { withCredentials: true }
    ).pipe(map(res => res.data));
  }
}
