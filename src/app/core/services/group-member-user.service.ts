import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ConfigStore } from '../state/config.store';
import { UserStore } from '../state/user.store';
import { ApiResponse } from '../interfaces/api-response';
import { User } from '../interfaces/user';

export interface GroupMemberUser extends Partial<User> {
  id: string;
  name: string;
  email?: string;
  imageUrl?: string;
  level: string;
  userId?: string;
  invite?: {
    id: string;
    level: string;
  };
}

export interface GroupMember extends GroupMemberUser {}

@Injectable({ providedIn: 'root' })
export class GroupMemberUserService {
  private http = inject(HttpClient);
  private configStore = inject(ConfigStore);
  private userStore = inject(UserStore);

  private get baseUrl() { return this.configStore.api.baseUrl(); }

  private getAbsoluteUrlApi(path: string, forceAuthorized = false): string {
    const isPublicPath = !forceAuthorized && (
      path.includes('/members/users')
    );
    const prefix = (this.userStore.isAuthenticated() && !isPublicPath) ? '/api/users/self' : '/api';
    return `${this.baseUrl}${prefix}${path}`;
  }

  readonly LEVELS = {
    read: 'read',
    admin: 'admin'
  };

  loadItems(groupId: string): Observable<GroupMemberUser[]> {
    return this.http.get<ApiResponse<GroupMemberUser[]>>(
      this.getAbsoluteUrlApi(`/groups/${groupId}/members/users`),
      { withCredentials: true }
    ).pipe(map(res => res.data ?? []));
  }

  loadMembers(groupId: string, params: Record<string, string | number | boolean> = {}): Observable<{ rows: GroupMemberUser[]; count: number }> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val != null) httpParams = httpParams.set(key, String(val));
    });
    return this.http.get<ApiResponse<{ rows: GroupMemberUser[]; count: number }>>(
      this.getAbsoluteUrlApi(`/groups/${groupId}/members/users`),
      { withCredentials: true, params: httpParams }
    ).pipe(map(res => res.data ?? { rows: [], count: 0 }));
  }

  update(groupId: string, userId: string, level: string): Observable<unknown> {
    return this.http.put<ApiResponse<unknown>>(
      this.getAbsoluteUrlApi(`/groups/${groupId}/members/users/${userId}`, true),
      { level }, { withCredentials: true }
    ).pipe(map(res => res.data));
  }

  updateLevel(groupId: string, userId: string, level: string): Observable<unknown> {
    return this.update(groupId, userId, level);
  }

  delete(groupId: string, userId: string): Observable<unknown> {
    return this.http.delete<ApiResponse<unknown>>(
      this.getAbsoluteUrlApi(`/groups/${groupId}/members/users/${userId}`, true),
      { withCredentials: true }
    ).pipe(map(res => res.data));
  }

  removeMember(groupId: string, userId: string): Observable<unknown> {
    return this.delete(groupId, userId);
  }
}
