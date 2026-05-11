import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs';
import { GroupInviteUserService, GroupInvitation } from '../../../core/services/group-invite-user.service';
import { UserStore } from '../../../core/state/user.store';
import { DialogService } from '../../../shared/dialog/dialog.service';
import { InvitationDialogComponent } from '../../../shared/components/invitation-dialog/invitation-dialog.component';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-group-invitation',
  template: '',
  standalone: true,
})
export class GroupInvitationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private inviteService = inject(GroupInviteUserService);
  private userStore = inject(UserStore);
  private dialog = inject(DialogService);
  private notification = inject(NotificationService);

  ngOnInit() {
    const params = this.route.snapshot.params;
    const queryParams = this.route.snapshot.queryParams;
    const groupId: string = params['groupId'];
    const inviteId: string = params['inviteId'];

    this.inviteService.get({ groupId, inviteId }).pipe(take(1)).subscribe({
      next: (invite: GroupInvitation) => {
        invite.inviteId = inviteId;
        const currentUrl = window.location.href;
        const redirectUrl = queryParams['join'] ? currentUrl : `${currentUrl}?join=true`;

        const hasDirectJoin = queryParams['join'] === 'true';
        const isLoggedIn = this.userStore.isAuthenticated();
        const currentUser = this.userStore.user();

        if (invite.user.id === currentUser?.id && hasDirectJoin) {
          if (isLoggedIn) {
            this.acceptInvite({ groupId, inviteId });
          } else {
            this.router.navigate(['/account/login'], {
              queryParams: { redirectSuccess: redirectUrl, email: invite.user.email },
            });
          }
          return;
        }

        this.router.navigate(['dashboard']);

        const data = {
          imageUrl: invite.group.imageUrl,
          title: invite.group.name,
          intro: null,
          description: invite.group.description,
          creator: invite.creator,
          user: invite.user,
          level: invite.level,
          visibility: invite.group.visibility,
          publicAccess: invite.group.visibility === 'public'
            ? { title: 'COMPONENTS.GROUP_JOIN.BTN_GO_TO_GROUP', link: ['/groups/', invite.group.id] }
            : null,
          type: 'invite',
          view: 'group',
        };

        const queryParamsForRedirect = {
          redirectSuccess: redirectUrl,
          email: invite.user.email,
        };

        this.dialog.open(InvitationDialogComponent, { data }).afterClosed().subscribe((res) => {
          if (res !== true) return;

          if (isLoggedIn) {
            if (currentUser?.id !== invite.user.id) {
              this.userStore.logout().then(() => {
                this.router.navigate(['/account/login'], {
                  queryParams: { ...queryParamsForRedirect, userId: invite.user.id },
                });
              });
            } else {
              this.acceptInvite({ groupId, inviteId });
            }
          } else if (invite.user.isRegistered) {
            this.router.navigate(['/account/login'], {
              queryParams: { ...queryParamsForRedirect, userId: invite.user.id },
            });
          } else {
            this.router.navigate(['/account/signup'], {
              queryParams: { ...queryParamsForRedirect, inviteId: invite.id },
            });
          }
        });
      },
      error: (err: { code?: number; status?: { code?: number; message?: string }; message?: string }) => {
        this.router.navigate(['/']);
        setTimeout(() => {
          if (err.code === 41002 || err.status?.code === 41002) {
            this.notification.error('MSG_ERROR_GET_API_USERS_GROUPS_INVITES_USERS_41002');
          } else {
            this.notification.error(err.message || err.status?.message || 'ERRORS.GENERAL');
          }
        }, 400);
      },
    });
  }

  private acceptInvite(params: { groupId: string; inviteId: string }) {
    this.inviteService.accept(params).pipe(take(1)).subscribe({
      next: () => this.router.navigate(['/groups', params.groupId]),
      error: (err) => this.notification.error(err.message || err.status?.message),
    });
  }
}
