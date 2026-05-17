import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ConfigStore } from '../state/config.store';
import { UserStore } from '../state/user.store';
import { ApiResponse } from '../interfaces/api-response';
import { ItemsListService, ListParams } from './items-list.service';
import { Topic } from '../interfaces/topic';

export interface PublicTopicParams extends ListParams {
  statuses?: string[];
  categories?: string[];
  country?: string;
  language?: string;
  favourite?: boolean | string;
  showModerated?: boolean | string;
}

@Injectable({ providedIn: 'root' })
export class PublicTopicService extends ItemsListService<PublicTopicParams, Topic> {
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

  override getItems(params: PublicTopicParams): Observable<{ rows: Topic[]; countTotal: number }> {
    let httpParams = new HttpParams()
      .set('limit', String(params.limit))
      .set('offset', String(params.offset ?? 0));

    if (params.statuses?.length) httpParams = httpParams.set('statuses', params.statuses.join(','));
    if (params.categories?.length) httpParams = httpParams.set('categories', params.categories.join(','));
    if (params.country) httpParams = httpParams.set('country', params.country);
    if (params.language) httpParams = httpParams.set('language', params.language);
    if (params.favourite != null) httpParams = httpParams.set('favourite', String(params.favourite));
    if (params.showModerated != null) httpParams = httpParams.set('showModerated', String(params.showModerated));
    if (params.orderBy) httpParams = httpParams.set('orderBy', params.orderBy);
    if (params.order) httpParams = httpParams.set('order', params.order);
    if (params.search) httpParams = httpParams.set('search', params.search);

    return this.http.get<ApiResponse<{ rows: Topic[]; count: number }>>(
      this.getAbsoluteUrlApi('/api/topics'),
      { withCredentials: true, params: httpParams }
    ).pipe(map(res => ({ rows: res.data?.rows ?? [], countTotal: res.data?.count ?? 0 })));
  }

  getPreview(limit: number): Observable<Topic[]> {
    return this.http.get<ApiResponse<{ rows: Topic[] }>>(
      this.getAbsoluteUrlApi('/api/topics'),
      { withCredentials: true, params: { limit } }
    ).pipe(map(res => res.data?.rows ?? []));
  }
}
