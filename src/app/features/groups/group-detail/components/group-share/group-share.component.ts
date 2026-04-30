import { Component, input, OnInit, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { UpperCasePipe } from '@angular/common';
import { take } from 'rxjs/operators';
import { QRCodeComponent } from 'angularx-qrcode';
import { Group } from '../../../../../core/interfaces/group';
import { GroupJoinService } from '../../../../../core/services/group-join.service';
import { GroupMemberUserService } from '../../../../../core/services/group-member-user.service';
import { GroupDetailService } from '../../../../../core/services/group-detail.service';
import { DialogService } from '../../../../../shared/dialog/dialog.service';
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { DropdownComponent } from '../../../../../shared/components/dropdown/dropdown.component';
import { TooltipComponent } from '../../../../../shared/components/tooltip/tooltip.component';
import { computed } from '@angular/core';

@Component({
  selector: 'app-group-share',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, UpperCasePipe, QRCodeComponent, ButtonComponent, DropdownComponent, TooltipComponent, IconComponent],
  templateUrl: './group-share.component.html',
  styleUrls: ['./group-share.component.scss']
})
export class GroupShareComponent implements OnInit {
  group = input.required<Group>();
  showQR = signal(false);

  private groupJoinService = inject(GroupJoinService);
  private memberUserService = inject(GroupMemberUserService);
  private groupDetailService = inject(GroupDetailService);
  private dialog = inject(DialogService);

  LEVELS = this.memberUserService.LEVELS;

  joinLevel = signal<string>(this.memberUserService.LEVELS[0]);
  joinToken = signal<string | null>(null);
  joinUrl = computed(() => {
    const base = window.location.origin;
    const token = this.joinToken();
    const group = this.group();
    if (token && this.groupDetailService.canShare(group)) {
      return `${base}/groups/join/${token}`;
    } else {
      return `${base}/groups/${group.id}/join`;
    }
  });
  copySuccess = signal(false);

  ngOnInit() {
    const group = this.group();
    this.joinToken.set(group.join?.token ?? null);
    this.joinLevel.set(group.join?.level ?? this.memberUserService.LEVELS[0]);
  }

  canUpdate() {
    return this.groupDetailService.canUpdate(this.group());
  }


  generateTokenJoin() {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'MODALS.GROUP_INVITE_SHARE_LINK_GENERATE_CONFIRM_TXT_ARE_YOU_SURE',
        heading: 'MODALS.GROUP_INVITE_SHARE_LINK_GENERATE_CONFIRM_HEADING',
        closeBtn: 'MODALS.GROUP_INVITE_SHARE_LINK_GENERATE_CONFIRM_BTN_NO',
        confirmBtn: 'MODALS.GROUP_INVITE_SHARE_LINK_GENERATE_CONFIRM_BTN_YES',
        points: ['MODALS.GROUP_INVITE_SHARE_LINK_GENERATE_CONFIRM_TXT_POINT1', 'MODALS.GROUP_INVITE_SHARE_LINK_GENERATE_CONFIRM_TXT_POINT2']
      }
    }).afterClosed().pipe(take(1)).subscribe(result => {
      if (result === true) {
        this.groupJoinService.generateToken(this.group().id, this.joinLevel())
          .pipe(take(1)).subscribe(res => {
            this.joinToken.set(res.token);
            this.joinLevel.set(res.level);
          });
      }
    });
  }

  doUpdateJoinToken(level: string) {
    const token = this.joinToken();
    if (!token) return;
    this.groupJoinService.updateLevel(this.group().id, token, level)
      .pipe(take(1)).subscribe(() => {
        this.joinLevel.set(level);
      });
  }

  copyInviteLink() {
    const url = this.joinUrl();
    if (url) {
      navigator.clipboard.writeText(url).then(() => {
        this.copySuccess.set(true);
      });
    }
  }
}
