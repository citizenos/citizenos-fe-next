import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ConfigStore } from '../state/config.store';
import { ApiResponse } from '../interfaces/api-response';

@Injectable({ providedIn: 'root' })
export class GroupRequestTopicService {
  private http = inject(HttpClient);
  private configStore = inject(ConfigStore);

  private get baseUrl() { return this.configStore.api.baseUrl(); }

  getRequests(groupId: string): Observable<{ rows: any[]; count: number }> {
    return this.http.get<ApiResponse<{ rows: any[]; count: number }>>(
      `${this.baseUrl}/api/users/self/groups/${groupId}/requests/topics`,
      { withCredentials: true }
    ).pipe(map(r => r.data!));
  }

  request(groupId: string, topicId: string, level: string, text?: string): Observable<any> {
    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/api/users/self/groups/${groupId}/requests/topics`,
      { topicId, level, text }, { withCredentials: true }
    ).pipe(map(r => r.data));
  }

  accept(groupId: string, requestId: string): Observable<any> {
    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/api/users/self/groups/${groupId}/requests/topics/${requestId}/accept`,
      {}, { withCredentials: true }
    ).pipe(map(r => r.data));
  }

  reject(groupId: string, requestId: string): Observable<any> {
    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/api/users/self/groups/${groupId}/requests/topics/${requestId}/reject`,
      {}, { withCredentials: true }
    ).pipe(map(r => r.data));
  }
}
