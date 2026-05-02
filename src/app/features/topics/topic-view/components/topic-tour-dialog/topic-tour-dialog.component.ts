import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DialogCloseDirective } from '../../../../../shared/dialog/dialog-ref';

@Component({
  selector: 'cos-topic-tour-dialog',
  standalone: true,
  imports: [TranslateModule, DialogCloseDirective],
  templateUrl: './topic-tour-dialog.component.html',
  styleUrl: './topic-tour-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicTourDialogComponent {}
