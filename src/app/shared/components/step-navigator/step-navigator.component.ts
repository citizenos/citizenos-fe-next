import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IconComponent } from '../icon/icon.component';
import { IconName } from '../icon/icon.registry';

export interface StepConfig {
  key: string;
  label: string;
  icon: IconName;
}

@Component({
  selector: 'cos-step-navigator',
  standalone: true,
  imports: [TranslateModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="step-navigator">
      @for (step of steps(); track step.key; let i = $index) {
        <a
          class="step-tab"
          [class.active]="currentStep() === step.key"
          [class.completed]="isCompleted(i)"
          (click)="stepChange.emit(step.key)"
        >
          <div class="step-number">{{ i + 1 }}.</div>
          <span class="step-text">{{ step.label | translate }}</span>
          <div class="step-icon-mobile">
            <cos-icon [name]="step.icon"></cos-icon>
          </div>
        </a>
      }
      <div class="step-actions">
        <ng-content select="[actions]"></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .step-navigator {
      display: flex;
      align-items: center;
      background: var(--color-surfaces);
      border-bottom: 1px solid var(--color-border);
      padding: 0 16px;
      gap: 4px;
    }

    .step-tab {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px 20px;
      cursor: pointer;
      color: var(--color-text-muted);
      font-weight: 500;
      text-decoration: none;
      border-bottom: 3px solid transparent;
      transition: color 0.2s, border-color 0.2s;

      &:hover {
        color: var(--color-text);
      }

      &.active {
        color: var(--color-primary);
        border-bottom-color: var(--color-primary);
      }

      &.completed {
        color: var(--color-success);
      }
    }

    .step-number {
      font-weight: 700;
      font-size: 14px;
    }

    .step-icon-mobile {
      display: none;
    }

    .step-actions {
      margin-left: auto;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    @media (max-width: 768px) {
      .step-text {
        display: none;
      }
      .step-icon-mobile {
        display: block;
      }
      .step-tab {
        padding: 12px 16px;
      }
      .step-actions {
        display: none;
      }
    }
  `]
})
export class StepNavigatorComponent {
  steps = input<StepConfig[]>([]);
  currentStep = input<string>('');
  stepChange = output<string>();

  isCompleted(index: number): boolean {
    const current = this.steps().findIndex(s => s.key === this.currentStep());
    return index < current;
  }
}
