import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Topic } from '../../../../../core/interfaces/topic';
import { TopicSettingsPanelComponent } from '../../../../../shared/components/topic-settings-panel/topic-settings-panel.component';
import { AnyPipe } from '../../../../../shared/pipes/any.pipe';

@Component({
  selector: 'cos-step-topic-settings',
  standalone: true,
  imports: [TranslateModule, TopicSettingsPanelComponent, AnyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="step-container">
      <cos-topic-settings-panel
        [topic]="topic() | any"
        (visibilityChange)="onUpdate({visibility: $event})"
        (categoriesChange)="onUpdate({categories: $event})"
        (countryChange)="onUpdate({country: $event})"
        (languageChange)="onUpdate({language: $event})"
      ></cos-topic-settings-panel>
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
export class StepTopicSettingsComponent {
  topic = input<Partial<Topic>>({
    visibility: 'private',
    categories: [],
    country: null,
    language: null
  });
  topicUpdate = output<Partial<Topic>>();

  onUpdate(updates: Partial<Topic>) {
    this.topicUpdate.emit(updates);
  }
}
