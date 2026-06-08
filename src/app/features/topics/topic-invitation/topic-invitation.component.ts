import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { take, combineLatest } from 'rxjs';

import { UserStore } from '../../../core/state/user.store';
import { TopicInviteUserService, TopicInvite } from '../../../core/services/topic-invite-user.service';
import { DialogService } from '../../../shared/dialog';
import { InvitationDialogComponent, InviteDialogData } from '../../../shared/components/invitation-dialog/invitation-dialog.component';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-topic-invitation',
  standalone: true,
  template: '',
})
export class TopicInvitationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userStore = inject(UserStore);
  private topicInviteUserService = inject(TopicInviteUserService);
  private dialog = inject(DialogService);
  private notification = inject(NotificationService);

  ngOnInit() {
    combineLatest([this.route.params, this.route.queryParams]).pipe(take(1)).subscribe(([params, queryParams]) => {
      const topicId = params['topicId'];
      const inviteId = params['inviteId'];
      const hasDirectJoin = queryParams['join'] === 'true';
      const currentUrl = window.location.href;
      const joinUrl = hasDirectJoin ? currentUrl : `${currentUrl}?join=true`;

      this.topicInviteUserService.get({ topicId, inviteId }).pipe(take(1)).subscribe({
        next: (topicInvite: TopicInvite) => {
          topicInvite.inviteId = inviteId;
          const isAuthenticated = this.userStore.isAuthenticated();
          const currentUser = this.userStore.user();

          if (hasDirectJoin && topicInvite.user?.id === currentUser?.id && isAuthenticated) {
            this.joinTopic(topicInvite);
            return;
          }

          const data: InviteDialogData = {
            imageUrl: topicInvite.topic?.imageUrl ?? null,
            title: topicInvite.topic?.title ?? null,
            intro: topicInvite.topic?.intro ?? null,
            description: topicInvite.topic?.description ?? null,
            creator: topicInvite.creator ? { name: topicInvite.creator.name, imageUrl: topicInvite.creator.imageUrl || undefined } : null,
            user: topicInvite.user ?? null,
            level: topicInvite.level ?? null,
            visibility: topicInvite.topic?.visibility ?? 'private',
            publicAccess: topicInvite.topic?.visibility === 'public'
              ? { title: 'COMPONENTS.TOPIC_JOIN.BTN_GO_TO_TOPIC', link: ['/topics', topicInvite.topic.id] }
              : null,
            type: 'invite',
            view: 'topic',
          };

          this.router.navigate(['dashboard']);
          const invitationDialog = this.dialog.open(InvitationDialogComponent, { data });

          invitationDialog.afterClosed().pipe(take(1)).subscribe((res) => {
            if (res !== true) return;

            if (isAuthenticated) {
              if (topicInvite.user?.id !== currentUser?.id) {
                this.userStore.logout().then(() => {
                  this.router.navigate(['/account/login'], {
                    queryParams: { redirectSuccess: joinUrl, email: topicInvite.user?.email, userId: topicInvite.user?.id }
                  });
                });
              } else {
                this.joinTopic(topicInvite);
              }
            } else {
              if (topicInvite.user?.isRegistered) {
                this.router.navigate(['/account/login'], {
                  queryParams: { redirectSuccess: joinUrl, email: topicInvite.user?.email, userId: topicInvite.user?.id }
                });
              } else {
                this.router.navigate(['/account/signup'], {
                  queryParams: { redirectSuccess: joinUrl, email: topicInvite.user?.email, inviteId }
                });
              }
            }
          });
        },
        error: (err) => {
          this.router.navigate(['/']);
          setTimeout(() => {
            if (err?.status?.code === 41002 || err?.error?.status?.code === 41002) {
              this.notification.show('error',
                'MSG_ERROR_GET_API_USERS_TOPICS_INVITES_USERS_41002',
                'MSG_ERROR_GET_API_USERS_TOPICS_INVITES_USERS_41002_HEADING'
              );
            } else {
              this.notification.showRaw('error', err?.message || err?.status?.message || 'Unknown error');
            }
          }, 400);
        }
      });
    });
  }

  private joinTopic(topicInvite: TopicInvite) {
    this.topicInviteUserService.accept({
      topicId: topicInvite.topicId,
      inviteId: topicInvite.id
    }).pipe(take(1)).subscribe({
      next: () => this.router.navigate(['/topics', topicInvite.topicId]),
      error: (err) => console.error('Invite accept error', err)
    });
  }
}
