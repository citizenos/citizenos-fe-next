import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';
import { TopicMemberUser } from '../../../../../core/services/topic-member-user.service';
import { DialogRef, DialogCloseDirective } from '../../../../../shared/dialog/dialog-ref';
import { InitialsComponent } from '../../../../../shared/components/initials/initials.component';

@Component({
  selector: 'app-topic-member-invite-delete',
  standalone: true,
  imports: [
    TranslateModule,
    InitialsComponent,
    DialogCloseDirective, IconComponent,],
  templateUrl: './topic-member-invite-delete.component.html',
  styleUrls: ['./topic-member-invite-delete.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicMemberInviteDeleteComponent {
  user = inject<{ user: TopicMemberUser }>(DIALOG_DATA).user;
  protected dialogRef = inject(DialogRef);

  invitesToDelete: string | null = null;

  removeInvites(): void {
    if (this.invitesToDelete !== null) {
      this.dialogRef.close(this.invitesToDelete);
    }
  }
}
