import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PasswordForgotComponent } from './password-forgot.component';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { UserStore } from '../../../core/state/user.store';
import { signal, NO_ERRORS_SCHEMA } from '@angular/core';
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { provideRouter } from '@angular/router';

describe('PasswordForgotComponent', () => {
  let component: PasswordForgotComponent;
  let fixture: ComponentFixture<PasswordForgotComponent>;
  let mockUserStore: unknown;

  beforeEach(async () => {
    mockUserStore = {
      sendPasswordReset: vi.fn(),
      isLoading: signal(false)
    };

    await TestBed.configureTestingModule({
      imports: [PasswordForgotComponent, ReactiveFormsModule, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: UserStore, useValue: mockUserStore }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(PasswordForgotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have an invalid form when empty', () => {
    expect(component.forgotForm.valid).toBeFalsy();
  });

  it('should validate email format', () => {
    const email = component.forgotForm.controls.email;
    email.setValue('invalid-email');
    expect(email.hasError('email')).toBeTruthy();
    
    email.setValue('test@example.com');
    expect(email.hasError('email')).toBeFalsy();
  });

  it('should call sendPasswordReset on UserStore when form is submitted', async () => {
    component.forgotForm.setValue({ email: 'test@example.com' });
    (mockUserStore as { sendPasswordReset: Mock }).sendPasswordReset.mockResolvedValue({});
    
    await component.onSubmit();
    
    expect((mockUserStore as { sendPasswordReset: Mock }).sendPasswordReset).toHaveBeenCalledWith('test@example.com');
    expect(component.success()).toBeTruthy();
  });

  it('should handle sendPasswordReset error', async () => {
    component.forgotForm.setValue({ email: 'test@example.com' });
    (mockUserStore as { sendPasswordReset: Mock }).sendPasswordReset.mockRejectedValue({ error: { status: { message: 'User not found' } } });
    
    await component.onSubmit();
    
    expect(component.error()).toBe('User not found');
    expect(component.success()).toBeFalsy();
  });

  it('should hide main heading in dialog mode and emit back on onBack()', () => {
    expect(fixture.nativeElement.querySelector('.main_heading')).toBeTruthy();

    fixture.componentRef.setInput('isDialog', true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.main_heading')).toBeNull();
    expect(fixture.nativeElement.querySelector('#password_forgot_wrap.dialog-mode')).toBeTruthy();

    const backSpy = vi.fn();
    component.back.subscribe(backSpy);
    component.success.set(true);
    component.error.set('Some error');

    component.onBack();

    expect(component.success()).toBe(false);
    expect(component.error()).toBeNull();
    expect(backSpy).toHaveBeenCalled();
  });
});
