import { Component, input, output, computed, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { StepNavigatorComponent, StepConfig } from '../step-navigator/step-navigator.component';
import { DomainIconComponent, DomainType } from '../domain-icon/domain-icon.component';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'cos-create-wizard-shell',
  standalone: true,
  imports: [TranslateModule, StepNavigatorComponent, DomainIconComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './create-wizard-shell.component.html',
  styleUrl: './create-wizard-shell.component.scss'
})
export class CreateWizardShellComponent {
  domainType = input.required<DomainType>();
  headingKey = input.required<string>();
  steps = input.required<StepConfig[]>();
  currentStep = input.required<string>();
  hasSidebar = input(false);
  isNextDisabled = input(false);

  stepChange = output<string>();
  saveDraft = output<void>();
  footerContinue = output<void>();
  footerBack = output<void>();

  isFirstStep = computed(() => {
    const s = this.steps();
    return s.length === 0 || s[0].key === this.currentStep();
  });

  isLastStep = computed(() => {
    const s = this.steps();
    return s.length === 0 || s[s.length - 1].key === this.currentStep();
  });
}
