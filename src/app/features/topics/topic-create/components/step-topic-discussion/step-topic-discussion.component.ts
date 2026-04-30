import { Component, input, output, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DiscussionData } from '../../../../../core/interfaces/discussion';

@Component({
  selector: 'cos-step-topic-discussion',
  standalone: true,
  imports: [FormsModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './step-topic-discussion.component.html',
  styleUrl: './step-topic-discussion.component.scss'
})
export class StepTopicDiscussionComponent implements OnInit {
  discussion = input<DiscussionData>({ question: '', deadline: null });
  discussionChange = output<DiscussionData>();

  deadlineEnabled = signal(false);

  ngOnInit() {
    if (this.discussion().deadline) {
      this.deadlineEnabled.set(true);
    }
  }

  onQuestionChange(question: string) {
    this.discussionChange.emit({ ...this.discussion(), question });
  }

  toggleDeadline() {
    const enabled = !this.deadlineEnabled();
    this.deadlineEnabled.set(enabled);
    if (!enabled) {
      this.discussionChange.emit({ ...this.discussion(), deadline: null });
    }
  }

  onDeadlineChange(deadline: string) {
    this.discussionChange.emit({ ...this.discussion(), deadline });
  }
}
