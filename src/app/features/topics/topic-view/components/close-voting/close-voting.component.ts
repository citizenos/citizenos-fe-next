import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';
import { DialogCloseDirective, DialogRef } from '../../../../../shared/dialog/dialog-ref';
import { Topic } from '../../../../../core/interfaces/topic';

@Component({
  selector: 'app-close-voting',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, DialogCloseDirective],
  templateUrl: './close-voting.component.html'
})
export class CloseVotingComponent {
  data = inject<{ topic: Topic }>(DIALOG_DATA);
  dialogRef = inject(DialogRef);
}
