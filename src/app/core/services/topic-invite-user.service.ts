import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ConfigStore } from '../state/config.store';
import { UserStore } from '../state/user.store';
import { ApiResponse } from '../interfaces/api-response';

export interface TopicInvite {
  id: string;
  inviteId?: string;
  topicId: string;
  user: { id: string; name: string; email?: string; imageUrl?: string; isRegistered?: boolean };
  topic: { id: string; title: string; intro?: string; description?: string; visibility: string; imageUrl?: string };
  creator: { id: string; name: string; imageUrl?: string };
  email?: string;
  level: string;
  expiresAt?: string;
  [key: string]: unknown;
}

@Service()
export class TopicInviteUserService {
  private http = inject(HttpClient);
  private configStore = inject(ConfigStore);
  private userStore = inject(UserStore);

  private get baseUrl() { return this.configStore.api.baseUrl(); }

  private getAbsoluteUrlApi(path: string, forceAuthorized = false): string {
    const isPublicPath = !forceAuthorized && (
      path.includes('/invites/users/')
    );
    const prefix = (this.userStore.isAuthenticated() && !isPublicPath) ? '/api/users/self' : '/api';
    return `${this.baseUrl}${prefix}${path}`;
  }

  loadItems(topicId: string): Observable<TopicInvite[]> {
    return this.http.get<ApiResponse<TopicInvite[]>>(
      this.getAbsoluteUrlApi(`/topics/${topicId}/invites/users`, true),
      { withCredentials: true }
    ).pipe(map(res => res.data ?? []));
  }

  save(topicId: string, data: Partial<TopicInvite>[]): Observable<unknown> {
    return this.http.post<ApiResponse<unknown>>(
      this.getAbsoluteUrlApi(`/topics/${topicId}/invites/users`, true),
      data, { withCredentials: true }
    ).pipe(map(res => res.data));
  }

  delete(topicId: string, inviteId: string): Observable<unknown> {
    return this.http.delete<ApiResponse<unknown>>(
      this.getAbsoluteUrlApi(`/topics/${topicId}/invites/users/${inviteId}`, true),
      { withCredentials: true }
    ).pipe(map(res => res.data));
  }

  get(params: { topicId: string; inviteId: string }): Observable<TopicInvite> {
    return this.http.get<ApiResponse<TopicInvite & { user: { isRegistered?: boolean } }>>(
      this.getAbsoluteUrlApi(`/topics/${params.topicId}/invites/users/${params.inviteId}`),
      { withCredentials: true }
    ).pipe(map(res => {
      const data = res.data;
      data.user.isRegistered = res.status.code !== 20002;
      return data;
    }));
  }

  accept(data: { topicId: string; inviteId: string;[key: string]: unknown }): Observable<unknown> {
    return this.http.post<ApiResponse<unknown>>(
      this.getAbsoluteUrlApi(`/topics/${data.topicId}/invites/users/${data.inviteId}/accept`),
      data, { withCredentials: true }
    ).pipe(map(res => res.data));
  }
}
