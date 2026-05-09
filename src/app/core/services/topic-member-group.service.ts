import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ConfigStore } from '../state/config.store';
import { ApiResponse } from '../interfaces/api-response';

@Injectable({ providedIn: 'root' })
export class TopicMemberGroupService {
  private http = inject(HttpClient);
  private configStore = inject(ConfigStore);

  private get baseUrl() { return this.configStore.api.baseUrl(); }

  readonly LEVELS = {
    read: 'read',
    admin: 'admin'
  };

  loadItems(topicId: string): Observable<unknown[]> {
    return this.http.get<ApiResponse<unknown[]>>(
      `${this.baseUrl}/api/users/self/topics/${topicId}/members/groups`,
      { withCredentials: true }
    ).pipe(map(res => res.data ?? []));
  }

  save(data: { topicId: string; groupId: string; level: string }): Observable<unknown> {
    return this.http.post<ApiResponse<unknown>>(
      `${this.baseUrl}/api/users/self/topics/${data.topicId}/members/groups`,
      data, { withCredentials: true }
    ).pipe(map(res => res.data));
  }

  update(data: { topicId: string; groupId: string; level: string }): Observable<unknown> {
    return this.http.put<ApiResponse<unknown>>(
      `${this.baseUrl}/api/users/self/topics/${data.topicId}/members/groups/${data.groupId}`,
      data, { withCredentials: true }
    ).pipe(map(res => res.data));
  }

  delete(data: { topicId: string; groupId: string }): Observable<unknown> {
    return this.http.delete<ApiResponse<unknown>>(
      `${this.baseUrl}/api/users/self/topics/${data.topicId}/members/groups/${data.groupId}`,
      { withCredentials: true }
    ).pipe(map(res => res.data));
  }
}
