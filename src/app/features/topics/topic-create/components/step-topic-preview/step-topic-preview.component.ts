import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Topic } from '../../../../../core/interfaces/topic';
import { TopicPreviewComponent } from '../../../../../shared/components/topic-preview/topic-preview.component';
import { AnyPipe } from '../../../../../shared/pipes/any.pipe';
import { Ideation } from '../../../../../core/interfaces/ideation';
import { Vote } from '../../../../../core/interfaces/vote';

@Component({
  selector: 'cos-step-topic-preview',
  standalone: true,
  imports: [TranslateModule, TopicPreviewComponent, AnyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="step-container">
      <cos-topic-preview
        [topic]="topic() | any"
        [ideation]="ideation() | any"
        [vote]="vote() | any"
      ></cos-topic-preview>
    </div>
  `,
  styles: [`
    .step-container {
      display: flex;
      flex-direction: column;
      gap: 32px;
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
}
