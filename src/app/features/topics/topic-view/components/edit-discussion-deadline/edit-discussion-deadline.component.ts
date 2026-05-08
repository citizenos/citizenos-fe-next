import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { take } from 'rxjs';
import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';
import { DialogCloseDirective, DialogRef } from '../../../../../shared/dialog/dialog-ref';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { DeadlinePickerComponent } from '../../../../../shared/components/deadline-picker/deadline-picker.component';
import { TopicDiscussionService } from '../../../../../core/services/topic-discussion.service';
import { TopicService } from '../../../../../core/services/topic.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { Discussion } from '../../../../../core/interfaces/discussion';
import { Topic } from '../../../../../core/interfaces/topic';

export interface EditDiscussionDeadlineData {
  discussion: Discussion;
  topic: Topic;
}

@Component({
  selector: 'cos-edit-discussion-deadline',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, DialogCloseDirective, DeadlinePickerComponent, IconComponent],
  templateUrl: './edit-discussion-deadline.component.html',
  styleUrl: './edit-discussion-deadline.component.scss',
})
export class EditDiscussionDeadlineComponent {
  data = inject<EditDiscussionDeadlineData>(DIALOG_DATA);
  protected dialogRef = inject(DialogRef);
  private discussionService = inject(TopicDiscussionService);
  private topicService = inject(TopicService);
  private notification = inject(NotificationService);

  isNew = !this.data.discussion.deadline;
  deadline = signal<Date | null>(this.data.discussion.deadline ? new Date(this.data.discussion.deadline) : null);

  onDeadlineChange(date: Date | null) {
    this.deadline.set(date);
  }

  save() {
    const { discussion, topic } = this.data;
    const update = { topicId: topic.id, discussionId: discussion.id, deadline: this.deadline() };

    this.discussionService.update(topic.id, discussion.id, update as any)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.topicService.reloadTopic();
          this.dialogRef.close();
        },
        error: (err) => {
          const errors = err?.errors || {};
          Object.values(errors).forEach((msg) => {
            if (typeof msg === 'string') this.notification.error(msg);
          });
        }
      });
  }
}
