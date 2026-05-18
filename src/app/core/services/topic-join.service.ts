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

  private getAbsoluteUrlApi(path: string, forceAuthorized = false): string {
    const isPublicPath = !forceAuthorized && (
      path.includes('/join/')
    );
    const prefix = (this.userStore.isAuthenticated() && !isPublicPath) ? '/api/users/self' : '/api';
    return `${this.apiUrl}${prefix}${path}`;
  }

  get(token: string): Observable<Topic> {
    const path = this.getAbsoluteUrlApi(`/topics/join/${token}`);
    return this.http.get<ApiResponse<Topic>>(path, { withCredentials: true }).pipe(
      map(res => res.data!)
    );
  }

  join(token: string): Observable<Topic> {
    const path = this.getAbsoluteUrlApi(`/topics/join/${token}`);
    return this.http.post<ApiResponse<Topic>>(path, {}, { withCredentials: true }).pipe(
      map(res => res.data!)
    );
  }

  joinPublic(topicId: string): Observable<unknown> {
    const path = this.getAbsoluteUrlApi(`/topics/${topicId}/join`, true);
    return this.http.post<ApiResponse<unknown>>(path, {}, { withCredentials: true }).pipe(
      map(res => res.data)
    );
  }

  save(data: { topicId: string; userId: string; level: string | null }): Observable<TopicJoin> {
    const path = this.getAbsoluteUrlApi(`/topics/${data.topicId}/join`, true);
    return this.http.put<ApiResponse<TopicJoin>>(path, data, { withCredentials: true }).pipe(
      map(res => res.data!)
    );
  }

  update(data: { topicId: string; userId: string; level: string; token: string | null }): Observable<unknown> {
    const path = this.getAbsoluteUrlApi(`/topics/${data.topicId}/join/${data.token}`, true);
    return this.http.put<ApiResponse<unknown>>(path, data, { withCredentials: true }).pipe(
      map(res => res.data)
    );
  }
}
