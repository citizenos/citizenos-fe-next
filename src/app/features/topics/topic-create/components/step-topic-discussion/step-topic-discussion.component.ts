import { Component, input, output, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DiscussionData } from '../../../../../core/interfaces/discussion';
import { Topic } from '../../../../../core/interfaces/topic';
import { TopicService } from '../../../../../core/services/topic.service';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { DeadlinePickerComponent } from '../../../../../shared/components/deadline-picker/deadline-picker.component';

@Component({
  selector: 'cos-step-topic-discussion',
  standalone: true,
  imports: [FormsModule, TranslateModule, InputComponent, DeadlinePickerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './step-topic-discussion.component.html',
  styleUrl: './step-topic-discussion.component.scss'
})
export class StepTopicDiscussionComponent {
  private topicService = inject(TopicService, { optional: true });

  topic = input<Partial<Topic>>();
  isCreatedFromGroup = input<boolean>(false);
  discussion = input<DiscussionData>({ question: '', deadline: null });
  discussionChange = output<DiscussionData>();

  canEditDiscussion(): boolean {
    const t = this.topic();
    if (!t || !t.id) return true;
    const statuses = ['draft', 'inProgress'];
    const canDelete = this.topicService ? this.topicService.canDelete(t as Topic) : true;
    return canDelete && statuses.includes(t.status || 'draft');
  }

  onQuestionChange(question: string) {
    if (!this.canEditDiscussion()) return;
    this.discussionChange.emit({ ...this.discussion(), question });
  }

  getDiscussionDeadlineDate(): Date | null {
    const deadline = this.discussion().deadline;
    return deadline ? new Date(deadline) : null;
  }

  onDeadlineChange(deadline: Date | null) {
    if (!this.canEditDiscussion()) return;
    this.discussionChange.emit({ ...this.discussion(), deadline: deadline ? deadline.toISOString() : null });
  }
}
