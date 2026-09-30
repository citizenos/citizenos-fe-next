import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DialogCloseDirective, DialogRef } from '../../../../../shared/dialog';

@Component({
  selector: 'app-close-without-saving-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, DialogCloseDirective],
  templateUrl: './close-without-saving-dialog.component.html',
})
export class CloseWithoutSavingDialogComponent {
  dialogRef = inject(DialogRef);
}
