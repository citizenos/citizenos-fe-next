import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject, map, exhaustMap, shareReplay } from 'rxjs';

import { ItemsListService, ListParams } from './items-list.service';
import { ConfigStore } from '../state/config.store';
import { UserStore } from '../state/user.store';
import { ApiResponse } from '../interfaces/api-response';
import { TopicEvent } from '../interfaces/topic-event';

export interface TopicEventParams extends ListParams {
  topicId?: string | null;
}

export interface TopicEventListResponse {
  rows: TopicEvent[];
  count: number;
}

@Injectable({
  providedIn: 'root'
})
export class TopicEventService extends ItemsListService {
  private http = inject(HttpClient);
  private configStore = inject(ConfigStore);
  private userStore = inject(UserStore);

  public loadEvents$ = new Subject<void>();

  private get apiUrl() {
    return this.configStore.api.baseUrl();
  }

  loadEvents(params: TopicEventParams): Observable<TopicEvent[]> {
    return this.loadEvents$.pipe(
      exhaustMap(() => this.getItems(params).pipe(map(res => res.rows))),
      shareReplay(1)
    );
  }

  reloadEvents(): void {
    this.loadEvents$.next();
  }

  override getItems(params: TopicEventParams): Observable<TopicEventListResponse> {
    let httpParams = new HttpParams()
      .set('limit', String(params.limit))
      .set('offset', String(params.offset ?? 0));
    
    // Add other params to HttpParams dynamically if needed.
    Object.keys(params).forEach(key => {
      const val = (params as unknown as Record<string, unknown>)[key];
      if (key !== 'limit' && key !== 'offset' && key !== 'topicId' && val !== null) {
        httpParams = httpParams.set(key, String(val));
      }
    });

    const path = this.getAbsoluteUrlApi(`/topics/${params.topicId}/events`);
    return this.http.get<ApiResponse<TopicEventListResponse>>(path, { withCredentials: true, params: httpParams, observe: 'body', responseType: 'json' })
      .pipe(map(res => ({ rows: res.data?.rows ?? [], count: res.data?.count ?? 0 })));
  }

  queryPublic(params: Record<string, unknown>): Observable<TopicEventListResponse> {
    const path = this.getAbsoluteUrlApi('/topics');
    const queryParams = Object.fromEntries(Object.entries(params).filter((i) => i[1] !== null));

    return this.http.get<ApiResponse<TopicEventListResponse>>(path, { withCredentials: true, params: queryParams as Record<string, string>, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data!));
  }

  query(params: Record<string, unknown>): Observable<TopicEventListResponse> {
    const path = this.getAbsoluteUrlApi(`/topics/${params['topicId']}/events`);
    const queryParams = Object.fromEntries(Object.entries(params).filter((i) => i[1] !== null));
    
    return this.http.get<ApiResponse<TopicEventListResponse>>(path, { withCredentials: true, params: queryParams as Record<string, string>, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data!));
  }

  save(data: { topicId: string; [key: string]: unknown }): Observable<TopicEvent> {
    const path = this.getAbsoluteUrlApi(`/topics/${data.topicId}/events`);
    return this.http.post<ApiResponse<TopicEvent>>(path, data, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data!));
  }

  update(data: { topicId: string; eventId?: string; id?: string; [key: string]: unknown }): Observable<TopicEvent> {
    const eventId = data.eventId || data.id;
    const path = this.getAbsoluteUrlApi(`/topics/${data.topicId}/events/${eventId}`);
    return this.http.put<ApiResponse<TopicEvent>>(path, data, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data!));
  }

  delete(data: { topicId: string; eventId?: string; id?: string }): Observable<unknown> {
    const eventId = data.eventId || data.id;
    const path = this.getAbsoluteUrlApi(`/topics/${data.topicId}/events/${eventId}`);
    return this.http.delete<ApiResponse<unknown>>(path, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  private getAbsoluteUrlApi(path: string): string {
    const prefix = this.userStore.isAuthenticated() ? '/api/users/self' : '/api';
    return `${this.apiUrl}${prefix}${path}`;
  }
}
