import { Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DialogCloseDirective, DialogRef } from '../../../../../shared/dialog';

@Component({
  selector: 'app-anonymous-draft-dialog',
  templateUrl: './anonymous-draft-dialog.component.html',
  standalone: true,
  imports: [TranslateModule, DialogCloseDirective]
})
export class AnonymousDraftDialogComponent {
  private dialogRef = inject(DialogRef);
}
