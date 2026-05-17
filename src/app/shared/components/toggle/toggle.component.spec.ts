import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToggleComponent } from './toggle.component';

describe('ToggleComponent', () => {
  let component: ToggleComponent;
  let fixture: ComponentFixture<ToggleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToggleComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default to off (modelValue = false)', () => {
    expect(component.isEnabled()).toBe(false);
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.toggle_widget.off')).toBeTruthy();
  });

  it('should show on class when boolean model is true', async () => {
    fixture.componentRef.setInput('model', true);
    fixture.detectChanges();
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.toggle_widget.on')).toBeTruthy();
  });

  it('should support string value and offValue', async () => {
    fixture.componentRef.setInput('value', 'public');
    fixture.componentRef.setInput('offValue', 'private');
    fixture.componentRef.setInput('model', 'public');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.isEnabled()).toBe(true);

    component.toggle();
    fixture.detectChanges();

    expect(component.modelValue()).toBe('private');
    expect(component.isEnabled()).toBe(false);
  });

  it('should display cosToggleTextOn when enabled', async () => {
    fixture.componentRef.setInput('model', true);
    fixture.componentRef.setInput('cosToggleTextOn', 'Enabled');
    fixture.detectChanges();
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.toggle_text')?.textContent?.trim()).toBe('Enabled');
  });

  it('should emit toggleClick with inverted value on toggle()', () => {
    const spy = vi.fn();
    component.toggleClick.subscribe(spy);
    component.toggle();
    expect(spy).toHaveBeenCalledWith(true);
  });

  it('should toggle on button click', () => {
    const spy = vi.fn();
    component.toggleClick.subscribe(spy);
    const el: HTMLElement = fixture.nativeElement;
    const button = el.querySelector<HTMLButtonElement>('button.toggle_wrap');
    button?.click();
    expect(spy).toHaveBeenCalled();
  });
});
