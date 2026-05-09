import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { Argument } from '../../../../../core/interfaces/discussion';
import { DIALOG_DATA, DialogCloseDirective } from '../../../../../shared/dialog';

interface ArgumentWhyDialogData {
  argument: Argument;
}

@Component({
  selector: 'app-argument-why-dialog',
  standalone: true,
  imports: [UpperCasePipe, TranslateModule, DialogCloseDirective],
  templateUrl: './argument-why-dialog.component.html',
  styleUrls: ['./argument-why-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArgumentWhyDialogComponent {
  private data = inject<ArgumentWhyDialogData>(DIALOG_DATA);
  argument = this.data.argument;
}
