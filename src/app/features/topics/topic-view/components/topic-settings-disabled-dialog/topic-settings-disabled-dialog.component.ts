import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DialogCloseDirective } from '../../../../../shared/dialog/dialog-ref';

@Component({
  selector: 'cos-topic-settings-disabled-dialog',
  standalone: true,
  imports: [TranslateModule, DialogCloseDirective],
  templateUrl: './topic-settings-disabled-dialog.component.html',
  styleUrl: './topic-settings-disabled-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicSettingsDisabledDialogComponent {}
