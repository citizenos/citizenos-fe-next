import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { DeadlinePickerComponent } from './deadline-picker.component';
import { TranslateModule } from '@ngx-translate/core';

describe('DeadlinePickerComponent', () => {
  let component: DeadlinePickerComponent;
  let fixture: ComponentFixture<DeadlinePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeadlinePickerComponent, TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DeadlinePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start disabled', () => {
    expect(component.enabled()).toBe(false);
  });

  it('should toggle enabled state', () => {
    component.toggleDeadline();
    expect(component.enabled()).toBe(true);

    component.toggleDeadline();
    expect(component.enabled()).toBe(false);
  });

  it('should emit null when disabled', () => {
    const emitSpy = vi.spyOn(component.deadlineChange, 'emit');
    component.toggleDeadline(); // enable
    component.toggleDeadline(); // disable
    expect(emitSpy).toHaveBeenCalledWith(null);
  });

  it('should emit deadline when enabled', () => {
    const emitSpy = vi.spyOn(component.deadlineChange, 'emit');
    component.toggleDeadline();
    expect(emitSpy).toHaveBeenCalled();
    const emitted = emitSpy.mock.calls[emitSpy.mock.calls.length - 1][0];
    expect(emitted).toBeInstanceOf(Date);
  });

  it('should format time correctly', () => {
    expect(component.formatTime(5)).toBe('05');
    expect(component.formatTime(12)).toBe('12');
    expect(component.formatTime(0)).toBe('00');
  });

  it('should initialize from deadline input', () => {
    const future = new Date(Date.now() + 86400000 * 3);
    fixture.componentRef.setInput('deadline', future);
    TestBed.flushEffects();

    expect(component.enabled()).toBe(true);
    expect(component.hours()).toBe(future.getHours());
    expect(component.minutes()).toBe(future.getMinutes());
  });

  it('should not show reminder section when showReminder is false', () => {
    component.toggleDeadline();
    fixture.detectChanges();
    const reminderSection = fixture.nativeElement.querySelector('.reminder-section');
    expect(reminderSection).toBeNull();
  });

  it('should toggle reminder', () => {
    component.toggleReminder();
    expect(component.reminderEnabled()).toBe(true);
    component.toggleReminder();
    expect(component.reminderEnabled()).toBe(false);
  });
});
