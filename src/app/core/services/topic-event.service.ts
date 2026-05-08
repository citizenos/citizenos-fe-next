import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject, map, exhaustMap, shareReplay } from 'rxjs';

import { ItemsListService, ListParams } from './items-list.service';
import { ConfigStore } from '../state/config.store';
import { ApiResponse } from '../interfaces/api-response';

export interface TopicEventParams extends ListParams {
  topicId?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class TopicEventService extends ItemsListService {
  private http = inject(HttpClient);
  private configStore = inject(ConfigStore);

  public loadEvents$ = new Subject<void>();

  private get apiUrl() {
    return this.configStore.api.baseUrl();
  }

  loadEvents(params: any): Observable<any[]> {
    return this.loadEvents$.pipe(
      exhaustMap(() => this.getItems(params)),
      shareReplay(1)
    );
  }

  reloadEvents(): void {
    this.loadEvents$.next();
  }

  override getItems(params: TopicEventParams): Observable<any> {
    let httpParams = new HttpParams()
      .set('limit', String(params.limit))
      .set('offset', String(params.offset ?? 0));
    
    // Add other params to HttpParams dynamically if needed.
    Object.keys(params).forEach(key => {
      if (key !== 'limit' && key !== 'offset' && key !== 'topicId' && (params as any)[key] !== null) {
        httpParams = httpParams.set(key, (params as any)[key]);
      }
    });

    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${params.topicId}/events`);
    return this.http.get<ApiResponse<any>>(path, { withCredentials: true, params: httpParams, observe: 'body', responseType: 'json' })
      .pipe(map(res => ({ rows: res.data?.rows ?? res.data ?? [], count: res.data?.count ?? 0 })));
  }

  queryPublic(params: Record<string, any>): Observable<any> {
    const path = this.getAbsoluteUrlApi('/api/topics');
    const queryParams = Object.fromEntries(Object.entries(params).filter((i) => i[1] !== null));

    return this.http.get<ApiResponse<any>>(path, { withCredentials: true, params: queryParams, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  query(params: Record<string, any>): Observable<any> {
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${params['topicId']}/events`);
    const queryParams = Object.fromEntries(Object.entries(params).filter((i) => i[1] !== null));
    
    return this.http.get<ApiResponse<any>>(path, { withCredentials: true, params: queryParams, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  save(data: any): Observable<any> {
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${data.topicId}/events`);
    return this.http.post<ApiResponse<any>>(path, data, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  update(data: any): Observable<any> {
    const eventId = data.eventId || data.id;
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${data.topicId}/events/${eventId}`);
    return this.http.put<ApiResponse<any>>(path, data, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  delete(data: any): Observable<any> {
    const eventId = data.eventId || data.id;
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${data.topicId}/events/${eventId}`);
    return this.http.delete<ApiResponse<any>>(path, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  private getAbsoluteUrlApi(path: string): string {
    return `${this.apiUrl}${path}`;
  }
}
