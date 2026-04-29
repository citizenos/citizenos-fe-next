import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { UpperCasePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { A11yModule } from '@angular/cdk/a11y';
import { DIALOG_DATA } from '../../dialog/dialog-tokens';
import { DialogCloseDirective } from '../../dialog';
import { DialogService } from '../../dialog/dialog.service';
import { InitialsComponent } from '../initials/initials.component';
import { NotificationComponent } from '../notification/notification.component';
import { UserStore } from '../../../core/state/user.store';

export interface InviteDialogData {
  imageUrl: string | null;
  title: string | null;
  intro: string | null;
  description: string | null;
  creator: {
    imageUrl: string | undefined;
    name: string;
  } | null;
  user: {
    email: string;
    isRegistered: boolean;
  } | null;
  level: string | null;
  visibility: string;
  publicAccess: {
    title: string;
    link: string[];
  } | null;
  type: 'join' | 'invite';
  view: 'topic' | 'group';
}

@Component({
  selector: 'cos-invitation-dialog',
  standalone: true,
  imports: [TranslateModule, DialogCloseDirective, InitialsComponent, NotificationComponent, UpperCasePipe, A11yModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './invitation-dialog.component.html',
  styleUrls: ['./invitation-dialog.component.scss'],
})
export class InvitationDialogComponent {
  readonly data = inject<InviteDialogData>(DIALOG_DATA);

  private dialog = inject(DialogService);
  private router = inject(Router);
  private userStore = inject(UserStore);

  get loggedIn() {
    return this.userStore.isAuthenticated();
  }

  goToPublicUrl(link: string[]) {
    this.dialog.closeAll();
    this.router.navigate(link);
  }
}
