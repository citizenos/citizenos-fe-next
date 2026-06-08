import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { UploadService } from './upload.service';
import { ConfigStore } from '../state/config.store';
import { UserStore } from '../state/user.store';
import { ApiResponse } from '../interfaces/api-response';
import { Group } from '../interfaces/group';

@Service()
export class GroupDetailService {
  private http = inject(HttpClient);
  private configStore = inject(ConfigStore);
  private userStore = inject(UserStore);
  private uploadService = inject(UploadService);

  private get baseUrl() { return this.configStore.api.baseUrl(); }

  private getAbsoluteUrlApi(path: string, forceAuthorized = false): string {
    const isPublicPath = !forceAuthorized && (
      path.includes('/members/users') ||
      path.includes('/members/topics') ||
      path.includes('/invites/users')
    );

    const prefix = (this.userStore.isAuthenticated() && !isPublicPath) ? '/api/users/self' : '/api';
    return `${this.baseUrl}${prefix}${path}`;
  }

  VISIBILITY = { public: 'public', private: 'private' };

  loadGroup(groupId: string): Observable<Group> {
    const url = this.getAbsoluteUrlApi(`/groups/${groupId}`);
    return this.http.get<ApiResponse<Group>>(url, { withCredentials: true })
      .pipe(map(res => res.data!));
  }

  addFavourite(groupId: string): Observable<unknown> {
    return this.http.post<ApiResponse<unknown>>(this.getAbsoluteUrlApi(`/groups/${groupId}/favourite`), {}, { withCredentials: true }).pipe(map(res => res.data));
  }

  removeFavourite(groupId: string): Observable<unknown> {
    return this.http.delete<ApiResponse<unknown>>(this.getAbsoluteUrlApi(`/groups/${groupId}/favourite`), { withCredentials: true }).pipe(map(res => res.data));
  }

  joinPublic(groupId: string): Observable<{ level?: string; userLevel?: string }> {
    return this.http.post<ApiResponse<{ level?: string; userLevel?: string }>>(
      this.getAbsoluteUrlApi(`/groups/${groupId}/join`),
      {}, { withCredentials: true }
    ).pipe(map(res => res.data!));
  }

  save(data: Partial<Group>): Observable<Group> {
    return this.http.post<ApiResponse<Group>>(this.getAbsoluteUrlApi('/groups'), data, { withCredentials: true }).pipe(map(res => res.data!));
  }

  update(group: Partial<Group> & { id: string }): Observable<Group> {
    return this.http.put<ApiResponse<Group>>(this.getAbsoluteUrlApi(`/groups/${group.id}`), group, { withCredentials: true }).pipe(map(res => res.data!));
  }

  delete(group: Partial<Group> & { id: string }): Observable<unknown> {
    return this.http.delete<ApiResponse<unknown>>(this.getAbsoluteUrlApi(`/groups/${group.id}`), { withCredentials: true }).pipe(map(res => res.data));
  }

  deleteGroup(groupId: string): Observable<unknown> {
    return this.http.delete<ApiResponse<unknown>>(this.getAbsoluteUrlApi(`/groups/${groupId}`), { withCredentials: true }).pipe(map(res => res.data));
  }

  leaveGroup(groupId: string, userId: string): Observable<unknown> {
    return this.http.delete<ApiResponse<unknown>>(this.getAbsoluteUrlApi(`/groups/${groupId}/members/users/${userId}`), { withCredentials: true }).pipe(map(res => res.data));
  }

  uploadGroupImage(groupId: string, file: File): Observable<unknown> {
    const url = this.getAbsoluteUrlApi(`/groups/${groupId}/image`);
    return this.uploadService.upload(url, file);
  }

  canUpdate(group: Group): boolean {
    return !!(group && (group.permission?.level === 'admin' || group.userLevel === 'admin'));
  }

  canDelete(group: Group): boolean {
    return !!(group.permission?.level === 'admin' || group.userLevel === 'admin');
  }

  canShare(group: Group): boolean {
    return !!(group && (group.visibility !== 'private' || this.canUpdate(group)));
  }
}
