import { Component, input, output, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { Argument } from '../../../../../core/interfaces/discussion';
import { DialogService } from '../../../../../shared/dialog';
import { ArgumentWhyDialogComponent } from '../argument-why-dialog/argument-why-dialog.component';

@Component({
  selector: 'app-argument-deleted',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './argument-deleted.component.html',
  styleUrls: ['./argument-deleted.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArgumentDeletedComponent {
  argument = input.required<Argument>();
  showDeletedArgument = output<boolean>();

  isArgumentVisible = signal(false);

  private dialog = inject(DialogService);

  showReason() {
    this.dialog.open(ArgumentWhyDialogComponent, { data: { argument: this.argument() } });
  }

  showArgument() {
    this.isArgumentVisible.set(true);
    this.showDeletedArgument.emit(true);
  }
}
