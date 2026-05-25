import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ConfigStore } from '../state/config.store';
import { UserStore } from '../state/user.store';
import { ApiResponse } from '../interfaces/api-response';
import { Group } from '../interfaces/group';

export interface TopicMemberGroup extends Partial<Group> {
  id: string;
  name: string;
  level: string;
  userId?: string;
}

@Injectable({ providedIn: 'root' })
export class TopicMemberGroupService {
  private http = inject(HttpClient);
  private configStore = inject(ConfigStore);
  private userStore = inject(UserStore);

  private get baseUrl() { return this.configStore.api.baseUrl(); }

  private getAbsoluteUrlApi(path: string, forceAuthorized = false): string {
    const isPublicPath = !forceAuthorized && (
      path.includes('/members/groups')
    );
    const prefix = (this.userStore.isAuthenticated() && !isPublicPath) ? '/api/users/self' : '/api';
    return `${this.baseUrl}${prefix}${path}`;
  }

  readonly LEVELS = {
    read: 'read',
    admin: 'admin'
  };

  loadItems(topicId: string): Observable<TopicMemberGroup[]> {
    return this.http.get<ApiResponse<TopicMemberGroup[]>>(
      this.getAbsoluteUrlApi(`/topics/${topicId}/members/groups`, true),
      { withCredentials: true }
    ).pipe(map(res => res.data ?? []));
  }

  save(data: { topicId: string; groupId: string; level: string }): Observable<unknown> {
    return this.http.post<ApiResponse<unknown>>(
      this.getAbsoluteUrlApi(`/topics/${data.topicId}/members/groups`, true),
      data, { withCredentials: true }
    ).pipe(map(res => res.data));
  }

  update(data: { topicId: string; groupId: string; level: string }): Observable<unknown> {
    return this.http.put<ApiResponse<unknown>>(
      this.getAbsoluteUrlApi(`/topics/${data.topicId}/members/groups/${data.groupId}`, true),
      data, { withCredentials: true }
    ).pipe(map(res => res.data));
  }

  delete(data: { topicId: string; groupId: string }): Observable<unknown> {
    return this.http.delete<ApiResponse<unknown>>(
      this.getAbsoluteUrlApi(`/topics/${data.topicId}/members/groups/${data.groupId}`, true),
      { withCredentials: true }
    ).pipe(map(res => res.data));
  }
}
