import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DialogCloseDirective, DialogRef } from '../../../../../shared/dialog/dialog-ref';

@Component({
  selector: 'cos-topic-tour-dialog',
  standalone: true,
  imports: [TranslateModule, DialogCloseDirective, IconComponent],
  templateUrl: './topic-tour-dialog.component.html',
  styleUrl: './topic-tour-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicTourDialogComponent {
  dialogRef = inject(DialogRef);
}
