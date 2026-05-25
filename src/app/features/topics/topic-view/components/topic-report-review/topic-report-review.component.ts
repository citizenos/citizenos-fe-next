import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
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

export interface TopicReportReviewData {
  topic: Topic;
}

@Component({
  selector: 'app-topic-report-review',
  standalone: true,
  imports: [
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    IconComponent,
    ButtonComponent,
    DialogCloseDirective
  ],
  templateUrl: './topic-report-review.component.html',
  styleUrls: ['./topic-report-review.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopicReportReviewComponent {
  data = inject<TopicReportReviewData>(DIALOG_DATA);
  private dialogRef = inject(DialogRef<TopicReportReviewComponent>);
  private topicReportService = inject(TopicReportService);
  private notificationService = inject(NotificationService);
  private fb = inject(FormBuilder);

  topic = signal<Topic>(this.data.topic);
  isLoading = signal(false);

  reviewForm = this.fb.group({
    text: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(2024)]]
  });

  doReview() {
    if (this.reviewForm.invalid || this.isLoading()) return;

    this.isLoading.set(true);
    const reviewData = {
      text: this.reviewForm.value.text!
    };

    const reportId = this.topic().report?.id;
    if (!reportId) {
      this.notificationService.error('MSG_ERROR_REPORT_ID_MISSING');
      this.isLoading.set(false);
      return;
    }

    this.topicReportService.review(this.topic().id, reportId, reviewData)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.notificationService.success('COMPONENTS.TOPIC_REPORT_REVIEW.MSG_REVIEW_SENT');
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Failed to review report', err);
          this.notificationService.error('MSG_ERROR_REVIEW_FAILED');
          this.isLoading.set(false);
        }
      });
  }

  close() {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'app-topic-report-review-dialog',
  standalone: true,
  template: ''
})
export class TopicReportReviewDialogComponent implements OnInit {
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
            const dialogRef = this.dialog.open(TopicReportReviewComponent, {
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

