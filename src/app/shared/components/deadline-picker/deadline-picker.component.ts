import { Component, input, output, signal, computed, ChangeDetectionStrategy, effect } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { inject } from '@angular/core';

@Component({
  selector: 'cos-deadline-picker',
  standalone: true,
  imports: [TranslateModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="deadline-picker">
      <div class="deadline-toggle" (click)="toggleDeadline()">
        <label class="toggle-label">
          <input type="checkbox" [checked]="enabled()" (click)="$event.stopPropagation()">
          <span>{{ toggleLabel() | translate }}</span>
        </label>
      </div>

      @if (enabled()) {
        <div class="deadline-fields">
          <div class="date-row">
            <input
              type="date"
              class="date-input"
              [min]="minDateStr()"
              [ngModel]="dateStr()"
              (ngModelChange)="onDateChange($event)"
            />
          </div>

          <div class="time-row">
            <div class="time-field">
              <label>{{ 'VIEWS.DEADLINE_PICKER.HOURS' | translate }}</label>
              <select [ngModel]="hours()" (ngModelChange)="setHours($event)">
                @for (h of hourOptions(); track h) {
                  <option [value]="h">{{ formatTime(h) }}</option>
                }
              </select>
            </div>
            <div class="time-separator">:</div>
            <div class="time-field">
              <label>{{ 'VIEWS.DEADLINE_PICKER.MINUTES' | translate }}</label>
              <select [ngModel]="minutes()" (ngModelChange)="setMinutes($event)">
                @for (m of minuteOptions; track m) {
                  <option [value]="m">{{ formatTime(m) }}</option>
                }
              </select>
            </div>
          </div>

          @if (daysLeft() !== null) {
            <div class="days-left" [class.urgent]="daysLeft()! <= 1">
              {{ daysLeft() }} {{ 'VIEWS.DEADLINE_PICKER.DAYS_LEFT' | translate }}
            </div>
          }

          @if (showReminder()) {
            <div class="reminder-section">
              <label class="toggle-label">
                <input type="checkbox" [checked]="reminderEnabled()" (change)="toggleReminder()">
                <span>{{ 'VIEWS.DEADLINE_PICKER.SET_REMINDER' | translate }}</span>
              </label>
              @if (reminderEnabled() && availableReminders().length) {
                <select
                  class="reminder-select"
                  [ngModel]="selectedReminderIndex()"
                  (ngModelChange)="onReminderSelect($event)"
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
  `,
  styles: [`
    .deadline-picker {
      width: 100%;
    }

    .deadline-toggle {
      cursor: pointer;
    }

    .toggle-label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-weight: 500;
    }

    .deadline-fields {
      margin-top: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .date-input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      font-size: 14px;
      background: var(--color-surfaces);
    }

    .time-row {
      display: flex;
      align-items: flex-end;
      gap: 8px;
    }

    .time-field {
      display: flex;
      flex-direction: column;
      gap: 4px;

      label {
        font-size: 12px;
        color: var(--color-text-muted);
      }

      select {
        padding: 8px 12px;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        font-size: 14px;
        background: var(--color-surfaces);
        min-width: 80px;
      }
    }

    .time-separator {
      font-size: 20px;
      font-weight: 700;
      padding-bottom: 8px;
    }

    .days-left {
      font-size: 13px;
      color: var(--color-text-muted);

      &.urgent {
        color: var(--color-danger);
        font-weight: 600;
      }
    }

    .reminder-section {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding-top: 8px;
      border-top: 1px solid var(--color-border);
    }

    .reminder-select {
      padding: 8px 12px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      font-size: 14px;
      background: var(--color-surfaces);
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
  hours = signal(0);
  minutes = signal(0);
  dateValue = signal<Date | null>(null);
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

  minuteOptions = Array.from({ length: 12 }, (_, i) => i * 5);

  hourOptions = computed(() => {
    const d = this.dateValue();
    if (d && this.isSameDay(d, new Date())) {
      return Array.from({ length: 24 - new Date().getHours() }, (_, i) => i + new Date().getHours());
    }
    return Array.from({ length: 24 }, (_, i) => i);
  });

  minDateStr = computed(() => {
    const now = new Date();
    return this.dateToStr(now);
  });

  dateStr = computed(() => {
    const d = this.dateValue();
    return d ? this.dateToStr(d) : '';
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
        this.enabled.set(true);
        this.dateValue.set(d);
        this.hours.set(d.getHours());
        this.minutes.set(d.getMinutes());
      }
    });
  }

  toggleDeadline() {
    this.enabled.update(v => !v);
    if (this.enabled()) {
      const now = new Date();
      this.hours.set(now.getHours());
      this.minutes.set(Math.ceil(now.getMinutes() / 5) * 5);
      this.dateValue.set(now);
      this.emitDeadline();
    } else {
      this.deadlineChange.emit(null);
    }
  }

  onDateChange(dateStr: string) {
    this.dateValue.set(new Date(dateStr));
    this.emitDeadline();
  }

  setHours(h: number) {
    this.hours.set(+h);
    this.emitDeadline();
  }

  setMinutes(m: number) {
    this.minutes.set(+m);
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

  private computeDeadline(): Date | null {
    const d = this.dateValue();
    if (!d) return null;
    const dl = new Date(d);
    dl.setHours(this.hours());
    dl.setMinutes(this.minutes());
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

  private isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();
  }

  private dateToStr(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
