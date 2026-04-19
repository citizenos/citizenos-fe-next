import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ConfigStore } from '../state/config.store';
import { ApiResponse } from '../interfaces/api-response';

@Injectable({ providedIn: 'root' })
export class ActivityService {
  private http = inject(HttpClient);
  private configStore = inject(ConfigStore);

  private get apiUrl() {
    return this.configStore.api.baseUrl();
  }

  getUnreadCount(params?: { groupId?: string; topicId?: string }): Observable<number> {
    let url: string;
    if (params?.groupId) {
      url = `${this.apiUrl}/api/groups/${params.groupId}/activities/unread`;
    } else if (params?.topicId) {
      url = `${this.apiUrl}/api/topics/${params.topicId}/activities/unread`;
    } else {
      url = `${this.apiUrl}/api/users/self/activities/unread`;
    }
    return this.http.get<ApiResponse<{ count: number }>>(url, { withCredentials: true })
      .pipe(map(res => res.data?.count ?? 0));
  }
}
