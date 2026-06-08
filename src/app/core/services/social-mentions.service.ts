import { Service, inject  } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { ItemsListService, ListParams } from './items-list.service';
import { ConfigStore } from '../state/config.store';
import { UserStore } from '../state/user.store';
import { ApiResponse } from '../interfaces/api-response';

export interface SocialMentionParams extends ListParams {
  topicId: string;
}

export interface SocialMention {
  id: string;
  topicId: string;
  source: string;
  url: string;
  text: string;
  author: {
    name: string;
    image?: string;
  };
  createdAt: string;
}

@Service()
export class SocialMentionsService extends ItemsListService<SocialMentionParams, SocialMention> {
  private http = inject(HttpClient);
  private configStore = inject(ConfigStore);
  private userStore = inject(UserStore);

  private get apiUrl() {
    return this.configStore.api.baseUrl();
  }

  constructor() {
    super();
    this.setDefaults({ limit: 10, offset: 0 });
  }

  override getItems(params: SocialMentionParams): Observable<{ rows: SocialMention[]; countTotal: number }> {
    if (!params.topicId) return of({ rows: [], countTotal: 0 });
    
    const path = this.getAbsoluteUrlApi(`/topics/${params.topicId}/mentions`);
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        httpParams = httpParams.set(key, String(params[key]));
      }
    });

    return this.http.get<ApiResponse<{ rows: SocialMention[]; count: number }>>(path, { withCredentials: true, params: httpParams }).pipe(
      map(res => ({
        rows: res.data?.rows ?? [],
        countTotal: res.data?.count ?? 0
      }))
    );
  }

  private getAbsoluteUrlApi(path: string): string {
    const prefix = this.userStore.isAuthenticated() ? '/api/users/self' : '/api';
    return `${this.apiUrl}${prefix}${path}`;
  }
}
