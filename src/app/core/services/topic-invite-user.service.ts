import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ConfigStore } from '../state/config.store';
import { ApiResponse } from '../interfaces/api-response';

export interface TopicInvite {
  id: string;
  user?: { name: string; email?: string };
  email?: string;
  level: string;
}

@Injectable({ providedIn: 'root' })
export class TopicInviteUserService {
  private http = inject(HttpClient);
  private configStore = inject(ConfigStore);

  private get baseUrl() { return this.configStore.api.baseUrl(); }

  loadItems(topicId: string): Observable<TopicInvite[]> {
    return this.http.get<ApiResponse<TopicInvite[]>>(
      `${this.baseUrl}/api/users/self/topics/${topicId}/invites/users`,
      { withCredentials: true }
    ).pipe(map(res => res.data ?? []));
  }

  save(topicId: string, data: any): Observable<any> {
    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/api/users/self/topics/${topicId}/invites/users`,
      data, { withCredentials: true }
    ).pipe(map(res => res.data));
  }

  delete(topicId: string, inviteId: string): Observable<any> {
    return this.http.delete<ApiResponse<any>>(
      `${this.baseUrl}/api/users/self/topics/${topicId}/invites/users/${inviteId}`,
      { withCredentials: true }
    ).pipe(map(res => res.data));
  }

  get(params: { topicId: string; inviteId: string }): Observable<any> {
    return this.http.get<ApiResponse<any>>(
      `${this.baseUrl}/api/users/self/topics/${params.topicId}/invites/users/${params.inviteId}`,
      { withCredentials: true }
    ).pipe(map(res => {
      const data = res.data;
      data.user.isRegistered = res.status.code !== 20002;
      return data;
    }));
  }

  accept(data: { topicId: string; inviteId: string; [key: string]: any }): Observable<any> {
    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/api/users/self/topics/${data.topicId}/invites/users/${data.inviteId}/accept`,
      data, { withCredentials: true }
    ).pipe(map(res => res.data));
  }
}
