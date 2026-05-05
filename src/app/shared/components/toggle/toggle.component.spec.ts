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

  it('should default to off (model = false)', () => {
    expect(component.model()).toBe(false);
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.toggle-container.on')).toBeFalsy();
  });

  it('should show on class when model is true', async () => {
    fixture.componentRef.setInput('model', true);
    fixture.detectChanges();
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.toggle-container.on')).toBeTruthy();
  });

  it('should display textOn when model is true', async () => {
    fixture.componentRef.setInput('model', true);
    fixture.componentRef.setInput('textOn', 'Yes');
    fixture.detectChanges();
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.toggle-text')?.textContent?.trim()).toBe('Yes');
  });

  it('should display textOff when model is false', async () => {
    fixture.componentRef.setInput('model', false);
    fixture.componentRef.setInput('textOff', 'No');
    fixture.detectChanges();
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.toggle-text')?.textContent?.trim()).toBe('No');
  });

  it('should emit toggleClick with inverted value on toggle()', () => {
    const spy = vi.fn();
    component.toggleClick.subscribe(spy);
    component.toggle();
    expect(spy).toHaveBeenCalledWith(true);
  });

  it('should emit false when toggled from true', async () => {
    fixture.componentRef.setInput('model', true);
    fixture.detectChanges();
    const spy = vi.fn();
    component.toggleClick.subscribe(spy);
    component.toggle();
    expect(spy).toHaveBeenCalledWith(false);
  });

  it('should toggle on container click', () => {
    const spy = vi.fn();
    component.toggleClick.subscribe(spy);
    const el: HTMLElement = fixture.nativeElement;
    const container = el.querySelector<HTMLElement>('.toggle-container');
    container?.click();
    expect(spy).toHaveBeenCalled();
  });
});
