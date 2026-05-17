import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ApiResponse } from '../interfaces/api-response';
import { ConfigStore } from '../state/config.store';
import { UserStore } from '../state/user.store';
import { Topic } from '../interfaces/topic';

export interface TopicJoin {
  token: string;
  level: string;
}

@Injectable({
  providedIn: 'root'
})
export class TopicJoinService {
  private http = inject(HttpClient);
  private configStore = inject(ConfigStore);
  private userStore = inject(UserStore);

  private get apiUrl() {
    return this.configStore.api.baseUrl();
  }

  private getAbsoluteUrlApi(path: string): string {
    if (path.startsWith('/api/users/self')) {
      if (!this.userStore.isAuthenticated()) {
        path = path.replace('/api/users/self', '/api');
      }
    } else if (path.startsWith('/api/topics')) {
      if (this.userStore.isAuthenticated()) {
        path = path.replace('/api/topics', '/api/users/self/topics');
      }
    }
    return `${this.apiUrl}${path}`;
  }

  get(token: string): Observable<Topic> {
    const path = this.getAbsoluteUrlApi(`/api/topics/join/${token}`);
    return this.http.get<ApiResponse<Topic>>(path, { withCredentials: true }).pipe(
      map(res => res.data!)
    );
  }

  join(token: string): Observable<Topic> {
    const path = this.getAbsoluteUrlApi(`/api/topics/join/${token}`);
    return this.http.post<ApiResponse<Topic>>(path, {}, { withCredentials: true }).pipe(
      map(res => res.data!)
    );
  }

  joinPublic(topicId: string): Observable<unknown> {
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${topicId}/join`);
    return this.http.post<ApiResponse<unknown>>(path, {}, { withCredentials: true }).pipe(
      map(res => res.data)
    );
  }

  save(data: { topicId: string; userId: string; level: string | null }): Observable<TopicJoin> {
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${data.topicId}/join`);
    return this.http.put<ApiResponse<TopicJoin>>(path, data, { withCredentials: true }).pipe(
      map(res => res.data!)
    );
  }

  update(data: { topicId: string; userId: string; level: string; token: string | null }): Observable<unknown> {
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${data.topicId}/join/${data.token}`);
    return this.http.put<ApiResponse<unknown>>(path, data, { withCredentials: true }).pipe(
      map(res => res.data)
    );
  }
}
