import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { take } from 'rxjs';

import { DIALOG_DATA, DialogCloseDirective, DialogService } from '../../../../shared/dialog';
import { TermsLinksComponent } from '../../../../shared/components/terms-links/terms-links.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { UserService } from '../../../../core/services/user.service';
import { UserStore } from '../../../../core/state/user.store';
import { User } from '../../../../core/interfaces/user';
import { UserConnection } from '../../../../core/services/user.service';
import { AddEidComponent } from '../add-eid/add-eid.component';

export interface PrivacyPolicyData {
  user: User;
  new?: boolean;
}

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [TranslateModule, DialogCloseDirective, TermsLinksComponent],
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrivacyPolicyComponent {
  private data = inject<PrivacyPolicyData>(DIALOG_DATA);
  private dialog = inject(DialogService);
  private userService = inject(UserService);
  private userStore = inject(UserStore);
  private router = inject(Router);

  user = this.data.user;
  isNew = this.data.new ?? false;

  accept() {
    this.userService.updateTermsVersion('2').pipe(take(1)).subscribe(() => {
      const userId = this.userStore.user()?.id;
      this.dialog.closeAll();
      if (userId) {
        this.userService.listUserConnections(userId).pipe(take(1)).subscribe((rawConnections: unknown) => {
          const connections = rawConnections as { rows?: UserConnection[] } | undefined;
          const filtered = (connections?.rows ?? []).filter((con: UserConnection) =>
            ['esteid', 'smartid'].includes(con.connectionId)
          );
          if (!filtered.length && navigator.languages.includes('et')) {
            this.dialog.open(AddEidComponent, { data: { connections } });
          }
        });
      }
    });
  }

  reject() {
    const confirmReject = this.dialog.open(ConfirmDialogComponent, {
      data: {
        level: 'delete',
        heading: 'MODALS.USER_DELETE_CONFIRM_TXT_ARE_YOU_SURE',
        description: 'MODALS.USER_DELETE_CONFIRM_TXT_NO_UNDO',
        points: [
          'MODALS.USER_DELETE_CONFIRM_TXT_BY_REJECTING_TERMS',
          'MODALS.USER_DELETE_CONFIRM_TXT_USER_LOGGED_OUT_AND_DELETED',
          'MODALS.USER_DELETE_CONFIRM_TXT_KEEP_DATA_ANONYMOUSLY',
          'MODALS.USER_DELETE_CONFIRM_TXT_SORRY_TO_SEE_YOU_GO'
        ],
        confirmBtn: 'MODALS.USER_DELETE_CONFIRM_YES',
        closeBtn: 'MODALS.USER_DELETE_CONFIRM_NO'
      }
    });
    confirmReject.afterClosed().pipe(take(1)).subscribe((confirm) => {
      if (confirm === true) {
        this.userService.deleteUser().pipe(take(1)).subscribe();
        this.userStore.logout();
        this.dialog.closeAll();
        this.router.navigate(['/']);
      }
    });
  }
}
