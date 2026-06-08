import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ApiResponse } from '../interfaces/api-response';
import { ConfigStore } from '../state/config.store';
import { UserStore } from '../state/user.store';
import { Group } from '../interfaces/group';

export interface GroupJoin {
  token: string;
  level: string;
}

@Service()
export class GroupJoinService {
  private http = inject(HttpClient);
  private configStore = inject(ConfigStore);
  private userStore = inject(UserStore);

  private get baseUrl() { return this.configStore.api.baseUrl(); }

  private getAbsoluteUrlApi(path: string, forceAuthorized = false): string {
    const isPublicPath = !forceAuthorized && (
      path.includes('/join/')
    );
    const prefix = (this.userStore.isAuthenticated() && !isPublicPath) ? '/api/users/self' : '/api';
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

  joinPublic(groupId: string): Observable<unknown> {
    return this.http.post<ApiResponse<unknown>>(
      this.getAbsoluteUrlApi(`/groups/${groupId}/join`, true),
      {}, { withCredentials: true }
    ).pipe(map(res => res.data));
  }

  save(groupId: string, userId: string, level: string | null): Observable<GroupJoin> {
    return this.http.put<ApiResponse<GroupJoin>>(
      this.getAbsoluteUrlApi(`/groups/${groupId}/join`, true),
      { userId, level }, { withCredentials: true }
    ).pipe(map(res => res.data!));
  }

  update(groupId: string, token: string, level: string): Observable<unknown> {
    return this.http.put<ApiResponse<unknown>>(
      this.getAbsoluteUrlApi(`/groups/${groupId}/join/${token}`, true),
      { level }, { withCredentials: true }
    ).pipe(map(res => res.data));
  }

  generateToken(groupId: string, level: string): Observable<{ token: string }> {
    return this.http.post<ApiResponse<{ token: string }>>(
      this.getAbsoluteUrlApi(`/groups/${groupId}/join`, true),
      { level }, { withCredentials: true }
    ).pipe(map(res => res.data!));
  }

  updateLevel(groupId: string, token: string, level: string): Observable<unknown> {
    return this.update(groupId, token, level);
  }
}
