import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { take } from 'rxjs';

import { Argument } from '../../../../../core/interfaces/discussion';
import { TopicArgumentService } from '../../../../../core/services/topic-argument.service';
import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';
import { DialogRef, DialogCloseDirective } from '../../../../../shared/dialog/dialog-ref';
import { InitialsComponent } from '../../../../../shared/components/initials/initials.component';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { DropdownComponent } from '../../../../../shared/components/dropdown/dropdown.component';

export interface ArgumentReportData {
  argument: Argument;
  topicId: string;
}

@Component({
  selector: 'app-argument-report',
  standalone: true,
  imports: [
    UpperCasePipe,
    TranslateModule,
    ReactiveFormsModule,
    InitialsComponent,
    IconComponent,
    ButtonComponent,
    DropdownComponent,
    DialogCloseDirective
  ],
  templateUrl: './argument-report.component.html',
  styleUrls: ['./argument-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArgumentReportComponent {
  private data = inject<ArgumentReportData>(DIALOG_DATA);
  private dialogRef = inject(DialogRef<ArgumentReportComponent>);
  private argumentService = inject(TopicArgumentService);
  private fb = inject(FormBuilder);

  argument = this.data.argument;
  reportTypes = Object.keys(this.argumentService.ARGUMENT_REPORT_TYPES);
  isLoading = signal(false);

  reportForm = this.fb.group({
    type: [this.reportTypes[0], Validators.required],
    text: ['', [Validators.required, Validators.maxLength(2048)]]
  });

  selectReportType(type: string) {
    this.reportForm.patchValue({ type });
  }

  doReport() {
    if (this.reportForm.invalid || this.isLoading()) return;
    this.reportForm.markAllAsTouched();
    if (this.reportForm.invalid) return;

    this.isLoading.set(true);
    const reportData = {
      topicId: this.data.topicId,
      discussionId: this.argument.discussionId || '',
      commentId: this.argument.id,
      type: this.reportForm.value.type!,
      text: this.reportForm.value.text!
    };

    this.argumentService.report(reportData)
      .pipe(take(1))
      .subscribe({
        next: () => this.dialogRef.close(true),
        error: () => this.isLoading.set(false)
      });
  }

  close() {
    this.dialogRef.close();
  }
}
