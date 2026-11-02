import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, catchError, map, of, switchMap, take, tap } from 'rxjs';
import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';
import { DialogCloseDirective, DialogRef } from '../../../../../shared/dialog/dialog-ref';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { DeadlinePickerComponent } from '../../../../../shared/components/deadline-picker/deadline-picker.component';
import { NotificationComponent } from '../../../../../shared/components/notification/notification.component';
import { CosDropdownDirective } from '../../../../../shared/directives/cos-dropdown.directive';
import { TopicDiscussionService } from '../../../../../core/services/topic-discussion.service';
import { TopicService } from '../../../../../core/services/topic.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { Topic } from '../../../../../core/interfaces/topic';
import { Discussion, DiscussionData } from '../../../../../core/interfaces/discussion';

export interface TopicDiscussionCreateData {
  topic: Topic;
}

@Component({
  selector: 'cos-topic-discussion-create-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslateModule,
    FormsModule,
    DialogCloseDirective,
    IconComponent,
    InputComponent,
    DeadlinePickerComponent,
    NotificationComponent,
    CosDropdownDirective
  ],
  templateUrl: './topic-discussion-create-dialog.component.html',
  styleUrl: './topic-discussion-create-dialog.component.scss',
})
export class TopicDiscussionCreateDialogComponent {
  private data = inject<TopicDiscussionCreateData>(DIALOG_DATA);
  protected dialogRef = inject(DialogRef<TopicDiscussionCreateDialogComponent, Discussion>);
  private discussionService = inject(TopicDiscussionService);
  private topicService = inject(TopicService);
  private notification = inject(NotificationService);

  topic = this.data.topic;
  tabs = [1, 2];
  activeTab = signal(1);
  question = signal('');
  deadline = signal<Date | null>(null);
  isLoading = signal(false);

  selectTab(tab: number) {
    this.activeTab.set(tab);
  }

  onDeadlineChange(date: Date | null) {
    this.deadline.set(date);
  }

  isNextDisabled(): boolean {
    return (this.activeTab() === 2 && !this.question().trim()) || this.isLoading();
  }

  tabNext() {
    if (this.isNextDisabled()) return;
    if (this.activeTab() < this.tabs.length) {
      this.selectTab(this.activeTab() + 1);
    } else {
      this.save();
    }
  }

  save() {
    if (!this.question().trim() || this.isLoading()) return;
    this.isLoading.set(true);

    const t = this.topic;
    const payload: DiscussionData = {
      topicId: t.id,
      question: this.question(),
      deadline: this.deadline()
    };

    const save$: Observable<Discussion> = t.discussionId
      ? this.discussionService.update(t.id, t.discussionId, payload)
      : this.discussionService.create(t.id, payload);

    save$.pipe(
      switchMap((discussion: Discussion) => {
        t.discussionId = discussion.id;
        const needsPatch = Boolean(this.topicService.STATUSES?.inProgress) &&
          t.status !== this.topicService.STATUSES.inProgress;

        if (needsPatch) {
          return this.topicService.patch({ topicId: t.id, status: this.topicService.STATUSES.inProgress }).pipe(
            tap(() => {
              t.status = this.topicService.STATUSES.inProgress;
            }),
            map(() => discussion)
          );
        }
        return of(discussion);
      }),
      switchMap((discussion: Discussion) => {
        const reloadResult: unknown = this.topicService.reloadTopic();
        if (reloadResult && typeof (reloadResult as Observable<unknown>).subscribe === 'function') {
          return (reloadResult as Observable<unknown>).pipe(
            take(1),
            map(() => discussion),
            catchError(() => of(discussion))
          );
        }
        return of(discussion);
      }),
      take(1)
    ).subscribe({
      next: (discussion: Discussion) => {
        this.isLoading.set(false);
        this.dialogRef.close(discussion);
      },
      error: (err: unknown) => {
        this.isLoading.set(false);
        const errObj = err as { error?: { status?: { message?: string } } };
        const msgKey = errObj?.error?.status?.message || 'MSG_ERROR_50000';
        this.notification.show('error', msgKey);
      }
    });
  }
}
