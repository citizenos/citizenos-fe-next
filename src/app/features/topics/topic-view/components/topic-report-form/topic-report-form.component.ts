import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { take } from 'rxjs';

import { Topic } from '../../../../../core/interfaces/topic';
import { TopicReportService } from '../../../../../core/services/topic-report.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';
import { DialogRef, DialogCloseDirective } from '../../../../../shared/dialog/dialog-ref';

import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { DropdownComponent } from '../../../../../shared/components/dropdown/dropdown.component';

export interface TopicReportFormData {
  topic: Topic;
}

@Component({
  selector: 'app-topic-report-form',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    IconComponent,
    ButtonComponent,
    DropdownComponent,
    DialogCloseDirective
  ],
  templateUrl: './topic-report-form.component.html',
  styleUrls: ['./topic-report-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopicReportFormComponent {
  data = inject<TopicReportFormData>(DIALOG_DATA);
  private dialogRef = inject(DialogRef<TopicReportFormComponent>);
  private topicReportService = inject(TopicReportService);
  private notificationService = inject(NotificationService);
  private fb = inject(FormBuilder);

  topic = signal<Topic>(this.data.topic);
  reportTypes = Object.keys(this.topicReportService.TYPES);
  isLoading = signal(false);

  reportForm = this.fb.group({
    type: [this.reportTypes[0], Validators.required],
    text: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(2024)]]
  });

  changeType(type: string) {
    this.reportForm.patchValue({ type });
  }

  doReport() {
    if (this.reportForm.invalid || this.isLoading()) return;

    this.isLoading.set(true);
    const reportData = {
      topicId: this.topic().id,
      type: this.reportForm.value.type!,
      text: this.reportForm.value.text!
    };

    this.topicReportService.save(reportData)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.notificationService.addSuccess('COMPONENTS.TOPIC_REPORT_FORM.MSG_REPORT_SENT');
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Failed to send report', err);
          this.notificationService.addError('MSG_ERROR_REPORT_SEND_FAILED');
          this.isLoading.set(false);
        }
      });
  }

  close() {
    this.dialogRef.close();
  }
}
