import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DialogCloseDirective, DialogRef } from '../../../../../shared/dialog/dialog-ref';
import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';
import { Topic } from '../../../../../core/interfaces/topic';

export interface DuplicateTopicDialogData {
  topic: Topic;
}

@Component({
  selector: 'cos-duplicate-topic-dialog',
  standalone: true,
  imports: [TranslateModule, DialogCloseDirective],
  templateUrl: './duplicate-topic-dialog.component.html',
  styleUrl: './duplicate-topic-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DuplicateTopicDialogComponent {
  topic = inject<DuplicateTopicDialogData>(DIALOG_DATA).topic;
  dialogRef = inject(DialogRef);
}
