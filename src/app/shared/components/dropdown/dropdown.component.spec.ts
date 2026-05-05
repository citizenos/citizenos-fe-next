import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DropdownComponent } from './dropdown.component';
import { Component, Input } from '@angular/core';

@Component({ selector: 'cos-icon', standalone: true, template: '' })
class MockIconComponent { @Input() name = ''; }

describe('DropdownComponent', () => {
  let component: DropdownComponent;
  let fixture: ComponentFixture<DropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropdownComponent]
    })
    .overrideComponent(DropdownComponent, {
      set: { imports: [MockIconComponent] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(DropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start closed', () => {
    expect(component.isOpen()).toBe(false);
  });

  it('should open on toggle()', () => {
    component.toggle();
    expect(component.isOpen()).toBe(true);
  });

  it('should close on second toggle()', () => {
    component.toggle();
    component.toggle();
    expect(component.isOpen()).toBe(false);
  });

  it('should show options div when open', async () => {
    component.toggle();
    fixture.detectChanges();
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.dropdown-options')).toBeTruthy();
  });

  it('should not show options div when closed', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.dropdown-options')).toBeFalsy();
  });

  it('should render placeholder when provided', async () => {
    fixture.componentRef.setInput('placeholder', 'Choose one');
    fixture.detectChanges();
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.dropdown-label')?.textContent?.trim()).toBe('Choose one');
  });

  it('should close on escape keydown', () => {
    component.isOpen.set(true);
    component.onEscape();
    expect(component.isOpen()).toBe(false);
  });

  it('should close on outside click', () => {
    component.isOpen.set(true);
    const event = new MouseEvent('click');
    Object.defineProperty(event, 'target', { value: document.body });
    component.onDocumentClick(event);
    expect(component.isOpen()).toBe(false);
  });
});
