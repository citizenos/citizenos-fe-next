import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { UploadService } from './upload.service';
import { ConfigStore } from '../state/config.store';
import { UserStore } from '../state/user.store';
import { ApiResponse } from '../interfaces/api-response';
import { Group } from '../interfaces/group';

@Injectable({ providedIn: 'root' })
export class GroupDetailService {
  private http = inject(HttpClient);
  private configStore = inject(ConfigStore);
  private userStore = inject(UserStore);
  private uploadService = inject(UploadService);

  private get baseUrl() { return this.configStore.api.baseUrl(); }

  VISIBILITY = { public: 'public', private: 'private' };

  loadGroup(groupId: string): Observable<Group> {
    const isLoggedIn = this.userStore.isAuthenticated();
    const url = isLoggedIn
      ? `${this.baseUrl}/api/users/self/groups/${groupId}`
      : `${this.baseUrl}/api/groups/${groupId}`;
    return this.http.get<ApiResponse<Group>>(url, { withCredentials: true })
      .pipe(map(res => res.data!));
  }

  addFavourite(groupId: string): Observable<unknown> {
    return this.http.post<ApiResponse<unknown>>(`${this.baseUrl}/api/users/self/groups/${groupId}/favourite`, {}, { withCredentials: true }).pipe(map(res => res.data));
  }

  removeFavourite(groupId: string): Observable<unknown> {
    return this.http.delete<ApiResponse<unknown>>(`${this.baseUrl}/api/users/self/groups/${groupId}/favourite`, { withCredentials: true }).pipe(map(res => res.data));
  }

  joinPublic(groupId: string): Observable<{ level?: string; userLevel?: string }> {
    return this.http.post<ApiResponse<{ level?: string; userLevel?: string }>>(
      `${this.baseUrl}/api/groups/${groupId}/join`,
      {},
      { withCredentials: true }
    ).pipe(map(res => res.data!));
  }

  leaveGroup(groupId: string, userId: string): Observable<unknown> {
    return this.http.delete<ApiResponse<unknown>>(
      `${this.baseUrl}/api/users/self/groups/${groupId}/members/users/${userId}`,
      { withCredentials: true }
    ).pipe(map(res => res.data));
  }

  deleteGroup(groupId: string): Observable<unknown> {
    return this.http.delete<ApiResponse<unknown>>(
      `${this.baseUrl}/api/users/self/groups/${groupId}`,
      { withCredentials: true }
    ).pipe(map(res => res.data));
  }

  update(group: Partial<Group>): Observable<Group> {
    return this.http.put<ApiResponse<Group>>(
      `${this.baseUrl}/api/users/self/groups/${group.id}`,
      group, { withCredentials: true }
    ).pipe(map(res => res.data!));
  }

  uploadGroupImage(file: File, groupId: string): Observable<unknown> {
    return this.uploadService.upload(
      `${this.baseUrl}/api/users/self/groups/${groupId}/image`, file
    );
  }

  canUpdate(group: Group): boolean {
    return !!(group.permission?.level === 'admin' || group.userLevel === 'admin');
  }

  canShare(group: Group): boolean {
    return !!(group && (group.visibility !== 'private' || this.canUpdate(group)));
  }
}
