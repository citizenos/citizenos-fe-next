import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PasswordResetComponent } from './password-reset.component';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { UserStore } from '../../../core/state/user.store';
import { ActivatedRoute } from '@angular/router';
import { signal, NO_ERRORS_SCHEMA } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { provideRouter } from '@angular/router';

describe('PasswordResetComponent', () => {
  let component: PasswordResetComponent;
  let fixture: ComponentFixture<PasswordResetComponent>;
  let mockUserStore: unknown;
  let mockActivatedRoute: unknown;

  beforeEach(async () => {
    mockUserStore = {
      resetPassword: vi.fn(),
      isLoading: signal(false)
    };
    mockActivatedRoute = {
      snapshot: {
        params: { passwordResetCode: 'test-code' }
      }
    };

    await TestBed.configureTestingModule({
      imports: [PasswordResetComponent, ReactiveFormsModule, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: UserStore, useValue: mockUserStore },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(PasswordResetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should extract reset code from route', () => {
    expect(component.resetCode).toBe('test-code');
  });

  it('should validate password length', () => {
    const password = component.resetForm.controls.password;
    password.setValue('short');
    expect(password.hasError('minlength')).toBeTruthy();
    
    password.setValue('longenoughpassword');
    expect(password.hasError('minlength')).toBeFalsy();
  });

  it('should validate password match', () => {
    component.resetForm.patchValue({
      password: 'password123',
      passwordConfirm: 'password456'
    });
    expect(component.resetForm.hasError('passwordMismatch')).toBeTruthy();
    
    component.resetForm.patchValue({
      password: 'password123',
      passwordConfirm: 'password123'
    });
    expect(component.resetForm.hasError('passwordMismatch')).toBeFalsy();
  });

  it('should call resetPassword on UserStore when form is submitted', async () => {
    component.resetForm.patchValue({
      password: 'newpassword123',
      passwordConfirm: 'newpassword123'
    });
    (mockUserStore as { resetPassword: vi.Mock }).resetPassword.mockResolvedValue({});
    
    await component.onSubmit();
    
    expect((mockUserStore as { resetPassword: vi.Mock }).resetPassword).toHaveBeenCalledWith('newpassword123', 'test-code');
    expect(component.success()).toBeTruthy();
  });

  it('should handle resetPassword error', async () => {
    component.resetForm.patchValue({
      password: 'newpassword123',
      passwordConfirm: 'newpassword123'
    });
    (mockUserStore as { resetPassword: vi.Mock }).resetPassword.mockRejectedValue(new Error('Reset failed'));
    
    await component.onSubmit();
    
    expect(component.error()).toBe('Failed to reset password. The link may have expired.');
    expect(component.success()).toBeFalsy();
  });

  it('should show error if reset code is missing', () => {
    (mockActivatedRoute as { snapshot: { params: { passwordResetCode: string } } }).snapshot.params.passwordResetCode = '';
    fixture = TestBed.createComponent(PasswordResetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    
    expect(component.error()).toBe('Invalid or missing reset code.');
  });
});
