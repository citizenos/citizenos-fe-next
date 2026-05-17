import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ConfigStore } from '../state/config.store';
import { UserStore } from '../state/user.store';
import { ApiResponse } from '../interfaces/api-response';
import { Group } from '../interfaces/group';

export interface GroupJoin {
  token: string;
  level: string;
}

@Injectable({ providedIn: 'root' })
export class GroupJoinService {
  private http = inject(HttpClient);
  private configStore = inject(ConfigStore);
  private userStore = inject(UserStore);

  private get baseUrl() { return this.configStore.api.baseUrl(); }

  private getAbsoluteUrlApi(path: string): string {
    const prefix = this.userStore.isAuthenticated() ? '/api/users/self' : '/api';
    return `${this.baseUrl}${prefix}${path}`;
  }

  get(token: string): Observable<Group> {
    return this.http.get<ApiResponse<Group>>(
      this.getAbsoluteUrlApi(`/groups/join/${token}`),
      { withCredentials: true }
    ).pipe(map(res => res.data!));
  }

  join(token: string): Observable<Group> {
    return this.http.post<ApiResponse<Group>>(
      this.getAbsoluteUrlApi(`/groups/join/${token}`),
      {}, { withCredentials: true }
    ).pipe(map(res => res.data!));
  }

  joinPublic(groupId: string): Observable<any> {
    return this.http.post<ApiResponse<any>>(
      this.getAbsoluteUrlApi(`/groups/${groupId}/join`),
      {}, { withCredentials: true }
    ).pipe(map(res => res.data));
  }

  save(groupId: string, userId: string, level: string | null): Observable<GroupJoin> {
    return this.http.put<ApiResponse<GroupJoin>>(
      this.getAbsoluteUrlApi(`/groups/${groupId}/join`),
      { userId, level }, { withCredentials: true }
    ).pipe(map(res => res.data!));
  }

  update(groupId: string, token: string, level: string): Observable<unknown> {
    return this.http.put<ApiResponse<unknown>>(
      this.getAbsoluteUrlApi(`/groups/${groupId}/join/${token}`),
      { level }, { withCredentials: true }
    ).pipe(map(res => res.data));
  }

  generateToken(groupId: string, level: string): Observable<{ token: string }> {
    return this.http.post<ApiResponse<{ token: string }>>(
      this.getAbsoluteUrlApi(`/groups/${groupId}/join`),
      { level }, { withCredentials: true }
    ).pipe(map(res => res.data!));
  }

  updateLevel(groupId: string, token: string, level: string): Observable<unknown> {
    return this.update(groupId, token, level);
  }
}
