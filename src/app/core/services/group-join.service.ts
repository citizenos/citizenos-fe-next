import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ConfigStore } from '../state/config.store';
import { ApiResponse } from '../interfaces/api-response';

@Injectable({ providedIn: 'root' })
export class GroupJoinService {
  private http = inject(HttpClient);
  private configStore = inject(ConfigStore);

  private get baseUrl() { return this.configStore.api.baseUrl(); }

  generateToken(groupId: string, level: string): Observable<any> {
    return this.http.put<ApiResponse<any>>(
      `${this.baseUrl}/api/users/self/groups/${groupId}/join`,
      { level }, { withCredentials: true }
    ).pipe(map(r => r.data));
  }

  updateLevel(groupId: string, token: string, level: string): Observable<any> {
    return this.http.put<ApiResponse<any>>(
      `${this.baseUrl}/api/users/self/groups/${groupId}/join`,
      { level, token }, { withCredentials: true }
    ).pipe(map(r => r.data));
  }
}
