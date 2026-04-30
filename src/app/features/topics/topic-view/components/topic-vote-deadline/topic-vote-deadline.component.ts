import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { take } from 'rxjs';
import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';
import { DialogCloseDirective, DialogRef } from '../../../../../shared/dialog/dialog-ref';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { DeadlinePickerComponent } from '../../../../../shared/components/deadline-picker/deadline-picker.component';
import { TopicVoteService } from '../../../../../core/services/topic-vote.service';
import { TopicService } from '../../../../../core/services/topic.service';
import { NotificationService } from '../../../../../core/services/notification.service';

@Component({
  selector: 'app-topic-vote-deadline',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, DialogCloseDirective, DeadlinePickerComponent, IconComponent],
  templateUrl: './topic-vote-deadline.component.html'
})
export class TopicVoteDeadlineComponent {
  data = inject<{ vote: any; topic: any }>(DIALOG_DATA);
  private dialogRef = inject(DialogRef);
  private topicVoteService = inject(TopicVoteService);
  private topicService = inject(TopicService);
  private notification = inject(NotificationService);

  isNew = !this.data.vote.endsAt;
  deadline = signal<Date | null>(this.data.vote.endsAt ? new Date(this.data.vote.endsAt) : null);
  reminderTime = signal<Date | null>(this.data.vote.reminderTime ? new Date(this.data.vote.reminderTime) : null);

  onDeadlineChange(date: Date | null) {
    this.deadline.set(date);
  }

  onReminderChange(date: Date | null) {
    this.reminderTime.set(date);
  }

  save() {
    const vote = { ...this.data.vote, topicId: this.data.topic.id };
    if (this.deadline()) {
      vote.endsAt = this.deadline();
    }
    vote.reminderTime = this.reminderTime();
    this.topicVoteService.update(vote)
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
