import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { take } from 'rxjs';
import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';
import { DialogCloseDirective, DialogRef } from '../../../../../shared/dialog/dialog-ref';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { DeadlinePickerComponent } from '../../../../../shared/components/deadline-picker/deadline-picker.component';
import { TopicDiscussionService } from '../../../../../core/services/topic-discussion.service';
import { TopicService } from '../../../../../core/services/topic.service';
import { Topic } from '../../../../../core/interfaces/topic';
import { DiscussionData } from '../../../../../core/interfaces/discussion';

export interface MissingDiscussionData {
  topic: Topic;
}

@Component({
  selector: 'cos-missing-discussion',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, FormsModule, DialogCloseDirective, IconComponent, InputComponent, DeadlinePickerComponent],
  templateUrl: './missing-discussion.component.html',
  styleUrl: './missing-discussion.component.scss',
})
export class MissingDiscussionComponent {
  private data = inject<MissingDiscussionData>(DIALOG_DATA);
  protected dialogRef = inject(DialogRef);
  private discussionService = inject(TopicDiscussionService);
  private topicService = inject(TopicService);

  topic = this.data.topic;
  question = signal('');
  deadline = signal<Date | null>(null);

  onDeadlineChange(date: Date | null) {
    this.deadline.set(date);
  }

  canEditDiscussion() {
    return this.topicService.canEdit(this.topic);
  }

  save() {
    const t = this.topic;
    const payload: DiscussionData = {
      topicId: t.id,
      question: this.question(),
      deadline: this.deadline()
    };

    const save$ = t.discussionId
      ? this.discussionService.update(t.id, t.discussionId, payload)
      : this.discussionService.create(t.id, payload);

    save$.pipe(take(1)).subscribe({
      next: () => {
        this.topicService.reloadTopic();
        this.dialogRef.close(true);
      }
    });
  }
}
