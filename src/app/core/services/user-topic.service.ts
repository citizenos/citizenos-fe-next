import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ConfigStore } from '../state/config.store';
import { ApiResponse } from '../interfaces/api-response';
import { ItemsListService, ListParams } from './items-list.service';

export interface UserTopicParams extends ListParams {
  statuses?: string[];
  categories?: string[];
  country?: string;
  language?: string;
  visibility?: string;
  favourite?: boolean | string;
  showModerated?: boolean | string;
  hasVoted?: boolean;
  creatorId?: string;
}

@Injectable({ providedIn: 'root' })
export class UserTopicService extends ItemsListService<UserTopicParams, Topic> {
  private http = inject(HttpClient);
  private configStore = inject(ConfigStore);

  readonly VISIBILITY = ['public', 'private'];

  private get apiUrl() {
    return this.configStore.api.baseUrl();
  }

  override getItems(params: UserTopicParams): Observable<{ rows: Topic[]; countTotal: number }> {
    let httpParams = new HttpParams()
      .set('limit', String(params.limit))
      .set('offset', String(params.offset ?? 0));

    if (params.statuses?.length) httpParams = httpParams.set('statuses', params.statuses.join(','));
    if (params.categories?.length) httpParams = httpParams.set('categories', params.categories.join(','));
    if (params.country) httpParams = httpParams.set('country', params.country);
    if (params.language) httpParams = httpParams.set('language', params.language);
    if (params.visibility) httpParams = httpParams.set('visibility', params.visibility);
    if (params.favourite != null) httpParams = httpParams.set('favourite', String(params.favourite));
    if (params.showModerated != null) httpParams = httpParams.set('showModerated', String(params.showModerated));
    if (params.hasVoted != null) httpParams = httpParams.set('hasVoted', String(params.hasVoted));
    if (params.creatorId) httpParams = httpParams.set('creatorId', params.creatorId);
    if (params.orderBy) httpParams = httpParams.set('orderBy', params.orderBy);
    if (params.order) httpParams = httpParams.set('order', params.order);
    if (params.search) httpParams = httpParams.set('search', params.search);

    return this.http.get<ApiResponse<{ rows: Topic[]; count: number }>>(
      `${this.apiUrl}/api/users/self/topics`,
      { withCredentials: true, params: httpParams }
    ).pipe(map(res => ({ rows: res.data?.rows ?? [], countTotal: res.data?.count ?? 0 })));
  }
}
