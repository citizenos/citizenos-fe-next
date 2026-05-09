import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InputComponent } from './input.component';
import { TranslateModule } from '@ngx-translate/core';
import { IconComponent } from '../icon/icon.component';
import { Component, Input } from '@angular/core';

@Component({ selector: 'cos-icon', standalone: true, template: '' })
class MockIconComponent { @Input() name = ''; @Input() size = 24; }

describe('InputComponent Accessibility', () => {
  let component: InputComponent;
  let fixture: ComponentFixture<InputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputComponent, MockIconComponent, TranslateModule.forRoot()]
    })
    .overrideComponent(InputComponent, {
      remove: { imports: [IconComponent] },
      add: { imports: [MockIconComponent] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputComponent);
    component = fixture.componentInstance;
    
    // Set some defaults
    component.label.set('Full Name');
    component.errorMessage.set('Error here');
    component.hasError.set(true);
    
    fixture.detectChanges();
  });

  it('should associate label with input via for/id', () => {
    const label = fixture.nativeElement.querySelector('.input-label');
    expect(label).toBeTruthy();
    // We need to project an input for it to find one
    fixture.nativeElement.querySelector('.input-wrapper').innerHTML += '<input id="test-id">';
    fixture.detectChanges();
    expect(label.getAttribute('for')).toBe(component.inputId);
  });

  it('should associate error message with input via aria-describedby', () => {
    const error = fixture.nativeElement.querySelector('.error-message');
    expect(error).toBeTruthy();
    expect(error.id).toBe(component.errorId);
  });

  it('should render label text when label is set', () => {
    expect(fixture.nativeElement.querySelector('.input-label').textContent.trim()).toBe('Full Name');
  });

  it('should show error message text when hasError and errorMessage are set', () => {
    expect(fixture.nativeElement.querySelector('.error-message')?.textContent).toContain('Error here');
  });

  it('should apply has-error class to container when hasError is true', () => {
    expect(fixture.nativeElement.querySelector('.input-container').classList).toContain('has-error');
  });

  it('should not show error message when hasError is false', () => {
    component.hasError.set(false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.error-message')).toBeNull();
  });

  it('should not render label element when label is empty', () => {
    component.label.set('');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.input-label')).toBeNull();
  });
});
