import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ConfigStore } from '../state/config.store';
import { ApiResponse } from '../interfaces/api-response';
import { Topic } from '../interfaces/topic';

@Injectable({ providedIn: 'root' })
export class PublicTopicService {
  private http = inject(HttpClient);
  private configStore = inject(ConfigStore);

  private get apiUrl() {
    return this.configStore.api.baseUrl();
  }

  loadItems(limit = 26): Observable<Topic[]> {
    return this.http.get<ApiResponse<{ rows: Topic[] }>>(
      `${this.apiUrl}/api/topics`,
      { withCredentials: true, params: { limit, offset: 0 } }
    ).pipe(map(res => res.data?.rows ?? []));
  }
}
