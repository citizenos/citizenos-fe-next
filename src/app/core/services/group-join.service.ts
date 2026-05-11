import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ConfigStore } from '../state/config.store';
import { ApiResponse } from '../interfaces/api-response';
import { Group } from '../interfaces/group';

@Injectable({ providedIn: 'root' })
export class GroupJoinService {
  private http = inject(HttpClient);
  private configStore = inject(ConfigStore);

  private get baseUrl() { return this.configStore.api.baseUrl(); }

  generateToken(groupId: string, level: string): Observable<{ token: string, level: string }> {
    return this.http.put<ApiResponse<{ token: string, level: string }>>(
      `${this.baseUrl}/api/users/self/groups/${groupId}/join`,
      { level }, { withCredentials: true }
    ).pipe(map(r => r.data!));
  }

  updateLevel(groupId: string, token: string, level: string): Observable<unknown> {
    return this.http.put<ApiResponse<unknown>>(
      `${this.baseUrl}/api/users/self/groups/${groupId}/join`,
      { level, token }, { withCredentials: true }
    ).pipe(map(r => r.data));
  }

  get(token: string): Observable<Group> {
    return this.http.get<ApiResponse<Group>>(
      `${this.baseUrl}/api/groups/join/${token}`,
      { withCredentials: true }
    ).pipe(map(r => r.data!));
  }

  join(token: string): Observable<Group> {
    return this.http.post<ApiResponse<Group>>(
      `${this.baseUrl}/api/groups/join/${token}`,
      {}, { withCredentials: true }
    ).pipe(map(r => r.data!));
  }

  joinPublic(groupId: string): Observable<Group> {
    return this.http.post<ApiResponse<Group>>(
      `${this.baseUrl}/api/users/self/groups/${groupId}/join`,
      {}, { withCredentials: true }
    ).pipe(map(r => r.data!));
  }
}
