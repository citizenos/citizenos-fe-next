import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ConfigStore } from '../state/config.store';
import { UserStore } from '../state/user.store';
import { ApiResponse } from '../interfaces/api-response';
import { ItemsListService, ListParams } from './items-list.service';
import { TopicNotificationSettings } from '../interfaces/topic-notification-settings';

@Injectable({
  providedIn: 'root'
})
export class TopicNotificationService extends ItemsListService<ListParams, TopicNotificationSettings> {
  private http = inject(HttpClient);
  private configStore = inject(ConfigStore);
  private userStore = inject(UserStore);

  private get apiUrl() {
    return this.configStore.api.baseUrl();
  }

  private getAbsoluteUrlApi(path: string): string {
    if (path.startsWith('/api/users/self')) {
      if (!this.userStore.isAuthenticated()) {
        path = path.replace('/api/users/self', '/api');
      }
    } else if (path.startsWith('/api/topics')) {
      if (this.userStore.isAuthenticated()) {
        path = path.replace('/api/topics', '/api/users/self/topics');
      }
    }
    return `${this.apiUrl}${path}`;
  }

  override getItems(params: ListParams): Observable<{ rows: TopicNotificationSettings[]; countTotal: number }> {
    const path = this.getAbsoluteUrlApi('/api/users/self/notificationsettings/topics');
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val != null) {
        httpParams = httpParams.set(key, String(val));
      }
    });

    return this.http.get<ApiResponse<{ rows: TopicNotificationSettings[]; count: number }>>(path, { 
      withCredentials: true, 
      params: httpParams
    }).pipe(
      map(res => ({ rows: res.data?.rows ?? [], countTotal: res.data?.count ?? 0 }))
    );
  }

  get(topicId: string): Observable<TopicNotificationSettings> {
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${topicId}/notificationsettings`);
    return this.http.get<ApiResponse<TopicNotificationSettings>>(path, { withCredentials: true }).pipe(
      map(res => res.data)
    );
  }

  delete(topicId: string): Observable<unknown> {
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${topicId}/notificationsettings`);
    return this.http.delete<ApiResponse<unknown>>(path, { withCredentials: true }).pipe(
      map(res => res.data)
    );
  }

  update(topicId: string, data: Record<string, unknown>): Observable<unknown> {
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${topicId}/notificationsettings`);
    return this.http.put<ApiResponse<unknown>>(path, data, { withCredentials: true }).pipe(
      map(res => res.data)
    );
  }
}
