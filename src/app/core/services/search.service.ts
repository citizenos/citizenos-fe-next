import { Service, inject  } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ConfigStore } from '../state/config.store';
import { UserStore } from '../state/user.store';
import { ApiResponse } from '../interfaces/api-response';

import { SearchResults } from '../interfaces/search';

@Service()
export class SearchService {
  private http = inject(HttpClient);
  private configStore = inject(ConfigStore);
  private userStore = inject(UserStore);

  private get apiUrl() {
    return this.configStore.api.baseUrl();
  }

  private getAbsoluteUrlApi(path: string): string {
    const prefix = this.userStore.isAuthenticated() ? '/api/users/self' : '/api';
    return `${this.apiUrl}${prefix}${path}`;
  }

  searchUsers(str: string): Observable<SearchResults> {
    const params = new HttpParams().set('str', str);
    return this.http.get<ApiResponse<SearchResults>>(
      this.getAbsoluteUrlApi('/search/users'),
      { withCredentials: true, params }
    ).pipe(map(res => res.data));
  }

  search(str: string, options: Record<string, string | number | boolean> = {}): Observable<SearchResults> {
    let params = new HttpParams().set('str', str);
    Object.keys(options).forEach(key => {
      params = params.set(key, String(options[key]));
    });

    return this.http.get<ApiResponse<SearchResults>>(
      this.getAbsoluteUrlApi('/search'),
      { withCredentials: true, params }
    ).pipe(map(res => res.data));
  }
}
