import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ConfigStore } from '../state/config.store';
import { ApiResponse } from '../interfaces/api-response';

export interface GroupMember {
  id: string;
  userId?: string;
  name: string;
  email?: string;
  imageUrl?: string | null;
  level: string;
  invite?: { id: string; level: string };
}

@Injectable({ providedIn: 'root' })
export class GroupMemberUserService {
  private http = inject(HttpClient);
  private configStore = inject(ConfigStore);

  private get baseUrl() { return this.configStore.api.baseUrl(); }

  LEVELS = ['read', 'admin'];

  loadMembers(groupId: string, params: { limit: number; offset: number; search?: string; include?: string }): Observable<{ rows: GroupMember[]; count: number }> {
    let httpParams = new HttpParams()
      .set('limit', String(params.limit))
      .set('offset', String(params.offset));

    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.include) httpParams = httpParams.set('include', params.include);

    return this.http.get<ApiResponse<{ rows: GroupMember[]; count: number }>>(
      `${this.baseUrl}/api/users/self/groups/${groupId}/members/users`,
      { withCredentials: true, params: httpParams }
    ).pipe(map(res => ({ rows: res.data?.rows ?? [], count: res.data?.count ?? 0 })));
  }

  updateLevel(groupId: string, userId: string, level: string): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/api/users/self/groups/${groupId}/members/users/${userId}`,
      { level },
      { withCredentials: true }
    );
  }

  removeMember(groupId: string, userId: string): Observable<any> {
    return this.http.delete(
      `${this.baseUrl}/api/users/self/groups/${groupId}/members/users/${userId}`,
      { withCredentials: true }
    );
  }
}
