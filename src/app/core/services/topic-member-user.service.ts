import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ConfigStore } from '../state/config.store';
import { ApiResponse } from '../interfaces/api-response';

export interface TopicMemberUser {
  id: string;
  name: string;
  email?: string;
  imageUrl?: string;
  level: string;
}

@Injectable({ providedIn: 'root' })
export class TopicMemberUserService {
  private http = inject(HttpClient);
  private configStore = inject(ConfigStore);

  private get baseUrl() { return this.configStore.api.baseUrl(); }

  loadItems(topicId: string): Observable<TopicMemberUser[]> {
    return this.http.get<ApiResponse<TopicMemberUser[]>>(
      `${this.baseUrl}/api/users/self/topics/${topicId}/members/users`,
      { withCredentials: true }
    ).pipe(map(res => res.data ?? []));
  }

  query(params: { topicId: string; search?: string }): Observable<{ rows: TopicMemberUser[] }> {
    return this.http.get<ApiResponse<{ rows: TopicMemberUser[] }>>(
      `${this.baseUrl}/api/users/self/topics/${params.topicId}/members/users`,
      { withCredentials: true, params: params.search ? { search: params.search } : {} }
    ).pipe(map(res => res.data ?? { rows: [] }));
  }

  update(topicId: string, userId: string, level: string): Observable<any> {
    return this.http.put<ApiResponse<any>>(
      `${this.baseUrl}/api/users/self/topics/${topicId}/members/users/${userId}`,
      { level }, { withCredentials: true }
    ).pipe(map(res => res.data));
  }

  delete(topicId: string, userId: string): Observable<any> {
    return this.http.delete<ApiResponse<any>>(
      `${this.baseUrl}/api/users/self/topics/${topicId}/members/users/${userId}`,
      { withCredentials: true }
    ).pipe(map(res => res.data));
  }
}
