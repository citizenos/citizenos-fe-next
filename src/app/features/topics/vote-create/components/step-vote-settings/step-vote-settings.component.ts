import { Component, input, output, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Vote, VoteOption } from '../../../../../core/interfaces/vote';
import { DeadlinePickerComponent } from '../../../../../shared/components/deadline-picker/deadline-picker.component';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';

@Component({
  selector: 'cos-step-vote-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, DeadlinePickerComponent, InputComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="step-vote-settings">
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

      <div class="form-group">
        <label translate="COMPONENTS.TOPIC_VOTE_CREATE.SELECT_VOTING_SYSTEM"></label>
          <div class="toggle-group">
            <cos-button
              [variant]="vote().type === 'regular' ? 'primary' : 'secondary'"
              (clicked)="setType('regular')"
            >
              {{ 'COMPONENTS.TOPIC_VOTE_CREATE.OPTION_VOTING_REGULAR' | translate }}
            </cos-button>
            <cos-button
              [variant]="vote().type === 'multiple' ? 'primary' : 'secondary'"
              (clicked)="setType('multiple')"
            >
              {{ 'COMPONENTS.TOPIC_VOTE_CREATE.OPTION_VOTING_MULTIPLE' | translate }}
            </cos-button>
          </div>
        </div>

        <div class="options-section">
          <h3 translate="COMPONENTS.TOPIC_VOTE_CREATE.LBL_DEFINE_VOTE_ANSWERS"></h3>

          @if (vote().type === 'regular') {
            <div class="predefined-options">
              @for (opt of predefined; track opt) {
                <div class="option-row">
                  <input type="checkbox" [checked]="isPredefinedSelected(opt)" (change)="togglePredefined(opt)">
                  <span [translate]="'COMPONENTS.TOPIC_VOTE_CREATE.LBL_OPTION_' + opt.toUpperCase()"></span>
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
                  <cos-button variant="ghost" (clicked)="removeOption($index)" title="Remove option">
                    <span class="remove-icon">×</span>
                  </cos-button>
                </div>
              }
              <cos-button variant="secondary" (clicked)="addOption()">
                {{ 'COMPONENTS.TOPIC_VOTE_CREATE.BTN_ADD_OPTION' | translate }}
              </cos-button>
            </div>
          }
        </div>

        <div class="settings-grid">
          <div class="settings-left">
            <div class="form-group">
              <label translate="COMPONENTS.TOPIC_VOTE_CREATE.LBL_SET_UP_VOTING_RIGHTS"></label>
              <select [ngModel]="vote().authType" (ngModelChange)="onUpdate({authType: $event})">
                <option value="soft" translate="COMPONENTS.TOPIC_VOTE_CREATE.LBL_OPTION_AUTH_SOFT_ID"></option>
                <option value="hard" translate="COMPONENTS.TOPIC_VOTE_CREATE.LBL_OPTION_AUTH_HARD_ID"></option>
              </select>
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" [ngModel]="vote().delegationIsAllowed" (ngModelChange)="onUpdate({delegationIsAllowed: $event})">
                <span translate="COMPONENTS.TOPIC_VOTE_CREATE.LBL_OPTION_DELEGATION"></span>
              </label>
            </div>
          </div>

          <div class="settings-right">
            <div class="form-group">
              <label translate="COMPONENTS.TOPIC_VOTE_CREATE.LBL_DEADLINE"></label>
              <cos-deadline-picker
                [deadline]="getVoteDeadlineDate()"
                [showReminder]="true"
                [toggleLabel]="'COMPONENTS.TOPIC_VOTE_CREATE.LBL_OPTION_DEADLINE'"
                (deadlineChange)="onDeadlineChange($event)"
              ></cos-deadline-picker>
            </div>
          </div>
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
      .step-vote-settings { display: flex; flex-direction: column; gap: 24px; }
      .form-group { display: flex; flex-direction: column; gap: 8px; }
      .toggle-group { display: flex; gap: 8px; }
      .option-row { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
      .settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; border-top: 1px solid var(--color-border); padding-top: 24px; }
      .settings-left, .settings-right { display: flex; flex-direction: column; gap: 16px; }
      .checkbox-label { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 14px; }
      .navigation-actions { display: flex; justify-content: space-between; margin-top: 32px; }
      .remove-icon { font-size: 24px; line-height: 1; }
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
