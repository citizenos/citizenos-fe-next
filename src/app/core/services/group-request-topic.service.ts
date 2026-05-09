import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ConfigStore } from '../state/config.store';
import { ApiResponse } from '../interfaces/api-response';

export interface TopicRequest {
  id: string;
  topicId: string;
  groupId: string;
  level: string;
  text?: string;
  status?: string;
  topic?: { id?: string; title?: string | null; visibility?: string };
}

@Injectable({ providedIn: 'root' })
export class GroupRequestTopicService {
  private http = inject(HttpClient);
  private configStore = inject(ConfigStore);

  private get baseUrl() { return this.configStore.api.baseUrl(); }

  getRequests(groupId: string): Observable<{ rows: TopicRequest[]; count: number }> {
    return this.http.get<ApiResponse<{ rows: TopicRequest[]; count: number }>>(
      `${this.baseUrl}/api/users/self/groups/${groupId}/requests/topics`,
      { withCredentials: true }
    ).pipe(map(r => r.data!));
  }

  request(groupId: string, topicId: string, level: string, text?: string): Observable<unknown> {
    return this.http.post<ApiResponse<unknown>>(
      `${this.baseUrl}/api/users/self/groups/${groupId}/requests/topics`,
      { topicId, level, text }, { withCredentials: true }
    ).pipe(map(r => r.data));
  }

  accept(groupId: string, requestId: string): Observable<unknown> {
    return this.http.post<ApiResponse<unknown>>(
      `${this.baseUrl}/api/users/self/groups/${groupId}/requests/topics/${requestId}/accept`,
      {}, { withCredentials: true }
    ).pipe(map(r => r.data));
  }

  reject(groupId: string, requestId: string): Observable<unknown> {
    return this.http.post<ApiResponse<unknown>>(
      `${this.baseUrl}/api/users/self/groups/${groupId}/requests/topics/${requestId}/reject`,
      {}, { withCredentials: true }
    ).pipe(map(r => r.data));
  }
}
