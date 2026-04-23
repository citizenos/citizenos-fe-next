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

@Injectable({ providedIn: 'root' })
export class GroupInviteUserService {
  private http = inject(HttpClient);
  private configStore = inject(ConfigStore);

  private get baseUrl() { return this.configStore.api.baseUrl(); }

  LEVELS = ['read', 'admin'];

  invite(groupId: string, invites: GroupInvite[]): Observable<any> {
    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/api/users/self/groups/${groupId}/invites/users`,
      invites, { withCredentials: true }
    ).pipe(map(r => r.data));
  }
}
