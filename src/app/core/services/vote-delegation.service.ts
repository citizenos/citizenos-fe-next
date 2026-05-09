import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ConfigStore } from '../state/config.store';
import { ApiResponse } from '../interfaces/api-response';

@Injectable({ providedIn: 'root' })
export class VoteDelegationService {
  private http = inject(HttpClient);
  private configStore = inject(ConfigStore);

  private get baseUrl() { return this.configStore.api.baseUrl(); }

  save(data: { topicId: string; voteId: string; userId: string }): Observable<unknown> {
    return this.http.post<ApiResponse<unknown>>(
      `${this.baseUrl}/api/users/self/topics/${data.topicId}/votes/${data.voteId}/delegations`,
      data, { withCredentials: true }
    ).pipe(map(res => res.data));
  }

  delete(data: { topicId: string; voteId: string }): Observable<unknown> {
    return this.http.delete<ApiResponse<unknown>>(
      `${this.baseUrl}/api/users/self/topics/${data.topicId}/votes/${data.voteId}/delegations`,
      { withCredentials: true }
    ).pipe(map(res => res.data));
  }
}
