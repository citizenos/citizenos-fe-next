import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Vote, VoteOption } from '../../../../../core/interfaces/vote';
import { DeadlinePickerComponent } from '../../../../../shared/components/deadline-picker/deadline-picker.component';

@Component({
  selector: 'cos-step-vote-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, DeadlinePickerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="step-vote-settings">
      <div class="form-group">
        <label translate="COMPONENTS.TOPIC_VOTE_CREATE.LBL_VOTING_QUESTION"></label>
        <textarea
          [(ngModel)]="vote.question"
          (ngModelChange)="onUpdate()"
          [placeholder]="'COMPONENTS.TOPIC_VOTE_CREATE.VOTE_QUESTION_PLACEHOLDER' | translate"
          rows="3"
        ></textarea>
      </div>

      <div class="form-group">
        <label translate="COMPONENTS.TOPIC_VOTE_CREATE.SELECT_VOTING_SYSTEM"></label>
        <div class="toggle-group">
          <button
            [class.active]="vote.type === 'regular'"
            (click)="setType('regular')"
            translate="COMPONENTS.TOPIC_VOTE_CREATE.OPTION_VOTING_REGULAR"
          ></button>
          <button
            [class.active]="vote.type === 'multiple'"
            (click)="setType('multiple')"
            translate="COMPONENTS.TOPIC_VOTE_CREATE.OPTION_VOTING_MULTIPLE"
          ></button>
        </div>
      </div>

      <div class="options-section">
        <h3 translate="COMPONENTS.TOPIC_VOTE_CREATE.LBL_DEFINE_VOTE_ANSWERS"></h3>

        @if (vote.type === 'regular') {
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
            @for (opt of vote.options; track $index) {
              <div class="option-row">
                <input
                  [(ngModel)]="opt.value"
                  (ngModelChange)="onUpdate()"
                  [placeholder]="'COMPONENTS.TOPIC_VOTE_CREATE.PLACEHOLDER_ENTER_A_POSSIBLE_ANSWER' | translate"
                >
                <button (click)="removeOption($index)" class="btn-remove" title="Remove option">×</button>
              </div>
            }
            <button (click)="addOption()" class="btn-add" translate="COMPONENTS.TOPIC_VOTE_CREATE.BTN_ADD_OPTION"></button>
          </div>
        }
      </div>

      <div class="settings-grid">
        <div class="settings-left">
          <div class="form-group">
            <label translate="COMPONENTS.TOPIC_VOTE_CREATE.LBL_SET_UP_VOTING_RIGHTS"></label>
            <select [(ngModel)]="vote.authType" (ngModelChange)="onUpdate()">
              <option value="soft" translate="COMPONENTS.TOPIC_VOTE_CREATE.LBL_OPTION_AUTH_SOFT_ID"></option>
              <option value="hard" translate="COMPONENTS.TOPIC_VOTE_CREATE.LBL_OPTION_AUTH_HARD_ID"></option>
            </select>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" [(ngModel)]="vote.delegationIsAllowed" (ngModelChange)="onUpdate()">
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
        <button class="btn-previous" (click)="previous.emit()" translate="VIEWS.TOPIC_CREATE.BTN_PREVIOUS"></button>
        <button class="btn-next" (click)="next.emit()" [disabled]="!isValid()" translate="VIEWS.TOPIC_CREATE.BTN_NEXT"></button>
      </div>
    </div>
  `,
  styles: [`
    .step-vote-settings { display: flex; flex-direction: column; gap: 24px; }
    .form-group { display: flex; flex-direction: column; gap: 8px; }
    .toggle-group { display: flex; gap: 0; border: 1px solid var(--color-border); border-radius: var(--radius-sm); overflow: hidden; width: fit-content; }
    .toggle-group button { border: none; padding: 8px 16px; background: none; cursor: pointer; }
    .toggle-group button.active { background: var(--color-primary); color: white; }
    .option-row { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
    .option-row input[type="text"] { flex: 1; padding: 8px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); }
    .btn-remove { background: none; border: none; font-size: 20px; color: var(--color-error); cursor: pointer; }
    .btn-add { align-self: flex-start; padding: 8px 16px; border: 1px dashed var(--color-border); background: none; cursor: pointer; }
    .settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; border-top: 1px solid var(--color-border); padding-top: 24px; }
    .settings-left, .settings-right { display: flex; flex-direction: column; gap: 16px; }
    .checkbox-label { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 14px; }
    .navigation-actions { display: flex; justify-content: space-between; margin-top: 32px; }
    .btn-next { padding: 10px 24px; background: var(--color-primary); color: white; border: none; border-radius: var(--radius-md); cursor: pointer; }
    .btn-next:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-previous { padding: 10px 24px; background: none; border: 1px solid var(--color-border); border-radius: var(--radius-md); cursor: pointer; }
  `]
})
export class StepVoteSettingsComponent {
  @Input() vote!: Vote;
  @Output() voteUpdate = new EventEmitter<Partial<Vote>>();
  @Output() next = new EventEmitter<void>();
  @Output() previous = new EventEmitter<void>();

  predefined = ['Yes', 'No', 'Neutral', 'Veto'];

  setType(type: 'regular' | 'multiple') {
    this.vote.type = type;
    if (type === 'regular' && this.vote.options.length === 0) {
      this.vote.options = [{ value: 'Yes' }, { value: 'No' }];
    } else if (type === 'multiple') {
      this.vote.options = this.vote.options.filter(o => !this.predefined.includes(o.value));
      if (this.vote.options.length === 0) {
        this.vote.options = [{ value: '' }, { value: '' }];
      }
    }
    this.onUpdate();
  }

  isPredefinedSelected(val: string): boolean {
    return this.vote.options.some(o => o.value === val);
  }

  togglePredefined(val: string) {
    const index = this.vote.options.findIndex(o => o.value === val);
    if (index > -1) {
      this.vote.options.splice(index, 1);
    } else {
      this.vote.options.push({ value: val });
    }
    this.onUpdate();
  }

  addOption() {
    this.vote.options.push({ value: '' });
    this.onUpdate();
  }

  removeOption(index: number) {
    this.vote.options.splice(index, 1);
    this.onUpdate();
  }

  getVoteDeadlineDate(): Date | null {
    return this.vote.endsAt ? new Date(this.vote.endsAt) : null;
  }

  onDeadlineChange(date: Date | null) {
    this.vote.endsAt = date ? date.toISOString() : null;
    this.onUpdate();
  }

  onUpdate() {
    this.voteUpdate.emit(this.vote);
  }

  isValid(): boolean {
    return !!this.vote.question && this.vote.options.filter(o => !!o.value).length >= 2;
  }
}
