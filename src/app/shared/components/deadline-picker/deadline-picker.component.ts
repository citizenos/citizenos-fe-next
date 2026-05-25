import { Component, input, output, signal, computed, ChangeDetectionStrategy, effect, inject, untracked } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, UpperCasePipe } from '@angular/common';
import { CosCalenderComponent } from '../cos-calender/cos-calender.component';

@Component({
  selector: 'cos-deadline-picker',
  standalone: true,
  imports: [TranslateModule, FormsModule, CommonModule, UpperCasePipe, CosCalenderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="radio_wrap discussion date_selector" [class.selected]="enabled()">
      <div class="radio_text_wrap date_selector">
        <div class="radio_lable_wrap">
          <label class="checkbox" [class.selected]="enabled()">
            <input type="checkbox" [checked]="enabled()" (change)="toggleDeadline()" (click)="$event.stopPropagation()">
            <span class="checkmark"></span>
            <div class="checkbox_text_wrap">
              <span class="bold" [translate]="toggleLabel()"></span>
              @if (enabled() && dateValue()) {
                <span class="deadline bold">{{ computeDeadline() | date: 'y-MM-dd HH:mm' }}</span>
              }
            </div>
          </label>
        </div>

        @if (enabled()) {
          <div class="deadline_wrap">
            <div class="date_row">
              <span class="deadline" translate="VIEWS.TOPIC_CREATE.LBL_TIMEZONE"></span>
            </div>
            <div class="date_row">
              <div class="bold date_row_title" translate="VIEWS.TOPIC_CREATE.DEADLINE_LBL_TIME"></div>
              <div class="input_wrap">
                <div class="time_wrap">
                  <input
                    class="time_input"
                    type="number"
                    [min]="minHours()"
                    [max]="maxHours()"
                    [ngModel]="endsAtH()"
                    (ngModelChange)="setHours($event)"
                  />
                  <span class="time_separator">:</span>
                  <input
                    class="time_input"
                    type="number"
                    min="0"
                    max="59"
                    step="5"
                    [ngModel]="endsAtMin()"
                    (ngModelChange)="setMinutes($event)"
                  />
                </div>

                <div class="dropdown" [class.dropdown_active]="showFormatOptions()" (click)="toggleFormatDropdown(); $event.stopPropagation();">
                  <div class="selection">
                    <div class="selected_item">
                      {{ 'VIEWS.TOPIC_CREATE.DEADLINE_TIME_OPTION_' + timeFormat() | uppercase | translate }}
                    </div>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17 10L12 15L7 10" stroke="#727C84" stroke-width="2" stroke-linecap="round" />
                    </svg>
                  </div>
                  @if (showFormatOptions()) {
                    <div class="options">
                      <div class="option" translate="VIEWS.TOPIC_CREATE.DEADLINE_TIME_OPTION_24" (click)="setTimeFormat(24)"></div>
                      <div class="option" translate="VIEWS.TOPIC_CREATE.DEADLINE_TIME_OPTION_AM" (click)="setTimeFormat('AM')"></div>
                      <div class="option" translate="VIEWS.TOPIC_CREATE.DEADLINE_TIME_OPTION_PM" (click)="setTimeFormat('PM')"></div>
                    </div>
                  }
                </div>
              </div>
            </div>

            <cos-calender
              [minDate]="datePickerMin()"
              [date]="dateValue() || undefined"
              (dateChange)="onCalenderDateChange($event)"
              class="discussion"
            ></cos-calender>

            @if (showReminder()) {
              <div class="reminder-section">
                <label class="checkbox-label" (click)="toggleReminder(); $event.stopPropagation();">
                  <input type="checkbox" [checked]="reminderEnabled()" (click)="$event.stopPropagation()">
                  <span class="checkmark"></span>
                  <span class="bold" translate="VIEWS.DEADLINE_PICKER.SET_REMINDER"></span>
                </label>
                @if (reminderEnabled() && availableReminders().length) {
                  <select
                    id="deadline_reminder"
                    class="reminder-select"
                    [ngModel]="selectedReminderIndex()"
                    (ngModelChange)="onReminderSelect($event)"
                    [attr.aria-label]="'VIEWS.DEADLINE_PICKER.SET_REMINDER' | translate"
                  >
                    @for (opt of availableReminders(); track $index; let i = $index) {
                      <option [value]="i">{{ getReminderLabel(opt) }}</option>
                    }
                  </select>
                }
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .radio_wrap {
      display: flex;
      flex-direction: row;
      position: relative;
      padding: 16px;
      gap: 8px;
      border: 1px solid var(--color-border);
      border-radius: 8px;
      cursor: pointer;
      background: var(--color-surfaces);
      width: 100%;
      box-sizing: border-box;

      &.selected {
        border-color: var(--color-primary, #1168a8);
      }

      .radio_text_wrap {
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: 100%;

        .radio_lable_wrap {
          display: flex;
          flex-direction: row;
          width: 100%;
        }
      }
    }

    .checkbox {
      display: flex;
      position: relative;
      cursor: pointer;
      user-select: none;
      align-items: center;
      gap: 12px;
      width: 100%;

      input {
        position: absolute;
        opacity: 0;
        cursor: pointer;
        height: 0;
        width: 0;
      }

      .checkmark {
        height: 24px;
        width: 24px;
        background-color: white;
        border: 1px solid var(--color-border-bold, #727c84);
        border-radius: 8px;
        position: relative;
        flex-shrink: 0;
        
        &:after {
          content: "";
          position: absolute;
          display: none;
          left: 7.5px;
          top: 3.5px;
          width: 5px;
          height: 10px;
          border: solid white;
          border-width: 0 3px 3px 0;
          transform: rotate(45deg);
        }
      }

      &.selected .checkmark {
        background-color: var(--color-link, #1168a8);
        border-color: var(--color-link, #1168a8);
        &:after {
          display: block;
        }
      }

      .checkbox_text_wrap {
        font-weight: 500;
        display: flex;
        justify-content: space-between;
        width: 100%;
        align-items: center;

        .deadline {
          font-size: 14px;
          color: var(--color-text-main, #2c3b47);
        }
      }
    }

    .deadline_wrap {
      display: flex;
      flex-direction: column;
      width: 100%;
      gap: 16px;
      margin-top: 16px;
      padding-left: 36px;
      box-sizing: border-box;

      .date_row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 24px;

        .date_row_title {
          min-width: 25%;
          font-weight: 600;
          font-size: 14px;
        }

        .input_wrap {
          flex-grow: 2;
          display: flex;
          gap: 8px;
          align-items: center;
          justify-content: flex-end;
          width: 100%;

          .time_wrap {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .time_input {
            width: 60px;
            padding: 8px;
            border: 1px solid var(--color-border);
            border-radius: 4px;
            text-align: center;
            font-size: 14px;
            background: var(--color-surfaces);
            color: var(--color-text);
          }

          .time_separator {
            font-weight: bold;
          }

          .dropdown {
            position: relative;
            cursor: pointer;
            border: 1px solid var(--color-border);
            border-radius: 4px;
            padding: 8px 12px;
            min-width: 80px;
            background: var(--color-surfaces);

            .selection {
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 13px;
              font-weight: 600;
            }

            .options {
              position: absolute;
              top: 100%;
              left: 0;
              width: 100%;
              background: var(--color-surfaces);
              border: 1px solid var(--color-border);
              border-top: none;
              border-radius: 0 0 4px 4px;
              z-index: 100;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

              .option {
                padding: 8px 12px;
                font-size: 13px;

                &:hover {
                  background-color: var(--color-background-hover, #f0f0f0);
                }
              }
            }
          }
        }
      }
    }

    .reminder-section {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding-top: 16px;
      border-top: 1px solid var(--color-border);
      width: 100%;

      .checkbox-label {
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;

        input {
          position: absolute;
          opacity: 0;
          height: 0;
          width: 0;
        }

        .checkmark {
          height: 20px;
          width: 20px;
          background-color: white;
          border: 1px solid var(--color-border-bold);
          border-radius: 4px;
          position: relative;

          &:after {
            content: "";
            position: absolute;
            display: none;
            left: 6px;
            top: 2px;
            width: 4px;
            height: 8px;
            border: solid white;
            border-width: 0 2px 2px 0;
            transform: rotate(45deg);
          }
        }

        input:checked ~ .checkmark {
          background-color: var(--color-link);
          border-color: var(--color-link);
          &:after {
            display: block;
          }
        }
      }

      .reminder-select {
        padding: 8px 12px;
        border: 1px solid var(--color-border);
        border-radius: 4px;
        font-size: 14px;
        background: var(--color-surfaces);
        margin-top: 8px;
      }
    }
  `]
})
export class DeadlinePickerComponent {
  private translate = inject(TranslateService);

  deadline = input<Date | null>(null);
  showReminder = input<boolean>(false);
  toggleLabel = input<string>('VIEWS.DEADLINE_PICKER.SET_DEADLINE');

  deadlineChange = output<Date | null>();
  reminderChange = output<Date | null>();

  enabled = signal(false);
  timeFormat = signal<number | string>(24);
  endsAtH = signal(0);
  endsAtMin = signal(0);
  dateValue = signal<Date | null>(null);
  showFormatOptions = signal(false);
  reminderEnabled = signal(false);
  selectedReminderIndex = signal(0);

  private readonly reminderOptionsList = [
    { value: 1, unit: 'days' },
    { value: 2, unit: 'days' },
    { value: 3, unit: 'days' },
    { value: 1, unit: 'weeks' },
    { value: 2, unit: 'weeks' },
    { value: 1, unit: 'month' }
  ];

  datePickerMin = computed(() => new Date());

  minHours = computed(() => {
    if (this.timeFormat() === 'AM' || this.timeFormat() === 'PM') {
      return 1;
    }
    return 0;
  });

  maxHours = computed(() => {
    if (this.timeFormat() === 'AM' || this.timeFormat() === 'PM') {
      return 12;
    }
    return 23;
  });

  daysLeft = computed(() => {
    if (!this.enabled() || !this.dateValue()) return null;
    const dl = this.computeDeadline();
    if (!dl) return null;
    return Math.ceil((dl.getTime() - Date.now()) / (1000 * 3600 * 24));
  });

  availableReminders = computed(() => {
    if (!this.enabled() || !this.dateValue()) return [];
    const dl = this.computeDeadline();
    if (!dl) return [];

    return this.reminderOptionsList.filter(item => {
      const t = new Date(dl);
      switch (item.unit) {
        case 'weeks':
          t.setDate(t.getDate() + 1 - item.value * 7);
          break;
        case 'month':
          t.setMonth(t.getMonth() - item.value);
          break;
        default:
          t.setDate(t.getDate() + 1 - item.value);
      }
      return t > new Date();
    });
  });

  constructor() {
    effect(() => {
      const d = this.deadline();
      if (d) {
        const parsedDate = new Date(d);
        parsedDate.setSeconds(0);
        parsedDate.setMilliseconds(0);
        const currentComputed = untracked(() => this.computeDeadline());
        if (!currentComputed || parsedDate.getTime() !== currentComputed.getTime()) {
          this.enabled.set(true);
          this.dateValue.set(parsedDate);
          this.endsAtH.set(parsedDate.getHours());
          this.endsAtMin.set(parsedDate.getMinutes());
          this.timeFormat.set(24); // Default to 24h
        }
      } else {
        this.enabled.set(false);
      }
    }, { allowSignalWrites: true });
  }

  toggleDeadline() {
    this.enabled.update(v => !v);
    if (this.enabled()) {
      const now = new Date();
      this.endsAtH.set(now.getHours());
      this.endsAtMin.set(Math.ceil(now.getMinutes() / 5) * 5);
      this.dateValue.set(now);
      this.timeFormat.set(24);
      this.emitDeadline();
    } else {
      this.deadlineChange.emit(null);
    }
  }

  onCalenderDateChange(date: Date) {
    this.dateValue.set(date);
    this.emitDeadline();
  }

  setHours(h: number) {
    let hour = +h;
    if (isNaN(hour)) hour = 0;
    const min = this.minHours();
    const max = this.maxHours();
    if (hour < min) hour = min;
    if (hour > max) hour = max;
    this.endsAtH.set(hour);
    this.emitDeadline();
  }

  setMinutes(m: number) {
    let min = +m;
    if (isNaN(min)) min = 0;
    if (min < 0) min = 0;
    if (min > 59) min = 59;
    this.endsAtMin.set(min);
    this.emitDeadline();
  }

  toggleFormatDropdown() {
    this.showFormatOptions.update(v => !v);
  }

  setTimeFormat(fmt: number | string) {
    const prevFormat = this.timeFormat();
    this.timeFormat.set(fmt);
    this.showFormatOptions.set(false);

    let h = this.endsAtH();
    if (fmt === 24) {
      if (prevFormat === 'PM' && h < 12) {
        h += 12;
      } else if (prevFormat === 'AM' && h === 12) {
        h = 0;
      }
    } else {
      if (prevFormat === 24) {
        if (h > 12) {
          h -= 12;
          this.timeFormat.set('PM');
        } else if (h === 0) {
          h = 12;
          this.timeFormat.set('AM');
        } else if (h === 12) {
          this.timeFormat.set('PM');
        } else {
          this.timeFormat.set('AM');
        }
      }
    }
    this.endsAtH.set(h);
    this.emitDeadline();
  }

  toggleReminder() {
    this.reminderEnabled.update(v => !v);
    if (!this.reminderEnabled()) {
      this.reminderChange.emit(null);
    } else {
      this.emitReminder();
    }
  }

  onReminderSelect(index: number) {
    this.selectedReminderIndex.set(+index);
    this.emitReminder();
  }

  formatTime(val: number): string {
    return val < 10 ? '0' + val : '' + val;
  }

  getReminderLabel(opt: { value: number; unit: string }): string {
    return this.translate.instant('OPTION_' + opt.value + '_' + opt.unit.toUpperCase());
  }

  computeDeadline(): Date | null {
    const d = this.dateValue();
    if (!d) return null;
    const dl = new Date(d);

    let hour = this.endsAtH();
    const fmt = this.timeFormat();
    if (fmt === 'PM' && hour < 12) {
      hour += 12;
    } else if (fmt === 'AM' && hour === 12) {
      hour = 0;
    }

    dl.setHours(hour);
    dl.setMinutes(this.endsAtMin());
    dl.setSeconds(0);
    dl.setMilliseconds(0);
    return dl;
  }

  private emitDeadline() {
    this.deadlineChange.emit(this.computeDeadline());
  }

  private emitReminder() {
    const reminders = this.availableReminders();
    const idx = this.selectedReminderIndex();
    if (idx >= 0 && idx < reminders.length) {
      const opt = reminders[idx];
      const dl = this.computeDeadline();
      if (!dl) return;
      const rt = new Date(dl);
      switch (opt.unit) {
        case 'weeks':
          rt.setDate(rt.getDate() - opt.value * 7);
          break;
        case 'month':
          rt.setMonth(rt.getMonth() - opt.value);
          break;
        default:
          rt.setDate(rt.getDate() - opt.value);
      }
      this.reminderChange.emit(rt);
    }
  }
}
