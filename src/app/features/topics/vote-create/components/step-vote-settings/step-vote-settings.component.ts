import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Vote } from '../../../../../core/interfaces/vote';
import { DeadlinePickerComponent } from '../../../../../shared/components/deadline-picker/deadline-picker.component';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';

@Component({
  selector: 'cos-step-vote-settings',
  standalone: true,
  imports: [FormsModule, TranslateModule, DeadlinePickerComponent, InputComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="step-vote-settings">

      <!-- Section 1: Vote question -->
      <div class="form-group">
        <label translate="COMPONENTS.TOPIC_VOTE_CREATE.LBL_VOTING_QUESTION"></label>
        <cos-input [placeholder]="'COMPONENTS.TOPIC_VOTE_CREATE.VOTE_QUESTION_PLACEHOLDER' | translate">
          <textarea
            [ngModel]="vote().question"
            (ngModelChange)="onUpdate({question: $event})"
            rows="3"
          ></textarea>
        </cos-input>
      </div>

      <!-- Section 2: Vote type -->
      <div class="form-group">
        <label translate="COMPONENTS.TOPIC_VOTE_CREATE.SELECT_VOTING_SYSTEM"></label>
        <p class="section-desc" translate="COMPONENTS.TOPIC_VOTE_CREATE.SELECT_VOTING_SYSTEM_DESC"></p>
        <div class="radio-cards">
          <div
            class="radio-card"
            [class.selected]="vote().type === 'regular'"
            (click)="setType('regular')"
          >
            <label class="radio-box">
              <input type="radio" [checked]="vote().type === 'regular'" name="voteType" value="regular">
              <span class="radio-indicator"></span>
              <span class="radio-label" translate="COMPONENTS.TOPIC_VOTE_CREATE.OPTION_VOTING_REGULAR"></span>
            </label>
            <p class="radio-description" translate="COMPONENTS.TOPIC_VOTE_CREATE.OPTION_VOTING_REGULAR_DESC"></p>
          </div>
          <div
            class="radio-card"
            [class.selected]="vote().type === 'multiple'"
            (click)="setType('multiple')"
          >
            <label class="radio-box">
              <input type="radio" [checked]="vote().type === 'multiple'" name="voteType" value="multiple">
              <span class="radio-indicator"></span>
              <span class="radio-label" translate="COMPONENTS.TOPIC_VOTE_CREATE.OPTION_VOTING_MULTIPLE"></span>
            </label>
            <p class="radio-description" translate="COMPONENTS.TOPIC_VOTE_CREATE.OPTION_VOTING_MULTIPLE_DESC"></p>
          </div>
        </div>
      </div>

      <!-- Section 3: Vote options -->
      <div class="options-section">
        <h3 translate="COMPONENTS.TOPIC_VOTE_CREATE.LBL_DEFINE_VOTE_ANSWERS"></h3>

        @if (vote().type === 'regular') {
          <div class="predefined-options">
            @for (opt of predefined; track opt) {
              <div
                class="predefined-row"
                [class.selected]="isPredefinedSelected(opt)"
                (click)="togglePredefined(opt)"
              >
                <label class="checkbox-label">
                  <input type="checkbox" [checked]="isPredefinedSelected(opt)" (click)="$event.stopPropagation()">
                  <span class="checkmark"></span>
                  <span [translate]="'COMPONENTS.TOPIC_VOTE_CREATE.LBL_OPTION_' + opt.toUpperCase()"></span>
                </label>
              </div>
            }
          </div>
        } @else {
          <div class="custom-options">
            @for (opt of vote().options || []; track $index) {
              <div class="option-row">
                <cos-input [placeholder]="'COMPONENTS.TOPIC_VOTE_CREATE.PLACEHOLDER_ENTER_A_POSSIBLE_ANSWER' | translate">
                  <input
                    [ngModel]="opt.value"
                    (ngModelChange)="updateOption($index, $event)"
                  >
                </cos-input>
                <cos-button variant="ghost" (clicked)="removeOption($index)">
                  <span class="remove-icon">×</span>
                </cos-button>
              </div>
            }
            <cos-button variant="secondary" (clicked)="addOption()">
              {{ 'COMPONENTS.TOPIC_VOTE_CREATE.BTN_ADD_OPTION' | translate }}
            </cos-button>
          </div>

          <!-- Min/Max choices for multiple type -->
          <div class="min-max-section">
            <h4 translate="COMPONENTS.TOPIC_VOTE_CREATE.LBL_MIN_MAX"></h4>
            <p class="section-desc" translate="COMPONENTS.TOPIC_VOTE_CREATE.VOTE_TXT_DESCRIPTION_CHOICE_RANGE"></p>
            <div class="min-max-row">
              <div class="counter-group">
                <label translate="VIEWS.TOPICS_TOPICID.VOTE_LBL_MIN_CHOICES"></label>
                <div class="counter">
                  <button class="counter-btn" (click)="adjustCount('min', -1)">−</button>
                  <span class="counter-value">{{ vote().minChoices || 1 }}</span>
                  <button class="counter-btn" (click)="adjustCount('min', 1)">+</button>
                </div>
              </div>
              <div class="counter-group">
                <label translate="VIEWS.TOPICS_TOPICID.VOTE_LBL_MAX_CHOICES"></label>
                <div class="counter">
                  <button class="counter-btn" (click)="adjustCount('max', -1)">−</button>
                  <span class="counter-value">{{ vote().maxChoices || getOptionsLimit() }}</span>
                  <button class="counter-btn" (click)="adjustCount('max', 1)">+</button>
                </div>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Section 4: Auth type -->
      <div class="form-group">
        <label translate="COMPONENTS.TOPIC_VOTE_CREATE.LBL_SET_UP_VOTING_RIGHTS"></label>
        <p class="section-desc" translate="COMPONENTS.TOPIC_VOTE_CREATE.LBL_SET_UP_VOTING_RIGHTS_DESC"></p>
        <div class="radio-cards">
          <div
            class="radio-card"
            [class.selected]="vote().authType === 'soft'"
            (click)="onUpdate({authType: 'soft'})"
          >
            <label class="radio-box">
              <input type="radio" [checked]="vote().authType === 'soft'" name="authType" value="soft">
              <span class="radio-indicator"></span>
              <span class="radio-label" translate="COMPONENTS.TOPIC_VOTE_CREATE.LBL_OPTION_AUTH_SOFT_ID"></span>
            </label>
            <p class="radio-description" translate="COMPONENTS.TOPIC_VOTE_CREATE.LBL_OPTION_AUTH_SOFT_ID_DESC"></p>
          </div>
          <div
            class="radio-card"
            [class.selected]="vote().authType === 'hard'"
            (click)="onUpdate({authType: 'hard', delegationIsAllowed: false})"
          >
            <label class="radio-box">
              <input type="radio" [checked]="vote().authType === 'hard'" name="authType" value="hard">
              <span class="radio-indicator"></span>
              <span class="radio-label" translate="COMPONENTS.TOPIC_VOTE_CREATE.LBL_OPTION_AUTH_HARD_ID"></span>
            </label>
            <p class="radio-description" translate="COMPONENTS.TOPIC_VOTE_CREATE.LBL_OPTION_AUTH_HARD_ID_DESC"></p>
          </div>
        </div>
      </div>

      <!-- Section 5: Delegation -->
      <div class="form-group">
        <label translate="COMPONENTS.TOPIC_VOTE_CREATE.LBL_VOTE_DELEGATION"></label>
        <p class="section-desc" translate="COMPONENTS.TOPIC_VOTE_CREATE.LBL_VOTE_DELEGATION_DESC"></p>
        <div
          class="radio-card"
          [class.selected]="vote().delegationIsAllowed"
          [class.disabled]="vote().authType === 'hard'"
          (click)="toggleDelegation()"
        >
          <label class="checkbox-label">
            <input type="checkbox" [checked]="vote().delegationIsAllowed" [disabled]="vote().authType === 'hard'">
            <span class="checkmark"></span>
            <span translate="COMPONENTS.TOPIC_VOTE_CREATE.LBL_OPTION_DELEGATION"></span>
          </label>
        </div>
      </div>

      <!-- Section 6: Deadline -->
      <div class="form-group">
        <label translate="COMPONENTS.TOPIC_VOTE_CREATE.LBL_DEADLINE"></label>
        <p class="section-desc" translate="COMPONENTS.TOPIC_VOTE_CREATE.LBL_DEADLINE_DESC"></p>
        <cos-deadline-picker
          [deadline]="getVoteDeadlineDate()"
          [showReminder]="true"
          [toggleLabel]="'COMPONENTS.TOPIC_VOTE_CREATE.LBL_OPTION_DEADLINE'"
          (deadlineChange)="onDeadlineChange($event)"
        ></cos-deadline-picker>
      </div>

      <div class="navigation-actions">
        <cos-button variant="secondary" (clicked)="previous.emit()">
          {{ 'VIEWS.TOPIC_CREATE.BTN_PREVIOUS' | translate }}
        </cos-button>
        <cos-button variant="primary" (clicked)="next.emit()" [isDisabled]="!isValid()">
          {{ 'VIEWS.TOPIC_CREATE.BTN_NEXT' | translate }}
        </cos-button>
      </div>
    </div>
  `,
  styles: [`
    .step-vote-settings { display: flex; flex-direction: column; gap: 32px; }
    .form-group { display: flex; flex-direction: column; gap: 8px; }
    .section-desc { font-size: 13px; color: var(--color-text-muted); margin: 0; }
    .radio-cards { display: flex; flex-direction: column; gap: 12px; }
    .radio-card {
      padding: 16px;
      border: 2px solid var(--color-border);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: border-color 0.2s;
      &.selected { border-color: var(--color-primary); }
      &.disabled { opacity: 0.5; pointer-events: none; }
    }
    .radio-box { display: flex; align-items: center; gap: 8px; cursor: pointer; }
    .radio-label { font-weight: 600; font-size: 14px; }
    .radio-description { font-size: 13px; color: var(--color-text-muted); margin: 8px 0 0; }
    .options-section { display: flex; flex-direction: column; gap: 16px; h3 { font-size: 15px; font-weight: 600; margin: 0; } }
    .predefined-options { display: flex; flex-direction: column; gap: 8px; }
    .predefined-row { padding: 12px 16px; border: 2px solid var(--color-border); border-radius: var(--radius-md); cursor: pointer; &.selected { border-color: var(--color-primary); } }
    .checkbox-label { display: flex; align-items: center; gap: 10px; cursor: pointer; font-weight: 500; font-size: 14px; }
    .checkmark { width: 18px; height: 18px; border: 2px solid var(--color-border); border-radius: 3px; flex-shrink: 0; }
    .custom-options { display: flex; flex-direction: column; gap: 8px; }
    .option-row { display: flex; align-items: center; gap: 8px; }
    .remove-icon { font-size: 22px; line-height: 1; }
    .min-max-section { margin-top: 16px; h4 { font-size: 14px; font-weight: 600; margin: 0 0 4px; } }
    .min-max-row { display: flex; gap: 32px; margin-top: 12px; }
    .counter-group { display: flex; flex-direction: column; gap: 8px; label { font-size: 13px; font-weight: 500; } }
    .counter { display: flex; align-items: center; gap: 12px; }
    .counter-btn { width: 32px; height: 32px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-surfaces); cursor: pointer; font-size: 18px; display: flex; align-items: center; justify-content: center; &:hover { background: var(--color-secondary); } }
    .counter-value { min-width: 24px; text-align: center; font-weight: 600; }
    .navigation-actions { display: flex; justify-content: space-between; margin-top: 8px; }
  `]
})
export class StepVoteSettingsComponent {
  vote = input.required<Partial<Vote>>();
  voteUpdate = output<Partial<Vote>>();
  next = output<void>();
  previous = output<void>();

  predefined = ['Yes', 'No', 'Neutral', 'Veto'];

  setType(type: 'regular' | 'multiple') {
    const updates: Partial<Vote> = { type };
    let options = [...(this.vote().options || [])];
    if (type === 'regular' && options.length === 0) {
      options = [{ value: 'Yes' }, { value: 'No' }];
    } else if (type === 'multiple') {
      options = options.filter(o => !this.predefined.includes(o.value));
      if (options.length === 0) {
        options = [{ value: '' }, { value: '' }];
      }
    }
    updates.options = options;
    this.onUpdate(updates);
  }

  isPredefinedSelected(val: string): boolean {
    return (this.vote().options || []).some(o => o.value === val);
  }

  togglePredefined(val: string) {
    let options = [...(this.vote().options || [])];
    const index = options.findIndex(o => o.value === val);
    if (index > -1) {
      options.splice(index, 1);
    } else {
      options.push({ value: val });
    }
    this.onUpdate({ options });
  }

  addOption() {
    const options = [...(this.vote().options || []), { value: '' }];
    this.onUpdate({ options });
  }

  updateOption(index: number, value: string) {
    const options = [...(this.vote().options || [])];
    options[index] = { ...options[index], value };
    this.onUpdate({ options });
  }

  removeOption(index: number) {
    const options = [...(this.vote().options || [])];
    options.splice(index, 1);
    this.onUpdate({ options });
  }

  getOptionsLimit(): number {
    return (this.vote().options || []).filter(o => !!o.value).length;
  }

  adjustCount(field: 'min' | 'max', delta: number) {
    const limit = this.getOptionsLimit();
    if (field === 'min') {
      const current = this.vote().minChoices || 1;
      const next = Math.max(1, Math.min(current + delta, limit));
      this.onUpdate({ minChoices: next });
    } else {
      const current = this.vote().maxChoices || limit;
      const next = Math.max(1, Math.min(current + delta, limit));
      this.onUpdate({ maxChoices: next });
    }
  }

  toggleDelegation() {
    if (this.vote().authType === 'hard') return;
    this.onUpdate({ delegationIsAllowed: !this.vote().delegationIsAllowed });
  }

  getVoteDeadlineDate(): Date | null {
    return this.vote().endsAt ? new Date(this.vote().endsAt!) : null;
  }

  onDeadlineChange(date: Date | null) {
    this.onUpdate({ endsAt: date ? date.toISOString() : null });
  }

  onUpdate(updates: Partial<Vote>) {
    this.voteUpdate.emit({ ...this.vote(), ...updates });
  }

  isValid(): boolean {
    return !!this.vote().question && (this.vote().options || []).filter(o => !!o.value).length >= 2;
  }
}
