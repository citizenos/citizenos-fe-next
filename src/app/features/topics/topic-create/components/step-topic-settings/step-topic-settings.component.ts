import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Topic } from '../../../../../core/interfaces/topic';
import { TopicSettingsPanelComponent } from '../../../../../shared/components/topic-settings-panel/topic-settings-panel.component';
import { AnyPipe } from '../../../../../shared/pipes/any.pipe';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';

@Component({
  selector: 'cos-step-topic-settings',
  standalone: true,
  imports: [TranslateModule, TopicSettingsPanelComponent, AnyPipe, ButtonComponent],
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

      <div class="actions">
        <cos-button
          variant="secondary"
          (clicked)="previous.emit()"
        >
          {{ 'VIEWS.TOPIC_CREATE.HEADER_IMAGE_BTN_CANCEL' | translate }}
        </cos-button>
        <cos-button
          variant="primary"
          (clicked)="next.emit()"
        >
          {{ 'VIEWS.TOPIC_CREATE.FOOTER_BTN_CONTINUE' | translate }}
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

    .actions {
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
    }

    .btn-primary, .btn-secondary {
      padding: 12px 32px;
      border-radius: var(--radius-md);
      font-weight: 600;
      cursor: pointer;
    }

    .btn-primary {
      background: var(--color-primary);
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
export class StepTopicSettingsComponent {
  topic = input<Partial<Topic>>({
    visibility: 'private',
    categories: [],
    country: null,
    language: null
  });
  topicUpdate = output<Partial<Topic>>();
  next = output<void>();
  previous = output<void>();

  onUpdate(updates: Partial<Topic>) {
    this.topicUpdate.emit(updates);
  }
}
