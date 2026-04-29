import { Component, input, output, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DiscussionData } from '../../../../../core/interfaces/discussion';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';

@Component({
  selector: 'cos-step-topic-discussion',
  standalone: true,
  imports: [FormsModule, TranslateModule, ButtonComponent, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './step-topic-discussion.component.html',
  styleUrl: './step-topic-discussion.component.scss'
})
export class StepTopicDiscussionComponent implements OnInit {
  discussion = input<DiscussionData>({ question: '', deadline: null });
  discussionChange = output<DiscussionData>();
  next = output<void>();
  previous = output<void>();

  deadlineEnabled = signal(false);
  block = signal({
    question: true,
    deadline: true
  });

  ngOnInit() {
    if (this.discussion().deadline) {
      this.deadlineEnabled.set(true);
    }
  }

  toggleBlock(name: keyof ReturnType<typeof this.block>) {
    this.block.update(b => ({ ...b, [name]: !b[name] }));
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
