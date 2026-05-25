import { Component, input, output, computed, ChangeDetectionStrategy, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { StepNavigatorComponent, StepConfig } from '../step-navigator/step-navigator.component';
import { DomainIconComponent, DomainType } from '../domain-icon/domain-icon.component';
import { IconComponent } from '../icon/icon.component';
import { TopicService } from '../../../core/services/topic.service';
import { Topic } from '../../../core/interfaces/topic';
import { ConfigStore } from '../../../core/state/config.store';

@Component({
  selector: 'cos-create-wizard-shell',
  standalone: true,
  imports: [TranslateModule, StepNavigatorComponent, DomainIconComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './create-wizard-shell.component.html',
  styleUrl: './create-wizard-shell.component.scss'
})
export class CreateWizardShellComponent {
  topicService = inject(TopicService);
  configStore = inject(ConfigStore);

  domainType = input.required<DomainType>();
  headingKey = input.required<string>();
  steps = input.required<StepConfig[]>();
  currentStep = input.required<string>();
  hasSidebar = input(false);
  isNextDisabled = input(false);
  topic = input<Partial<Topic>>();

  stepChange = output<string>();
  saveDraft = output<void>();
  footerContinue = output<void>();
  footerBack = output<void>();
  deleteTopic = output<void>();

  isFirstStep = computed(() => {
    const s = this.steps();
    return s.length === 0 || s[0].key === this.currentStep();
  });

  isLastStep = computed(() => {
    const s = this.steps();
    return s.length === 0 || s[s.length - 1].key === this.currentStep();
  });

  getDownloadUrl(): string {
    const t = this.topic();
    if (!t?.id) return '';
    return `${this.configStore.api.baseUrl()}/api/topics/${t.id}/reports/html`;
  }
}

