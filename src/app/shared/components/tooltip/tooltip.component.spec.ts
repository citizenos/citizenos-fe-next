import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentRef, Component, Input } from '@angular/core';
import { TooltipComponent } from './tooltip.component';

@Component({ selector: 'cos-icon', standalone: true, template: '' })
class MockIconComponent { @Input() name = ''; @Input() size = 24; }

describe('TooltipComponent', () => {
  let component: TooltipComponent;
  let fixture: ComponentFixture<TooltipComponent>;
  let componentRef: ComponentRef<TooltipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TooltipComponent],
    })
      .overrideComponent(TooltipComponent, { set: { imports: [MockIconComponent] } })
      .compileComponents();

    fixture = TestBed.createComponent(TooltipComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be hidden by default', () => {
    expect(component.visible()).toBe(false);
    expect(fixture.nativeElement.querySelector('.tooltip_container').classList.contains('visible')).toBe(false);
  });

  it('should show on mouseenter and hide on mouseleave', () => {
    const wrapper: HTMLElement = fixture.nativeElement.querySelector('.tooltip_wrapper');
    wrapper.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    expect(component.visible()).toBe(true);
    expect(fixture.nativeElement.querySelector('.tooltip_container').classList.contains('visible')).toBe(true);

    wrapper.dispatchEvent(new MouseEvent('mouseleave'));
    fixture.detectChanges();
    expect(component.visible()).toBe(false);
  });

  it('should show info icon by default', () => {
    expect(fixture.nativeElement.querySelector('.tooltip_icon')).toBeTruthy();
  });

  it('should hide info icon when noIcon is true', () => {
    componentRef.setInput('noIcon', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.tooltip_icon')).toBeNull();
  });

  it('should render title when provided', () => {
    componentRef.setInput('title', 'Helpful hint');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.content_title')?.textContent?.trim()).toBe('Helpful hint');
  });

  it('should not render title element when title is empty', () => {
    expect(fixture.nativeElement.querySelector('.content_title')).toBeNull();
  });

  it('should render description when provided', () => {
    componentRef.setInput('description', 'Some description');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.content_description')?.innerHTML).toContain('Some description');
  });

  it('should not render description element when description is empty', () => {
    expect(fixture.nativeElement.querySelector('.content_description')).toBeNull();
  });

  it('should show arrow_up when pos is bottom (default)', () => {
    expect(fixture.nativeElement.querySelector('.arrow_up')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.arrow_down')).toBeNull();
  });

  it('should show arrow_down when pos is top', () => {
    componentRef.setInput('pos', 'top');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.arrow_down')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.arrow_up')).toBeNull();
  });

  it('should apply pos class to tooltip container', () => {
    componentRef.setInput('pos', 'top');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.tooltip_container').classList.contains('top')).toBe(true);
  });
});
