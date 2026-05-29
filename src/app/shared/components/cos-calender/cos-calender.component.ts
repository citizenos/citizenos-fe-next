import { IconComponent } from '../icon/icon.component';
import { Component, OnInit, input, output, signal, computed, ChangeDetectionStrategy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'cos-calender',
  templateUrl: './cos-calender.component.html',
  styleUrls: ['./cos-calender.component.scss'],
  standalone: true,
  imports: [CommonModule, TranslateModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CosCalenderComponent implements OnInit {
  minDate = input<Date | undefined>();
  date = input<Date | undefined>();
  class = input<string>('');
  dateChange = output<Date>();

  yearOptions: number[] = [];
  monthOptions: number[] = [...Array(12).keys()].map(i => i + 1);
  weekdays: number[] = [...Array(7).keys()].map(i => i + 1);
  
  calendar = signal<number[][]>([]);
  year = signal<number>(new Date().getFullYear());
  month = signal<number>(new Date().getMonth());
  day = signal<number>(new Date().getDate());
  selectedDate = signal<Date>(new Date());

  constructor() {
    effect(() => {
      const d = this.date();
      if (d) {
        const parsedDate = new Date(d);
        this.selectedDate.set(parsedDate);
        this.day.set(parsedDate.getDate());
        this.month.set(parsedDate.getMonth());
        this.year.set(parsedDate.getFullYear());
        this.generateCalendar(parsedDate.getFullYear(), parsedDate.getMonth());
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    if (!this.date()) {
      this.generateCalendar(this.year(), this.month());
    }
  }

  isSelected(day: number) {
    const sel = this.selectedDate();
    return (this.month() === sel.getMonth() && this.year() === sel.getFullYear() && day === sel.getDate());
  }

  selectDate(day: number) {
    if (day < 0) return;
    
    const min = this.minDate();
    if (min && (
      min.getFullYear() > this.year() ||
      (min.getFullYear() === this.year() && min.getMonth() > this.month()) ||
      (min.getFullYear() === this.year() && min.getMonth() === this.month() && day < min.getDate())
    )) {
      return;
    }

    const newDate = new Date(this.selectedDate());
    newDate.setFullYear(this.year());
    newDate.setMonth(this.month());
    newDate.setDate(day);
    this.selectedDate.set(newDate);
    this.dateChange.emit(newDate);
  }

  getDay(day: number) {
    if (day < 0) {
      return day * -1;
    }
    return day;
  }

  generateCalendar(year: number, month: number): void {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const lastDayPrevMonth = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const calendarArray: number[][] = [];
    let currentDay = 1;
    
    // ISO standard expects Monday to be day 1 (getDay() returns 0 for Sunday, 1 for Monday etc.)
    // We adjust so firstDay.getDay() is correct: 0 (Sunday) to 7 (Sunday)
    let firstDayIndex = firstDay.getDay();
    if (firstDayIndex === 0) firstDayIndex = 7; // Align Sunday to end of week if using Monday start, or matching legacy getDay

    for (let week = 0; week < 6; week++) {
      const weekArray: number[] = [];
      for (let day = 1; day < 8; day++) {
        if (week === 0 && day < firstDayIndex) {
          weekArray.push(-(lastDayPrevMonth.getDate() - (firstDayIndex - day) + 1));
        } else if (currentDay <= daysInMonth) {
          weekArray.push(currentDay);
          currentDay++;
        } else {
          weekArray.push(-(currentDay - daysInMonth));
          currentDay++;
        }
      }
      calendarArray.push(weekArray);
    }
    this.calendar.set(calendarArray);
  }

  setMonth(value: number) {
    let nextMonth = this.month() + value;
    let nextYear = this.year();
    if (nextMonth === -1) {
      nextMonth = 11;
      nextYear--;
    } else if (nextMonth === 12) {
      nextMonth = 0;
      nextYear++;
    }
    this.month.set(nextMonth);
    this.year.set(nextYear);
    this.generateCalendar(nextYear, nextMonth);
  }
}
