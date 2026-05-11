import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ConfigStore } from '../state/config.store';
import { ApiResponse } from '../interfaces/api-response';

export interface GroupInvite {
  userId: string;
  level: string;
  inviteMessage?: string;
}

export interface GroupInvitation {
  id: string;
  inviteId?: string;
  creator: { id: string; name: string; imageUrl?: string };
  user: { id: string; email: string; isRegistered: boolean };
  group: { id: string; name: string; description: string; visibility: string; imageUrl?: string };
  level: string;
}

@Injectable({ providedIn: 'root' })
export class GroupInviteUserService {
  private http = inject(HttpClient);
  private configStore = inject(ConfigStore);

  private get baseUrl() { return this.configStore.api.baseUrl(); }

  LEVELS = ['read', 'admin'];

  invite(groupId: string, invites: GroupInvite[]): Observable<unknown> {
    return this.http.post<ApiResponse<unknown>>(
      `${this.baseUrl}/api/users/self/groups/${groupId}/invites/users`,
      invites, { withCredentials: true }
    ).pipe(map(r => r.data));
  }

  updateInvite(groupId: string, inviteId: string, level: string): Observable<unknown> {
    return this.http.put<ApiResponse<unknown>>(
      `${this.baseUrl}/api/users/self/groups/${groupId}/invites/users/${inviteId}`,
      { level }, { withCredentials: true }
    ).pipe(map(r => r.data));
  }

  deleteInvite(groupId: string, inviteId: string): Observable<unknown> {
    return this.http.delete(
      `${this.baseUrl}/api/users/self/groups/${groupId}/invites/users/${inviteId}`,
      { withCredentials: true }
    );
  }

  get(params: { groupId: string; inviteId: string }): Observable<GroupInvitation> {
    return this.http.get<ApiResponse<GroupInvitation>>(
      `${this.baseUrl}/api/users/self/groups/${params.groupId}/invites/users/${params.inviteId}`,
      { withCredentials: true }
    ).pipe(map(r => r.data));
  }

  accept(params: { groupId: string; inviteId: string }): Observable<unknown> {
    return this.http.post<ApiResponse<unknown>>(
      `${this.baseUrl}/api/users/self/groups/${params.groupId}/invites/users/${params.inviteId}/accept`,
      {}, { withCredentials: true }
    ).pipe(map(r => r.data));
  }
}
