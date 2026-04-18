import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ConfigStore } from '../state/config.store';
import { ApiResponse } from '../interfaces/api-response';
import { ItemsListService, ListParams } from './items-list.service';

@Injectable({
  providedIn: 'root'
})
export class TopicNotificationService extends ItemsListService {
  private http = inject(HttpClient);
  private configStore = inject(ConfigStore);

  private get apiUrl() {
    return this.configStore.api.baseUrl();
  }

  getItems(params: ListParams): Observable<any> {
    const path = `${this.apiUrl}/api/users/self/notificationsettings/topics`;
    const queryParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== null && v !== undefined)
    );

    return this.http.get<ApiResponse>(path, { 
      withCredentials: true, 
      params: queryParams 
    }).pipe(
      map(res => res.data)
    );
  }

  get(topicId: string): Observable<any> {
    const path = `${this.apiUrl}/api/users/self/topics/${topicId}/notificationsettings`;
    return this.http.get<ApiResponse>(path, { withCredentials: true }).pipe(
      map(res => res.data)
    );
  }

  delete(topicId: string): Observable<any> {
    const path = `${this.apiUrl}/api/users/self/topics/${topicId}/notificationsettings`;
    return this.http.delete<ApiResponse>(path, { withCredentials: true }).pipe(
      map(res => res.data)
    );
  }

  update(topicId: string, data: any): Observable<any> {
    const path = `${this.apiUrl}/api/users/self/topics/${topicId}/notificationsettings`;
    return this.http.put<ApiResponse>(path, data, { withCredentials: true }).pipe(
      map(res => res.data)
    );
  }
}
