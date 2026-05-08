import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { UserStore } from '../../../core/state/user.store';
import { UserService } from '../../../core/services/user.service';
import { of, throwError } from 'rxjs';
import { signal, NO_ERRORS_SCHEMA } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { provideRouter } from '@angular/router';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockUserStore: any;
  let mockUserService: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockUserStore = {
      login: vi.fn(),
      isLoading: signal(false)
    };
    mockUserService = {
      getPartnerLoginUrl: vi.fn().mockReturnValue('http://partner-login.url')
    };
    mockRouter = {
      navigate: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: UserStore, useValue: mockUserStore },
        { provide: UserService, useValue: mockUserService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have an invalid form when empty', () => {
    expect(component.loginForm.valid).toBeFalsy();
  });

  it('should validate email format', () => {
    const email = component.loginForm.controls.email;
    email.setValue('invalid-email');
    expect(email.hasError('email')).toBeTruthy();

    email.setValue('test@example.com');
    expect(email.hasError('email')).toBeFalsy();
  });

  it('should toggle password visibility', () => {
    expect(component.showPassword()).toBeFalsy();
    component.togglePassword();
    expect(component.showPassword()).toBeTruthy();
  });

  it('should call login on UserStore when form is submitted', async () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.loginForm.setValue({
      email: 'test@example.com',
      password: 'password123'
    });

    mockUserStore.login.mockResolvedValue({});

    await component.onSubmit();

    expect(mockUserStore.login).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });

  it('should handle login error', async () => {
    component.loginForm.setValue({
      email: 'test@example.com',
      password: 'wrong-password'
    });

    mockUserStore.login.mockRejectedValue(new Error('Login failed'));

    await component.onSubmit();

    expect(component.error()).toBe('Login failed. Please check your credentials.');
  });

  it('should navigate to partner login URL', () => {
    // We can't easily test window.location.href changes in unit tests
    // but we can test that the service is called.
    const originalLocation = window.location;
    // @ts-expect-error - test override
    delete window.location;
    window.location = { ...originalLocation, href: '' } as any;

    component.doLoginPartner('google');

    expect(mockUserService.getPartnerLoginUrl).toHaveBeenCalledWith('google');
    expect(window.location.href).toBe('http://partner-login.url');

    window.location.href = originalLocation.href;
  });
});
