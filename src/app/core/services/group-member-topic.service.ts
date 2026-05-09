import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ConfigStore } from '../state/config.store';
import { UserStore } from '../state/user.store';
import { ApiResponse } from '../interfaces/api-response';
import { Topic } from '../interfaces/topic';

export interface GroupTopicParams {
  limit: number;
  offset: number;
  visibility?: string;
  statuses?: string[];
  orderBy?: string;
  order?: string;
  search?: string;
  favourite?: boolean;
  showModerated?: boolean;
  include?: string[];
  creatorId?: string;
  country?: string;
  language?: string;
}

@Injectable({ providedIn: 'root' })
export class GroupMemberTopicService {
  private http = inject(HttpClient);
  private configStore = inject(ConfigStore);
  private userStore = inject(UserStore);

  private get baseUrl() { return this.configStore.api.baseUrl(); }

  loadTopics(groupId: string, params: GroupTopicParams): Observable<{ rows: Topic[]; count: number }> {
    const isLoggedIn = this.userStore.isAuthenticated();
    const base = isLoggedIn ? 'users/self/' : '';
    const url = `${this.baseUrl}/api/${base}groups/${groupId}/members/topics`;

    let httpParams = new HttpParams()
      .set('limit', String(params.limit))
      .set('offset', String(params.offset));

    if (params.visibility) httpParams = httpParams.set('visibility', params.visibility);
    if (params.statuses?.length) httpParams = httpParams.set('statuses', params.statuses.join(','));
    if (params.orderBy) httpParams = httpParams.set('orderBy', params.orderBy);
    if (params.order) httpParams = httpParams.set('order', params.order);
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.favourite != null) httpParams = httpParams.set('favourite', String(params.favourite));
    if (params.creatorId) httpParams = httpParams.set('creatorId', params.creatorId);
    if (params.country) httpParams = httpParams.set('country', params.country);
    if (params.language) httpParams = httpParams.set('language', params.language);
    if (params.include?.length) httpParams = httpParams.set('include', params.include.join(','));

    return this.http.get<ApiResponse<{ rows: Topic[]; count: number }>>(
      url, { withCredentials: true, params: httpParams }
    ).pipe(map(res => ({ rows: res.data?.rows ?? [], count: res.data?.count ?? 0 })));
  }

  addTopic(groupId: string, topicId: string, level: string): Observable<unknown> {
    return this.http.post<ApiResponse<unknown>>(
      `${this.baseUrl}/api/users/self/groups/${groupId}/members/topics`,
      { topicId, level }, { withCredentials: true }
    ).pipe(map(r => r.data));
  }

  removeTopicFromGroup(groupId: string, topicId: string): Observable<unknown> {
    return this.http.delete<ApiResponse<unknown>>(
      `${this.baseUrl}/api/users/self/groups/${groupId}/members/topics/${topicId}`,
      { withCredentials: true }
    ).pipe(map(r => r.data));
  }
}
