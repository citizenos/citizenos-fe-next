import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, take } from 'rxjs';
import { ConfigStore } from '../state/config.store';
import { UserStore } from '../state/user.store';
import { ApiResponse } from '../interfaces/api-response';
import { Topic } from '../interfaces/topic';
import { DialogService } from '../../shared/dialog/dialog.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { Router } from '@angular/router';

export interface TopicMemberUser {
  id: string;
  userId?: string;
  name: string;
  email?: string;
  imageUrl?: string | null;
  level: string;
  groups?: { rows: any[] };
}

@Injectable({ providedIn: 'root' })
export class TopicMemberUserService {
  private http = inject(HttpClient);
  private configStore = inject(ConfigStore);
  private userStore = inject(UserStore);
  private dialog = inject(DialogService);
  private router = inject(Router);

  private get baseUrl() { return this.configStore.api.baseUrl(); }

  loadItems(topicId: string): Observable<TopicMemberUser[]> {
    return this.http.get<ApiResponse<{ rows: TopicMemberUser[] }>>(
      `${this.baseUrl}/api/users/self/topics/${topicId}/members/users`,
      { withCredentials: true }
    ).pipe(map(res => res.data?.rows ?? []));
  }

  query(params: { topicId: string; search?: string }): Observable<{ rows: TopicMemberUser[] }> {
    return this.http.get<ApiResponse<{ rows: TopicMemberUser[] }>>(
      `${this.baseUrl}/api/users/self/topics/${params.topicId}/members/users`,
      { withCredentials: true, params: params.search ? { search: params.search } : {} }
    ).pipe(map(res => res.data ?? { rows: [] }));
  }

  update(topicId: string, userId: string, level: string): Observable<unknown> {
    return this.http.put<ApiResponse<unknown>>(
      `${this.baseUrl}/api/users/self/topics/${topicId}/members/users/${userId}`,
      { level }, { withCredentials: true }
    ).pipe(map(res => res.data));
  }

  delete(topicId: string, userId: string): Observable<unknown> {
    return this.http.delete<ApiResponse<unknown>>(
      `${this.baseUrl}/api/users/self/topics/${topicId}/members/users/${userId}`,
      { withCredentials: true }
    ).pipe(map(res => res.data));
  }

  doLeaveTopic(topic: Topic, redirect: string[]) {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        level: 'delete',
        heading: 'MODALS.TOPIC_MEMBER_USER_LEAVE_CONFIRM_HEADING',
        title: 'MODALS.TOPIC_MEMBER_USER_LEAVE_CONFIRM_TXT_ARE_YOU_SURE',
        points: ['MODALS.TOPIC_MEMBER_USER_LEAVE_CONFIRM_TXT_LEAVING_TOPIC_DESC'],
        confirmBtn: 'MODALS.TOPIC_MEMBER_USER_LEAVE_CONFIRM_BTN_YES',
        closeBtn: 'MODALS.TOPIC_MEMBER_USER_LEAVE_CONFIRM_BTN_NO'
      }
    }).afterClosed().subscribe(result => {
      if (result === true && this.userStore.user()) {
        this.delete(topic.id, this.userStore.user()!.id)
          .pipe(take(1))
          .subscribe(() => {
            this.router.navigate(redirect);
          });
      }
    });
  }
}
