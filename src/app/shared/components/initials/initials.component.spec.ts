import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { InitialsComponent } from './initials.component';

describe('InitialsComponent', () => {
  let fixture: ComponentFixture<InitialsComponent>;
  let component: InitialsComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [InitialsComponent] }).compileComponents();
    fixture = TestBed.createComponent(InitialsComponent);
    component = fixture.componentInstance;
  });

  it('should show first + last initial for two-word name', () => {
    component.name.set('John Doe');
    fixture.detectChanges();
    expect(component.initials()).toBe('JD');
  });

  it('should show first initial for single-word name', () => {
    component.name.set('Alice');
    fixture.detectChanges();
    expect(component.initials()).toBe('A');
  });

  it('should use first + last word for multi-word name', () => {
    component.name.set('Mary Jane Watson');
    fixture.detectChanges();
    expect(component.initials()).toBe('MW');
  });

  it('should show ? for empty name', () => {
    component.name.set('');
    fixture.detectChanges();
    expect(component.initials()).toBe('?');
  });

  it('should respect limit=1', () => {
    component.name.set('John Doe');
    component.limit.set(1);
    fixture.detectChanges();
    expect(component.initials()).toBe('J');
  });

  it('should render initials in the DOM', () => {
    component.name.set('Jane Smith');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent.trim()).toBe('JS');
  });
});
