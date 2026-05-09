import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs';
import { GroupJoinService } from '../../../core/services/group-join.service';
import { GroupDetailService } from '../../../core/services/group-detail.service';
import { UserStore } from '../../../core/state/user.store';
import { DialogService } from '../../../shared/dialog/dialog.service';
import { InvitationDialogComponent } from '../../../shared/components/invitation-dialog/invitation-dialog.component';
import { Group } from '../../../core/interfaces/group';

@Component({
  selector: 'app-group-join',
  template: '',
  standalone: true,
})
export class GroupJoinComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private groupJoinService = inject(GroupJoinService);
  private groupDetailService = inject(GroupDetailService);
  private userStore = inject(UserStore);
  private dialog = inject(DialogService);

  ngOnInit() {
    const params = this.route.snapshot.params;
    const queryParams = this.route.snapshot.queryParams;
    const token: string = params['token'];
    const groupId: string = params['groupId'];

    const source$ = token
      ? this.groupJoinService.get(token)
      : this.groupDetailService.loadGroup(groupId);

    source$.pipe(take(1)).subscribe({
      next: (group: Group) => {
        const currentUrl = window.location.href;
        const redirectUrl = queryParams['join'] ? currentUrl : `${currentUrl}?join=true`;
        const hasDirectJoin = queryParams['join'] === 'true';
        const isLoggedIn = this.userStore.isAuthenticated();

        if (group.userLevel) {
          this.router.navigate(['/groups', group.id]);
          return;
        }

        if (hasDirectJoin) {
          if (isLoggedIn) {
            this.joinGroup(group, token, redirectUrl);
          } else {
            this.router.navigate(['/account/login'], {
              queryParams: { redirectSuccess: redirectUrl },
            });
          }
          return;
        }

        this.router.navigate(['dashboard']);

        const data = {
          imageUrl: group.imageUrl,
          title: group.name,
          intro: null,
          description: group.description,
          creator: group.creator,
          user: null,
          level: 'read',
          visibility: group.visibility,
          publicAccess: group.visibility === 'public'
            ? { title: 'COMPONENTS.GROUP_JOIN.BTN_GO_TO_GROUP', link: ['/groups/', group.id] }
            : null,
          type: 'join',
          view: 'group',
        };

        this.dialog.open(InvitationDialogComponent, { data }).afterClosed().subscribe((confirm) => {
          if (confirm === true) {
            this.joinGroup(group, token, redirectUrl);
          }
        });
      },
      error: (err) => {
        console.error('Group join error', err);
        if (err.status?.code === 40400) this.router.navigate(['/404']);
      },
    });
  }

  private joinGroup(group: Group, token: string, redirectUrl: string) {
    const redirectWithJoin = redirectUrl.includes('?join=') ? redirectUrl : `${redirectUrl}?join=true`;

    if (token) {
      this.groupJoinService.join(token).pipe(take(1)).subscribe({
        next: (joined: Group) => this.router.navigate(['/groups', joined.id ?? group.id]),
        error: (res) => {
          const code = res.status?.code;
          if (code === 40100) {
            this.router.navigate(['/account/login'], { queryParams: { redirectSuccess: redirectWithJoin } });
          } else if (code === 40001) {
            this.router.navigate(['dashboard']);
          } else {
            this.router.navigate(['/404']);
          }
        },
      });
    } else {
      this.groupJoinService.joinPublic(group.id).pipe(take(1)).subscribe({
        next: (joined: Group) => this.router.navigate(['/groups', joined.id ?? group.id]),
        error: (res) => {
          const code = res.status?.code;
          if (code === 40100) {
            this.router.navigate(['/account/login'], { queryParams: { redirectSuccess: redirectWithJoin, groupId: group.id } });
          } else if (code === 40001) {
            this.router.navigate(['dashboard']);
          } else {
            this.router.navigate(['/404']);
          }
        },
      });
    }
  }
}
