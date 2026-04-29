import { Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DialogCloseDirective } from '../../../../shared/dialog/dialog-ref';
import { DIALOG_DATA } from '../../../../shared/dialog/dialog-tokens';
import { NotificationComponent } from '../../../../shared/components/notification/notification.component';

@Component({
  selector: 'app-verify-email-dialog',
  standalone: true,
  imports: [TranslateModule, DialogCloseDirective, NotificationComponent],
  templateUrl: './verify-email-dialog.component.html',
  styleUrl: './verify-email-dialog.component.scss',
})
export class VerifyEmailDialogComponent {
  readonly data = inject<{ email: string }>(DIALOG_DATA);
}
