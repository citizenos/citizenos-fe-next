import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ConfigStore } from '../state/config.store';
import { ApiResponse } from '../interfaces/api-response';
import { Group } from '../interfaces/group';
import { ItemsListService, ListParams } from './items-list.service';
import { UploadService } from './upload.service';

export interface UserGroupParams extends ListParams {
  visibility?: string;
  favourite?: boolean | string;
  creatorId?: string;
  country?: string;
  language?: string;
}

@Injectable({ providedIn: 'root' })
export class UserGroupService extends ItemsListService<UserGroupParams, Group> {
  private http = inject(HttpClient);
  private configStore = inject(ConfigStore);
  private uploadService = inject(UploadService);

  private get apiUrl() {
    return this.configStore.api.baseUrl();
  }

  override getItems(params: UserGroupParams): Observable<{ rows: Group[]; countTotal: number }> {
    let httpParams = new HttpParams()
      .set('limit', String(params.limit))
      .set('offset', String(params.offset ?? 0));

    if (params.visibility) httpParams = httpParams.set('visibility', params.visibility);
    if (params.favourite != null) httpParams = httpParams.set('favourite', String(params.favourite));
    if (params.creatorId) httpParams = httpParams.set('creatorId', params.creatorId);
    if (params.country) httpParams = httpParams.set('country', params.country);
    if (params.language) httpParams = httpParams.set('language', params.language);
    if (params.orderBy) httpParams = httpParams.set('orderBy', params.orderBy);
    if (params.order) httpParams = httpParams.set('order', params.order);
    if (params.search) httpParams = httpParams.set('search', params.search);

    return this.http.get<ApiResponse<{ rows: Group[]; count: number; countTotal: number }>>(
      `${this.apiUrl}/api/users/self/groups`,
      { withCredentials: true, params: httpParams }
    ).pipe(map(res => ({ rows: res.data?.rows ?? [], countTotal: res.data?.countTotal ?? 0 })));
  }

  getPreview(limit: number): Observable<Group[]> {
    return this.http.get<ApiResponse<{ rows: Group[] }>>(
      `${this.apiUrl}/api/users/self/groups`,
      { withCredentials: true, params: { limit } }
    ).pipe(map(res => res.data?.rows ?? []));
  }

  save(data: Partial<Group>): Observable<Group> {
    return this.http.post<ApiResponse<Group>>(
      `${this.apiUrl}/api/users/self/groups`,
      data,
      { withCredentials: true }
    ).pipe(map(res => res.data!));
  }

  uploadGroupImage(file: File, groupId: string): Observable<unknown> {
    return this.uploadService.upload(`${this.apiUrl}/api/users/self/groups/${groupId}/image`, file);
  }
}
