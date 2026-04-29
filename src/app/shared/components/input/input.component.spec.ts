import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InputComponent } from './input.component';
import { Component, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IconComponent } from '../icon/icon.component';

@Component({
  standalone: true,
  imports: [InputComponent],
  template: `
    <cos-input [label]="label()" [errorMessage]="errorMessage()" [hasError]="hasError()">
      <input type="text">
    </cos-input>
  `
})
class TestHostComponent {
  label = signal('Full Name');
  errorMessage = signal('Error here');
  hasError = signal(true);
}

describe('InputComponent Accessibility', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, InputComponent, IconComponent, TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should associate label with input via for/id', () => {
    fixture.detectChanges();
    const label = fixture.nativeElement.querySelector('.input-label');
    const input = fixture.nativeElement.querySelector('input');
    
    expect(label).toBeTruthy();
    expect(input).toBeTruthy();
    expect(label.getAttribute('for')).toBe(input.id);
  });

  it('should associate error message with input via aria-describedby', () => {
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input');
    const error = fixture.nativeElement.querySelector('.error-message');
    
    expect(error).toBeTruthy();
    expect(input.getAttribute('aria-describedby')).toBe(error.id);
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });
});
