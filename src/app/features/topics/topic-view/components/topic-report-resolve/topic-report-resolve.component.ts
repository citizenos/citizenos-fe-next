import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
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

export interface TopicReportResolveData {
  topic: Topic;
}

@Component({
  selector: 'app-topic-report-resolve',
  standalone: true,
  imports: [
    TranslateModule,
    IconComponent,
    ButtonComponent,
    DialogCloseDirective
  ],
  templateUrl: './topic-report-resolve.component.html',
  styleUrls: ['./topic-report-resolve.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopicReportResolveComponent {
  data = inject<TopicReportResolveData>(DIALOG_DATA);
  private dialogRef = inject(DialogRef<TopicReportResolveComponent>);
  private topicReportService = inject(TopicReportService);
  private notificationService = inject(NotificationService);

  topic = signal<Topic>(this.data.topic);
  isLoading = signal(false);

  doResolve() {
    if (this.isLoading()) return;

    this.isLoading.set(true);
    const reportId = this.topic().report?.id;
    if (!reportId) {
      this.notificationService.error('MSG_ERROR_REPORT_ID_MISSING');
      this.isLoading.set(false);
      return;
    }

    this.topicReportService.resolve(this.topic().id, reportId, {})
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.notificationService.success('COMPONENTS.TOPIC_REPORT_RESOLVE.MSG_RESOLVE_SENT');
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Failed to resolve report', err);
          this.notificationService.error('MSG_ERROR_RESOLVE_FAILED');
          this.isLoading.set(false);
        }
      });
  }

  close() {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'app-topic-report-resolve-dialog',
  standalone: true,
  template: ''
})
export class TopicReportResolveDialogComponent implements OnInit {
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
            const dialogRef = this.dialog.open(TopicReportResolveComponent, {
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

