import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DialogCloseDirective } from '../../../../shared/dialog/dialog-ref';
import { DIALOG_DATA } from '../../../../shared/dialog/dialog-tokens';
import { NotificationComponent } from '../../../../shared/components/notification/notification.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-verify-email-dialog',
  standalone: true,
  imports: [TranslateModule, DialogCloseDirective, NotificationComponent, IconComponent],
  templateUrl: './verify-email-dialog.component.html',
  styleUrl: './verify-email-dialog.component.scss',
})
export class VerifyEmailDialogComponent {
  readonly data = inject<{ email: string }>(DIALOG_DATA);
}
