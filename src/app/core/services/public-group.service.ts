import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ConfigStore } from '../state/config.store';
import { ApiResponse } from '../interfaces/api-response';
import { Group } from '../interfaces/group';

@Injectable({ providedIn: 'root' })
export class PublicGroupService {
  private http = inject(HttpClient);
  private configStore = inject(ConfigStore);

  private get apiUrl() {
    return this.configStore.api.baseUrl();
  }

  loadItems(limit = 8): Observable<Group[]> {
    return this.http.get<ApiResponse<{ rows: Group[] }>>(
      `${this.apiUrl}/api/groups`,
      { withCredentials: true, params: { limit, offset: 0 } }
    ).pipe(map(res => res.data?.rows ?? []));
  }
}
