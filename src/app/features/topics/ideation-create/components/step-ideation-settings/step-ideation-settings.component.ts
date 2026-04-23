import { Component, input, output, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { Ideation } from '../../../../../core/interfaces/ideation';
import { Topic } from '../../../../../core/interfaces/topic';

import { InputComponent } from '../../../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';

@Component({
  selector: 'cos-step-ideation-settings',
  standalone: true,
  imports: [TranslateModule, FormsModule, InputComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="step-container">
      <div class="form-section">
        <label translate="VIEWS.IDEATION_CREATE.SETTINGS_HEADING_IDEATION_QUESTION"></label>
        <cos-input [placeholder]="'VIEWS.IDEATION_CREATE.SETTINGS_IDEATION_QUESTION_PLACEHOLDER' | translate">
          <textarea
            [(ngModel)]="ideation().question"
            (ngModelChange)="onIdeationUpdate()"
            rows="3"
          ></textarea>
        </cos-input>
      </div>

      <div class="settings-grid">
        <div class="setting-item">
          <label class="checkbox-container">
            <input
              type="checkbox"
              [(ngModel)]="ideation().allowAnonymous"
              (ngModelChange)="onToggleAnonymous()"
            />
            <span class="checkmark"></span>
            <span translate="VIEWS.IDEATION_CREATE.LABEL_ALLOW_ANONYMOUS"></span>
          </label>
          <p class="setting-desc" translate="VIEWS.IDEATION_CREATE.DESC_ALLOW_ANONYMOUS"></p>
        </div>

        <div class="setting-item">
          <label class="checkbox-container">
            <input
              type="checkbox"
              [(ngModel)]="ideation().disableReplies"
              (ngModelChange)="onIdeationUpdate()"
            />
            <span class="checkmark"></span>
            <span translate="VIEWS.IDEATION_CREATE.LABEL_DISABLE_REPLIES"></span>
          </label>
          <p class="setting-desc" translate="VIEWS.IDEATION_CREATE.DESC_DISABLE_REPLIES"></p>
        </div>
      </div>

      <div class="actions">
        <cos-button
          variant="secondary"
          (clicked)="previous.emit()"
        >
          {{ 'VIEWS.TOPIC_CREATE.HEADER_IMAGE_BTN_CANCEL' | translate }}
        </cos-button>
        <cos-button
          variant="primary"
          [isDisabled]="!ideation().question"
          (clicked)="next.emit()"
        >
          {{ 'VIEWS.TOPIC_CREATE.FOOTER_BTN_CONTINUE' | translate }}
        </cos-button>
      </div>
    </div>
  `,
  styles: [`
    .step-container { display: flex; flex-direction: column; gap: 32px; }
    .form-section { display: flex; flex-direction: column; gap: 8px; }
    .form-control {
      width: 100%;
      padding: 12px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-surface);
      color: var(--color-text);
      font-size: 16px;
    }
    .settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .setting-item { display: flex; flex-direction: column; gap: 8px; }
    .setting-desc { font-size: 12px; color: var(--color-text-muted); line-height: 1.4; }
    .checkbox-container { display: flex; align-items: center; gap: 12px; cursor: pointer; font-weight: 500; }
    .actions { display: flex; justify-content: space-between; margin-top: 20px; }
    .btn-primary, .btn-secondary { padding: 12px 32px; border-radius: var(--radius-md); font-weight: 600; cursor: pointer; }
    .btn-primary { background: var(--color-primary); color: white; border: none; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-secondary { background: none; border: 1px solid var(--color-border); color: var(--color-text); }
  `]
})
export class StepIdeationSettingsComponent {
  ideation = input<Partial<Ideation>>({
    question: '',
    allowAnonymous: false,
    disableReplies: false
  });
  ideationUpdate = output<Partial<Ideation>>();
  next = output<void>();
  previous = output<void>();

  onIdeationUpdate() {
    this.ideationUpdate.emit(this.ideation());
  }

  onToggleAnonymous() {
    const current = this.ideation();
    if (current.allowAnonymous && !current.disableReplies) {
      this.ideationUpdate.emit({
        ...current,
        disableReplies: true
      });
    } else {
      this.onIdeationUpdate();
    }
  }
}
