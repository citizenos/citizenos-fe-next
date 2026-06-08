import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ConfigStore } from '../state/config.store';
import { ApiResponse } from '../interfaces/api-response';
import { News } from '../interfaces/news';

@Service()
export class NewsService {
  private http = inject(HttpClient);
  private configStore = inject(ConfigStore);

  private get apiUrl() {
    return this.configStore.api.baseUrl();
  }

  get(): Observable<News[]> {
    return this.http.get<ApiResponse<{ items: News[] }>>(
      `${this.apiUrl}/api/news`,
      { withCredentials: true }
    ).pipe(map(res => res.data?.items ?? []));
  }
}
