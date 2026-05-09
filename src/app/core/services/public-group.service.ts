import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ConfigStore } from '../state/config.store';
import { ApiResponse } from '../interfaces/api-response';
import { Group } from '../interfaces/group';
import { ItemsListService, ListParams } from './items-list.service';

export interface PublicGroupParams extends ListParams {
  favourite?: boolean | string;
  country?: string;
  language?: string;
  name?: string;
}

@Injectable({ providedIn: 'root' })
export class PublicGroupService extends ItemsListService<PublicGroupParams, Group> {
  private http = inject(HttpClient);
  private configStore = inject(ConfigStore);

  private get apiUrl() {
    return this.configStore.api.baseUrl();
  }

  override getItems(params: PublicGroupParams): Observable<{ rows: Group[]; countTotal: number }> {
    let httpParams = new HttpParams()
      .set('limit', String(params.limit))
      .set('offset', String(params.offset ?? 0));

    if (params.favourite != null) httpParams = httpParams.set('favourite', String(params.favourite));
    if (params.country) httpParams = httpParams.set('country', params.country);
    if (params.language) httpParams = httpParams.set('language', params.language);
    if (params.name) httpParams = httpParams.set('name', params.name);
    if (params.orderBy) httpParams = httpParams.set('orderBy', params.orderBy);
    if (params.order) httpParams = httpParams.set('order', params.order);
    if (params.search) httpParams = httpParams.set('search', params.search);

    return this.http.get<ApiResponse<{ rows: Group[]; count: number }>>(
      `${this.apiUrl}/api/groups`,
      { withCredentials: true, params: httpParams }
    ).pipe(map(res => ({ rows: res.data?.rows ?? [], countTotal: res.data?.count ?? 0 })));
  }

  getPreview(limit: number): Observable<Group[]> {
    return this.http.get<ApiResponse<{ rows: Group[] }>>(
      `${this.apiUrl}/api/groups`,
      { withCredentials: true, params: { limit } }
    ).pipe(map(res => res.data?.rows ?? []));
  }
}
