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

  addFavourite(groupId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/users/self/groups/${groupId}/favourite`, {}, { withCredentials: true });
  }

  removeFavourite(groupId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/api/users/self/groups/${groupId}/favourite`, { withCredentials: true });
  }

  joinPublic(groupId: string): Observable<any> {
    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/api/groups/${groupId}/join`,
      {},
      { withCredentials: true }
    ).pipe(map(res => res.data));
  }

  leaveGroup(groupId: string, userId: string): Observable<any> {
    return this.http.delete(
      `${this.baseUrl}/api/users/self/groups/${groupId}/members/users/${userId}`,
      { withCredentials: true }
    );
  }

  deleteGroup(groupId: string): Observable<any> {
    return this.http.delete(
      `${this.baseUrl}/api/users/self/groups/${groupId}`,
      { withCredentials: true }
    );
  }

  update(group: Partial<Group>): Observable<Group> {
    return this.http.put<ApiResponse<Group>>(
      `${this.baseUrl}/api/users/self/groups/${group.id}`,
      group, { withCredentials: true }
    ).pipe(map(res => res.data!));
  }

  uploadGroupImage(file: File, groupId: string): Observable<any> {
    return this.uploadService.upload(
      `${this.baseUrl}/api/users/self/groups/${groupId}/image`, file
    );
  }

  canUpdate(group: Group): boolean {
    return !!(group.permission?.level === 'admin' || group.userLevel === 'admin');
  }
}
