import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ConfigStore } from '../state/config.store';
import { UserStore } from '../state/user.store';
import { ApiResponse } from '../interfaces/api-response';

export interface GroupInvite {
  id: string;
  groupId: string;
  user: { id: string; name: string; email?: string; imageUrl?: string; isRegistered?: boolean };
  group: { id: string; name: string; description?: string; imageUrl?: string; visibility: string };
  creator: { id: string; name: string; imageUrl?: string };
  level: string;
  createdAt: string;
  inviteId?: string;
}

export interface GroupInvitation extends GroupInvite {}

@Injectable({ providedIn: 'root' })
export class GroupInviteUserService {
  private http = inject(HttpClient);
  private configStore = inject(ConfigStore);
  private userStore = inject(UserStore);

  private get baseUrl() { return this.configStore.api.baseUrl(); }

  private getAbsoluteUrlApi(path: string, forceAuthorized = false): string {
    const isPublicPath = !forceAuthorized && (
      path.includes('/invites/users/')
    );
    const prefix = (this.userStore.isAuthenticated() && !isPublicPath) ? '/api/users/self' : '/api';
    return `${this.baseUrl}${prefix}${path}`;
  }

  readonly LEVELS = {
    read: 'read',
    admin: 'admin'
  };

  loadItems(groupId: string): Observable<GroupInvite[]> {
    return this.http.get<ApiResponse<GroupInvite[]>>(
      this.getAbsoluteUrlApi(`/groups/${groupId}/invites/users`, true),
      { withCredentials: true }
    ).pipe(map(res => res.data ?? []));
  }

  save(groupId: string, data: Partial<GroupInvite>[]): Observable<unknown> {
    return this.http.post<ApiResponse<unknown>>(
      this.getAbsoluteUrlApi(`/groups/${groupId}/invites/users`, true),
      data, { withCredentials: true }
    ).pipe(map(res => res.data));
  }

  invite(groupId: string, data: Partial<GroupInvite>[]): Observable<unknown> {
    return this.save(groupId, data);
  }

  delete(groupId: string, inviteId: string): Observable<unknown> {
    return this.http.delete<ApiResponse<unknown>>(
      this.getAbsoluteUrlApi(`/groups/${groupId}/invites/users/${inviteId}`, true),
      { withCredentials: true }
    ).pipe(map(res => res.data));
  }

  deleteInvite(groupId: string, inviteId: string): Observable<unknown> {
    return this.delete(groupId, inviteId);
  }

  update(groupId: string, inviteId: string, level: string): Observable<unknown> {
    return this.http.put<ApiResponse<unknown>>(
      this.getAbsoluteUrlApi(`/groups/${groupId}/invites/users/${inviteId}`, true),
      { level }, { withCredentials: true }
    ).pipe(map(res => res.data));
  }

  updateInvite(groupId: string, inviteId: string, level: string): Observable<unknown> {
    return this.update(groupId, inviteId, level);
  }

  get(params: { groupId: string; inviteId: string }): Observable<GroupInvite> {
    return this.http.get<ApiResponse<GroupInvite>>(
      this.getAbsoluteUrlApi(`/groups/${params.groupId}/invites/users/${params.inviteId}`),
      { withCredentials: true }
    ).pipe(map(res => res.data));
  }

  accept(data: { groupId: string; inviteId: string }): Observable<unknown> {
    return this.http.post<ApiResponse<unknown>>(
      this.getAbsoluteUrlApi(`/groups/${data.groupId}/invites/users/${data.inviteId}/accept`),
      {}, { withCredentials: true }
    ).pipe(map(res => res.data));
  }
}
