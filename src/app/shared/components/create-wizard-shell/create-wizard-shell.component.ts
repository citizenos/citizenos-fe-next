import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { StepNavigatorComponent, StepConfig } from '../step-navigator/step-navigator.component';
import { DomainIconComponent, DomainType } from '../domain-icon/domain-icon.component';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'cos-create-wizard-shell',
  standalone: true,
  imports: [TranslateModule, StepNavigatorComponent, DomainIconComponent, ButtonComponent],
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

  stepChange = output<string>();
  saveDraft = output<void>();
}
