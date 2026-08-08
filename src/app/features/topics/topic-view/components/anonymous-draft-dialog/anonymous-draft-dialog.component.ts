import { Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DialogCloseDirective, DialogRef } from '../../../../../shared/dialog';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-anonymous-draft-dialog',
  templateUrl: './anonymous-draft-dialog.component.html',
  standalone: true,
  imports: [TranslateModule, DialogCloseDirective, IconComponent]
})
export class AnonymousDraftDialogComponent {
  private dialogRef = inject(DialogRef);
}
