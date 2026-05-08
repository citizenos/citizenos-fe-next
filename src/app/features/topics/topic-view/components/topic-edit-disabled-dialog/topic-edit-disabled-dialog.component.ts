import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DialogCloseDirective, DialogRef } from '../../../../../shared/dialog/dialog-ref';

@Component({
  selector: 'cos-topic-edit-disabled-dialog',
  standalone: true,
  imports: [TranslateModule, DialogCloseDirective],
  templateUrl: './topic-edit-disabled-dialog.component.html',
  styleUrl: './topic-edit-disabled-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicEditDisabledDialogComponent {
  dialogRef = inject(DialogRef);
}
