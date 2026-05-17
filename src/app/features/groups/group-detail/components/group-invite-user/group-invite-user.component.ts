import { Component, input, output, inject, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { KeyValuePipe, UpperCasePipe } from '@angular/common';
import { take, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Group } from '../../../../../core/interfaces/group';
import { GroupInviteUserService } from '../../../../../core/services/group-invite-user.service';
import { GroupMember } from '../../../../../core/services/group-member-user.service';
import { GroupDetailService } from '../../../../../core/services/group-detail.service';
import { DialogService } from '../../../../../shared/dialog/dialog.service';
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { InitialsComponent } from '../../../../../shared/components/initials/initials.component';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-group-invite-user',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, InitialsComponent, UpperCasePipe, KeyValuePipe, IconComponent],
  templateUrl: './group-invite-user.component.html'
})
export class GroupInviteUserComponent {
  user = input.required<GroupMember>();
  group = input.required<Group>();
  fields = input<string[]>([]);

  memberChanged = output<void>();

  private inviteUserService = inject(GroupInviteUserService);
  private groupDetailService = inject(GroupDetailService);
  private dialog = inject(DialogService);

  LEVELS = this.inviteUserService.LEVELS;

  canUpdate() {
    return this.groupDetailService.canUpdate(this.group());
  }

  doUpdateInviteUser(level: string) {
    const user = this.user();
    if (user.invite && user.invite.level !== level) {
      const invite = user.invite;
      const oldLevel = invite.level;
      invite.level = level;
      this.inviteUserService.updateInvite(this.group().id, invite.id, level)
        .pipe(take(1), catchError(() => {
          invite.level = oldLevel;
          return of(null);
        }))
        .subscribe();
    }
  }

  doDeleteInviteUser() {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        level: 'delete',
        heading: 'MODALS.TOPIC_MEMBER_USER_DELETE_CONFIRM_HEADING',
        title: 'MODALS.TOPIC_MEMBER_USER_DELETE_CONFIRM_TXT_ARE_YOU_SURE',
        confirmBtn: 'MODALS.TOPIC_MEMBER_USER_DELETE_CONFIRM_YES',
        closeBtn: 'MODALS.TOPIC_MEMBER_USER_DELETE_CONFIRM_NO'
      }
    }).afterClosed().subscribe(result => {
      if (result === true) {
        const user = this.user();
        if (user.invite) {
          this.inviteUserService.deleteInvite(this.group().id, user.invite.id)
            .pipe(take(1))
            .subscribe(() => this.memberChanged.emit());
        }
      }
    });
  }
}
