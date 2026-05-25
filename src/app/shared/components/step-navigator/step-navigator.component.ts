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
    <div class="step-navigator" role="tablist">
      @for (step of steps(); track step.key; let i = $index) {
        <button
          type="button"
          class="step-tab"
          role="tab"
          [attr.aria-selected]="currentStep() === step.key"
          [class.active]="currentStep() === step.key"
          [class.completed]="isCompleted(i)"
          (click)="stepChange.emit(step.key)"
        >
          <div class="step-number">{{ i + 1 }}.</div>
          <span class="step-text">{{ step.label | translate }}</span>
          <div class="step-icon-mobile">
            <cos-icon [name]="step.icon"></cos-icon>
          </div>
        </button>
      }
      <div class="step-actions">
        <ng-content select="[actions]"></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .step-navigator {
      display: flex;
      align-items: stretch;
      background: var(--color-surfaces);
      border-radius: 16px;
      padding: 0 16px;
      width: 100%;

      @media (max-width: 1024px) {
        border-radius: 0;
        margin-top: -16px;
        padding: 0 8px;
      }

      @media (max-width: 768px) {
        justify-content: space-between;
      }
    }

    .step-tab {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 27px 56px;
      cursor: pointer;
      color: var(--color-text);
      font-weight: 400;
      text-decoration: none;
      border-bottom: 2px solid transparent;
      transition: color 0.2s, border-color 0.2s;

      &.active {
        border-bottom-color: var(--color-link);
        font-weight: 600;

        .step-icon-mobile {
          color: var(--color-link);
        }
      }

      &.completed {
        color: var(--color-success);
      }
    }

    .step-number {
      display: flex;
      align-items: center;
    }

    .step-icon-mobile {
      display: none;
    }

    .step-actions {
      margin-left: auto;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    @media (max-width: 1024px) {
      .step-tab {
        padding: 12px 38px;
      }
      .step-text {
        display: none;
      }
    }

    @media (max-width: 768px) {
      .step-tab {
        flex-grow: 1;
        padding: 12px;
        justify-content: center;
        gap: 4px;
      }
      .step-actions {
        display: none;
      }
      .step-icon-mobile {
        display: flex;
        align-items: center;
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
