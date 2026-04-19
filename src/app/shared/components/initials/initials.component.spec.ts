import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentRef } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';
import { InitialsComponent } from './initials.component';

describe('InitialsComponent', () => {
  let fixture: ComponentFixture<InitialsComponent>;
  let component: InitialsComponent;
  let ref: ComponentRef<InitialsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [InitialsComponent] }).compileComponents();
    fixture = TestBed.createComponent(InitialsComponent);
    ref = fixture.componentRef;
    component = fixture.componentInstance;
  });

  it('should show first + last initial for two-word name', () => {
    ref.setInput('name', 'John Doe');
    fixture.detectChanges();
    expect(component.initials()).toBe('JD');
  });

  it('should show first initial for single-word name', () => {
    ref.setInput('name', 'Alice');
    fixture.detectChanges();
    expect(component.initials()).toBe('A');
  });

  it('should use first + last word for multi-word name', () => {
    ref.setInput('name', 'Mary Jane Watson');
    fixture.detectChanges();
    expect(component.initials()).toBe('MW');
  });

  it('should show ? for empty name', () => {
    ref.setInput('name', '');
    fixture.detectChanges();
    expect(component.initials()).toBe('?');
  });

  it('should respect limit=1', () => {
    ref.setInput('name', 'John Doe');
    ref.setInput('limit', 1);
    fixture.detectChanges();
    expect(component.initials()).toBe('J');
  });

  it('should render initials in the DOM', () => {
    ref.setInput('name', 'Jane Smith');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent.trim()).toBe('JS');
  });
});
