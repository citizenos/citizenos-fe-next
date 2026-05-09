import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ApiResponse } from '../interfaces/api-response';
import { ConfigStore } from '../state/config.store';

@Injectable({
  providedIn: 'root'
})
export class TopicJoinService {
  private http = inject(HttpClient);
  private configStore = inject(ConfigStore);

  private get apiUrl() {
    return this.configStore.api.baseUrl();
  }

  get(token: string): Observable<unknown> {
    const path = `${this.apiUrl}/api/topics/join/${token}`;
    return this.http.get<ApiResponse<unknown>>(path, { withCredentials: true }).pipe(
      map(res => res.data)
    );
  }

  join(token: string): Observable<unknown> {
    const path = `${this.apiUrl}/api/topics/join/${token}`;
    return this.http.post<ApiResponse<unknown>>(path, {}, { withCredentials: true }).pipe(
      map(res => res.data)
    );
  }

  joinPublic(topicId: string): Observable<unknown> {
    const path = `${this.apiUrl}/api/users/self/topics/${topicId}/join`;
    return this.http.post<ApiResponse<unknown>>(path, {}, { withCredentials: true }).pipe(
      map(res => res.data)
    );
  }

  save(data: { topicId: string; userId: string; level: string | null }): Observable<unknown> {
    const path = `${this.apiUrl}/api/users/self/topics/${data.topicId}/join`;
    return this.http.put<ApiResponse<unknown>>(path, data, { withCredentials: true }).pipe(
      map(res => res.data)
    );
  }

  update(data: { topicId: string; userId: string; level: string; token: string | null }): Observable<unknown> {
    const path = `${this.apiUrl}/api/users/self/topics/${data.topicId}/join/${data.token}`;
    return this.http.put<ApiResponse<unknown>>(path, data, { withCredentials: true }).pipe(
      map(res => res.data)
    );
  }
}
