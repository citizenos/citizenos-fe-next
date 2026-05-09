import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ConfigStore } from '../state/config.store';
import { ApiResponse } from '../interfaces/api-response';
import { ItemsListService, ListParams } from './items-list.service';

@Injectable({
  providedIn: 'root'
})
export class TopicNotificationService extends ItemsListService<ListParams, unknown> {
  private http = inject(HttpClient);
  private configStore = inject(ConfigStore);

  private get apiUrl() {
    return this.configStore.api.baseUrl();
  }

  override getItems(params: ListParams): Observable<{ rows: unknown[]; countTotal: number }> {
    const path = `${this.apiUrl}/api/users/self/notificationsettings/topics`;
    const queryParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== null && v !== undefined)
    );

    return this.http.get<ApiResponse<{ rows: unknown[]; count: number }>>(path, { 
      withCredentials: true, 
      params: queryParams as Record<string, string | number | boolean>
    }).pipe(
      map(res => ({ rows: res.data?.rows ?? [], countTotal: res.data?.count ?? 0 }))
    );
  }

  get(topicId: string): Observable<unknown> {
    const path = `${this.apiUrl}/api/users/self/topics/${topicId}/notificationsettings`;
    return this.http.get<ApiResponse<unknown>>(path, { withCredentials: true }).pipe(
      map(res => res.data)
    );
  }

  delete(topicId: string): Observable<unknown> {
    const path = `${this.apiUrl}/api/users/self/topics/${topicId}/notificationsettings`;
    return this.http.delete<ApiResponse<unknown>>(path, { withCredentials: true }).pipe(
      map(res => res.data)
    );
  }

  update(topicId: string, data: Record<string, unknown>): Observable<unknown> {
    const path = `${this.apiUrl}/api/users/self/topics/${topicId}/notificationsettings`;
    return this.http.put<ApiResponse<unknown>>(path, data, { withCredentials: true }).pipe(
      map(res => res.data)
    );
  }
}
