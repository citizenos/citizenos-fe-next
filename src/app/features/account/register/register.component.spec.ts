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
    // Both name, email, password are required
    expect(component.registerForm().invalid()).toBeTruthy();
  });

  it('should validate email format', () => {
    component.registerModel.update(m => ({ ...m, email: 'invalid-email' }));
    fixture.detectChanges();
    TestBed.flushEffects();
    expect(component.registerForm.email().errors().some(e => e.kind === 'email')).toBeTruthy();

    component.registerModel.update(m => ({ ...m, email: 'test@example.com' }));
    fixture.detectChanges();
    TestBed.flushEffects();
    expect(component.registerForm.email().errors().some(e => e.kind === 'email')).toBeFalsy();
  });

  it('should validate password length', () => {
    component.registerModel.update(m => ({ ...m, password: 'short' }));
    fixture.detectChanges();
    TestBed.flushEffects();
    expect(component.registerForm.password().errors().some(e => e.kind === 'minLength')).toBeTruthy();

    component.registerModel.update(m => ({ ...m, password: 'longenoughpassword' }));
    fixture.detectChanges();
    TestBed.flushEffects();
    expect(component.registerForm.password().errors().some(e => e.kind === 'minLength')).toBeFalsy();
  });

  it('should validate password match', () => {
    component.registerModel.update(m => ({
      ...m,
      password: 'password123',
      passwordConfirm: 'password456'
    }));
    fixture.detectChanges();
    TestBed.flushEffects();
    expect(component.registerForm().errors().some(e => e.kind === 'passwordMismatch')).toBeTruthy();

    component.registerModel.update(m => ({
      ...m,
      password: 'password123',
      passwordConfirm: 'password123'
    }));
    fixture.detectChanges();
    TestBed.flushEffects();
    expect(component.registerForm().errors().some(e => e.kind === 'passwordMismatch')).toBeFalsy();
  });

  it('should call signup on UserStore when form is submitted', async () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.registerModel.set({
      name: 'Test User',
      email: 'test@example.com',
      company: '',
      password: 'password123',
      passwordConfirm: 'password123',
      agreeToTerms: true,
      showInSearch: true
    });
    fixture.detectChanges();
    TestBed.flushEffects();

    mockUserStore.signup.mockResolvedValue({});

    await component.save(component.registerModel());

    expect(mockUserStore.signup).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });

  it('should handle signup error', async () => {
    component.registerModel.set({
      name: 'Test User',
      email: 'test@example.com',
      company: '',
      password: 'password123',
      passwordConfirm: 'password123',
      agreeToTerms: true,
      showInSearch: true
    });
    fixture.detectChanges();
    TestBed.flushEffects();

    mockUserStore.signup.mockRejectedValue(new Error('Signup failed'));

    await component.save(component.registerModel());

    expect(component.error()).toBe('Registration failed. Please try again.');
  });

  it('should switch registration method', () => {
    expect(component.selectedMethod()).toBe('default');
    component.selectedMethod.set('smartid');
    fixture.detectChanges();
    expect(component.selectedMethod()).toBe('smartid');
  });
});
