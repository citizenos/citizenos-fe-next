import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { take, switchMap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

import { Topic } from '../../../../../core/interfaces/topic';
import { TopicReportService } from '../../../../../core/services/topic-report.service';
import { TopicService } from '../../../../../core/services/topic.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';
import { DialogRef, DialogCloseDirective } from '../../../../../shared/dialog/dialog-ref';
import { DialogService } from '../../../../../shared/dialog/dialog.service';

import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { DropdownComponent } from '../../../../../shared/components/dropdown/dropdown.component';

export interface TopicReportModerateData {
  topic: Topic;
}

@Component({
  selector: 'app-topic-report-moderate',
  standalone: true,
  imports: [
    UpperCasePipe,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    IconComponent,
    ButtonComponent,
    DropdownComponent,
    DialogCloseDirective
  ],
  templateUrl: './topic-report-moderate.component.html',
  styleUrls: ['./topic-report-moderate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopicReportModerateComponent {
  data = inject<TopicReportModerateData>(DIALOG_DATA);
  private dialogRef = inject(DialogRef<TopicReportModerateComponent>);
  private topicReportService = inject(TopicReportService);
  private notificationService = inject(NotificationService);
  private fb = inject(FormBuilder);

  topic = signal<Topic>(this.data.topic);
  reportTypes = Object.keys(this.topicReportService.TYPES);
  isLoading = signal(false);

  moderateForm = this.fb.group({
    type: [this.reportTypes[0], Validators.required],
    text: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(2024)]]
  });

  changeType(type: string) {
    this.moderateForm.patchValue({ type });
  }

  doModerate() {
    if (this.moderateForm.invalid || this.isLoading()) return;

    this.isLoading.set(true);
    const moderateData = {
      type: this.moderateForm.value.type!,
      text: this.moderateForm.value.text!
    };

    const reportId = this.topic().report?.id;
    if (!reportId) {
      this.notificationService.error('MSG_ERROR_REPORT_ID_MISSING');
      this.isLoading.set(false);
      return;
    }

    this.topicReportService.moderate(this.topic().id, reportId, moderateData)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.notificationService.success('COMPONENTS.TOPIC_REPORT_MODERATE.MSG_MODERATION_SENT');
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Failed to moderate report', err);
          this.notificationService.error('MSG_ERROR_MODERATION_FAILED');
          this.isLoading.set(false);
        }
      });
  }

  close() {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'app-topic-report-moderate-dialog',
  standalone: true,
  template: ''
})
export class TopicReportModerateDialogComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(DialogService);
  private topicService = inject(TopicService);

  ngOnInit() {
    this.route.params.pipe(
      take(1),
      switchMap((params) => {
        const topicId = params['topicId'];
        return this.topicService.get(topicId).pipe(
          take(1),
          switchMap((topic) => {
            const dialogRef = this.dialog.open(TopicReportModerateComponent, {
              data: { topic }
            });
            return dialogRef.afterClosed().pipe(
              take(1),
              switchMap(() => {
                const lang = this.router.url.split('/')[1] || 'en';
                return this.router.navigate([lang, 'topics', topicId]);
              })
            );
          })
        );
      })
    ).subscribe();
  }
}

