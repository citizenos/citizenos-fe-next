import { Service, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ConfigStore } from '../state/config.store';
import { UserStore } from '../state/user.store';
import { ApiResponse } from '../interfaces/api-response';
import { Topic } from '../interfaces/topic';

export interface GroupTopicParams {
  limit: number;
  offset: number;
  [key: string]: string | number | boolean | string[] | undefined;
}

@Service()
export class GroupMemberTopicService {
  private http = inject(HttpClient);
  private configStore = inject(ConfigStore);
  private userStore = inject(UserStore);

  private get baseUrl() { return this.configStore.api.baseUrl(); }

  private getAbsoluteUrlApi(path: string, forceAuthorized = false): string {
    const isPublicPath = !forceAuthorized && (
      path.includes('/members/topics')
    );
    const prefix = (this.userStore.isAuthenticated() && !isPublicPath) ? '/api/users/self' : '/api';
    return `${this.baseUrl}${prefix}${path}`;
  }

  loadTopics(groupId: string, params: GroupTopicParams): Observable<{ rows: Topic[]; count: number }> {
    const url = this.getAbsoluteUrlApi(`/groups/${groupId}/members/topics`);

    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val != null) {
        if (Array.isArray(val)) {
          val.forEach(v => { httpParams = httpParams.append(key, String(v)); });
        } else {
          httpParams = httpParams.set(key, String(val));
        }
      }
    });

    return this.http.get<ApiResponse<{ rows: Topic[]; count: number }>>(url, { withCredentials: true, params: httpParams })
      .pipe(map(res => ({ rows: res.data?.rows ?? [], count: res.data?.count ?? 0 })));
  }

  addTopic(groupId: string, topicId: string, level: string): Observable<unknown> {
    return this.http.post<ApiResponse<unknown>>(
      this.getAbsoluteUrlApi(`/groups/${groupId}/members/topics`, true),
      { topicId, level }, { withCredentials: true }
    ).pipe(map(r => r.data));
  }

  removeTopicFromGroup(groupId: string, topicId: string): Observable<unknown> {
    return this.http.delete<ApiResponse<unknown>>(
      this.getAbsoluteUrlApi(`/groups/${groupId}/members/topics/${topicId}`, true),
      { withCredentials: true }
    ).pipe(map(r => r.data));
  }
}
