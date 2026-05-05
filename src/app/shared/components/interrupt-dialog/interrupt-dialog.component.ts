import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DialogCloseDirective } from '../../dialog';
import { NotificationComponent } from '../notification/notification.component';

@Component({
  selector: 'app-interrupt-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, DialogCloseDirective, NotificationComponent],
  templateUrl: './interrupt-dialog.component.html',
  styleUrl: './interrupt-dialog.component.scss',
})
export class InterruptDialogComponent {}
