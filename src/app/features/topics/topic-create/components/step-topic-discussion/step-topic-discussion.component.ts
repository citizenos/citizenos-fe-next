import { Component, input, output, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DiscussionData } from '../../../../../core/interfaces/discussion';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';

@Component({
  selector: 'cos-step-topic-discussion',
  standalone: true,
  imports: [FormsModule, TranslateModule, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="step-container">
      <div class="section">
        <h3 translate="VIEWS.TOPIC_CREATE.SETTINGS_HEADING_DISCUSSION_QUESTION"></h3>
        <p translate="VIEWS.TOPIC_CREATE.SETTINGS_HEADING_DISCUSSION_QUESTION_DESC"></p>
        <input
          class="question-input"
          type="text"
          [placeholder]="'VIEWS.TOPIC_CREATE.SETTINGS_DISCUSSION_QUESTION_PLACEHOLDER' | translate"
          [ngModel]="discussion().question"
          (ngModelChange)="onQuestionChange($event)"
        />
      </div>

      <div class="section">
        <h3 translate="VIEWS.TOPIC_CREATE.SETTINGS_HEADING_DISCUSSION_DEADLINE"></h3>
        <p translate="VIEWS.TOPIC_CREATE.SETTINGS_HEADING_DISCUSSION_DEADLINE_DESC"></p>
        <div class="deadline-toggle">
          <label class="checkbox">
            <input
              type="checkbox"
              [checked]="deadlineEnabled()"
              (change)="toggleDeadline()"
            />
            <span translate="VIEWS.TOPIC_CREATE.LBL_OPTION_DEADLINE"></span>
          </label>
        </div>
        @if (deadlineEnabled()) {
          <input
            class="deadline-input"
            type="datetime-local"
            [ngModel]="discussion().deadline"
            (ngModelChange)="onDeadlineChange($event)"
          />
        }
      </div>

      <div class="actions">
        <cos-button variant="secondary" (clicked)="previous.emit()">
          {{ 'VIEWS.TOPIC_CREATE.BTN_PREVIOUS' | translate }}
        </cos-button>
        <cos-button variant="primary" (clicked)="next.emit()">
          {{ 'VIEWS.TOPIC_CREATE.BTN_NEXT' | translate }}
        </cos-button>
      </div>
    </div>
  `,
  styles: [`
    .step-container {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .section {
      display: flex;
      flex-direction: column;
      gap: 12px;

      h3 { font-size: 16px; font-weight: 600; margin: 0; }
      p { font-size: 14px; color: var(--color-text-muted); margin: 0; line-height: 1.5; }
    }

    .question-input, .deadline-input {
      width: 100%;
      padding: 10px 14px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      font-size: 14px;
      box-sizing: border-box;
    }

    .deadline-toggle {
      label { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 14px; }
    }

    .actions {
      display: flex;
      justify-content: space-between;
      margin-top: 8px;
    }
  `]
})
export class StepTopicDiscussionComponent implements OnInit {
  discussion = input<DiscussionData>({ question: '', deadline: null });
  discussionChange = output<DiscussionData>();
  next = output<void>();
  previous = output<void>();

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
