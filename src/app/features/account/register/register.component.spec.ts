import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { UserStore } from '../../../core/state/user.store';
import { UserService } from '../../../core/services/user.service';
import { signal, NO_ERRORS_SCHEMA } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { provideRouter } from '@angular/router';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let mockUserStore: { signup: ReturnType<typeof vi.fn>; isLoading: ReturnType<typeof signal<boolean>> };
  let mockUserService: { getPartnerLoginUrl: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockUserStore = {
      signup: vi.fn(),
      isLoading: signal(false)
    };
    mockUserService = {
      getPartnerLoginUrl: vi.fn().mockReturnValue('http://partner-login.url')
    };

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, ReactiveFormsModule, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: UserStore, useValue: mockUserStore },
        { provide: UserService, useValue: mockUserService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have an invalid form when empty', () => {
    expect(component.registerForm.valid).toBeFalsy();
  });

  it('should validate email format', () => {
    const email = component.registerForm.controls.email;
    email.setValue('invalid-email');
    expect(email.hasError('email')).toBeTruthy();

    email.setValue('test@example.com');
    expect(email.hasError('email')).toBeFalsy();
  });

  it('should validate password length', () => {
    const password = component.registerForm.controls.password;
    password.setValue('short');
    expect(password.hasError('minlength')).toBeTruthy();

    password.setValue('longenoughpassword');
    expect(password.hasError('minlength')).toBeFalsy();
  });

  it('should validate password match', () => {
    component.registerForm.patchValue({
      password: 'password123',
      passwordConfirm: 'password456'
    });
    expect(component.registerForm.hasError('passwordMismatch')).toBeTruthy();

    component.registerForm.patchValue({
      password: 'password123',
      passwordConfirm: 'password123'
    });
    expect(component.registerForm.hasError('passwordMismatch')).toBeFalsy();
  });

  it('should require terms agreement', () => {
    const agree = component.registerForm.controls.agreeToTerms;
    agree.setValue(false);
    expect(agree.hasError('required')).toBeTruthy();

    agree.setValue(true);
    expect(agree.hasError('required')).toBeFalsy();
  });

  it('should call signup on UserStore when form is submitted', async () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.registerForm.patchValue({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      passwordConfirm: 'password123',
      agreeToTerms: true
    });

    mockUserStore.signup.mockResolvedValue({});

    await component.onSubmit();

    expect(mockUserStore.signup).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });

  it('should handle signup error', async () => {
    component.registerForm.patchValue({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      passwordConfirm: 'password123',
      agreeToTerms: true
    });

    mockUserStore.signup.mockRejectedValue(new Error('Signup failed'));

    await component.onSubmit();

    expect(component.error()).toBe('Registration failed. Please try again.');
  });

  it('should switch registration method', () => {
    expect(component.selectedMethod()).toBe('default');
    component.selectedMethod.set('smartid');
    fixture.detectChanges();
    expect(component.selectedMethod()).toBe('smartid');
  });
});
