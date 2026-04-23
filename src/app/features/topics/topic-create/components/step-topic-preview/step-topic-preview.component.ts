import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Topic } from '../../../../../core/interfaces/topic';
import { TopicPreviewComponent } from '../../../../../shared/components/topic-preview/topic-preview.component';
import { AnyPipe } from '../../../../../shared/pipes/any.pipe';
import { Ideation } from '../../../../../core/interfaces/ideation';
import { Vote } from '../../../../../core/interfaces/vote';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';

@Component({
  selector: 'cos-step-topic-preview',
  standalone: true,
  imports: [TranslateModule, TopicPreviewComponent, AnyPipe, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="step-container">
      <div class="preview-card">
        <cos-topic-preview
          [topic]="topic() | any"
          [ideation]="ideation() | any"
          [vote]="vote() | any"
        ></cos-topic-preview>
      </div>

      <div class="actions">
        <cos-button
          variant="secondary"
          (clicked)="previous.emit()"
        >
          {{ 'VIEWS.TOPIC_CREATE.HEADER_IMAGE_BTN_CANCEL' | translate }}
        </cos-button>
        <cos-button
          variant="success"
          (clicked)="save.emit()"
        >
          {{ 'VIEWS.TOPIC_CREATE.FOOTER_BTN_CREATE' | translate }}
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

    .preview-card {
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: 24px;
      background: white;
    }

    .actions {
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
    }

    .btn-success, .btn-secondary {
      padding: 12px 32px;
      border-radius: var(--radius-md);
      font-weight: 600;
      cursor: pointer;
    }

    .btn-success {
      background: var(--color-success);
      color: white;
      border: none;
    }

    .btn-secondary {
      background: none;
      border: 1px solid var(--color-border);
      color: var(--color-text);
    }
  `]
})
export class StepTopicPreviewComponent {
  topic = input<Partial<Topic>>({
    title: '',
    description: ''
  });
  ideation = input<Partial<Ideation> | null>(null);
  vote = input<Partial<Vote> | null>(null);
  previous = output<void>();
  save = output<void>();
}
