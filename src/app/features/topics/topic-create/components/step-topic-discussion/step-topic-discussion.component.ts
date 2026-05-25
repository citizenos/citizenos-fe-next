import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DiscussionData } from '../../../../../core/interfaces/discussion';
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
  discussion = input<DiscussionData>({ question: '', deadline: null });
  discussionChange = output<DiscussionData>();

  onQuestionChange(question: string) {
    this.discussionChange.emit({ ...this.discussion(), question });
  }

  getDiscussionDeadlineDate(): Date | null {
    const deadline = this.discussion().deadline;
    return deadline ? new Date(deadline) : null;
  }

  onDeadlineChange(deadline: Date | null) {
    this.discussionChange.emit({ ...this.discussion(), deadline: deadline ? deadline.toISOString() : null });
  }
}
