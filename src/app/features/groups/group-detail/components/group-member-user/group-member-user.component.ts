import { Component, input, output, inject, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { UpperCasePipe } from '@angular/common';
import { take, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Group } from '../../../../../core/interfaces/group';
import { GroupMemberUserService, GroupMember } from '../../../../../core/services/group-member-user.service';
import { GroupDetailService } from '../../../../../core/services/group-detail.service';
import { DialogService } from '../../../../../shared/dialog/dialog.service';
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { InitialsComponent } from '../../../../../shared/components/initials/initials.component';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-group-member-user',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, InitialsComponent, UpperCasePipe, IconComponent],
  templateUrl: './group-member-user.component.html'
})
export class GroupMemberUserComponent {
  member = input.required<GroupMember>();
  group = input.required<Group>();
  fields = input<string[]>([]);

  memberChanged = output<void>();

  private memberUserService = inject(GroupMemberUserService);
  private groupDetailService = inject(GroupDetailService);
  private dialog = inject(DialogService);

  LEVELS = this.memberUserService.LEVELS;

  isVisibleField(field: string) {
    return this.fields()?.indexOf(field) > -1;
  }

  canUpdate() {
    return this.groupDetailService.canUpdate(this.group());
  }

  doUpdateMemberUser(level: string) {
    const member = this.member();
    if (member && member.level !== level) {
      const oldLevel = member.level;
      member.level = level;
      this.memberUserService.updateLevel(this.group().id, member.userId || member.id, level)
        .pipe(take(1), catchError(() => {
          member.level = oldLevel;
          return of(null);
        }))
        .subscribe();
    }
  }

  doDeleteMemberUser() {
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
        const member = this.member();
        this.memberUserService.removeMember(this.group().id, member.userId || member.id)
          .pipe(take(1))
          .subscribe(() => this.memberChanged.emit());
      }
    });
  }
}
