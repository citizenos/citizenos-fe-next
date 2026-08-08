import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { UserStore } from '../../../core/state/user.store';
import { UserService } from '../../../core/services/user.service';

import { signal, NO_ERRORS_SCHEMA } from '@angular/core';
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { provideRouter } from '@angular/router';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockUserStore: unknown;
  let mockUserService: { getPartnerLoginUrl: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockUserStore = {
      login: vi.fn(),
      isLoading: signal(false)
    };
    mockUserService = {
      getPartnerLoginUrl: vi.fn().mockReturnValue('http://partner-login.url')
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
    expect(component.loginForm().invalid()).toBeTruthy();
  });

  it('should validate email format', () => {
    component.loginModel.update(m => ({ ...m, email: 'invalid-email' }));
    fixture.detectChanges();
    TestBed.flushEffects();
    expect(component.loginForm.email().errors().some(e => e.kind === 'email')).toBeTruthy();

    component.loginModel.update(m => ({ ...m, email: 'test@example.com' }));
    fixture.detectChanges();
    TestBed.flushEffects();
    expect(component.loginForm.email().errors().some(e => e.kind === 'email')).toBeFalsy();
  });

  it('should toggle password visibility', () => {
    expect(component.showPassword()).toBeFalsy();
    component.togglePassword();
    expect(component.showPassword()).toBeTruthy();
  });

  it('should call login on UserStore when form is submitted', async () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.loginModel.set({
      email: 'test@example.com',
      password: 'password123'
    });
    fixture.detectChanges();
    TestBed.flushEffects();

    (mockUserStore as { login: Mock }).login.mockResolvedValue({});

    await component.save(component.loginModel());

    expect((mockUserStore as { login: Mock }).login).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });

  it('should handle login error', async () => {
    component.loginModel.set({
      email: 'test@example.com',
      password: 'wrong-password'
    });
    fixture.detectChanges();
    TestBed.flushEffects();

    (mockUserStore as { login: Mock }).login.mockRejectedValue(new Error('Login failed'));

    await component.save(component.loginModel());

    expect(component.error()).toBe('Login failed. Please check your credentials.');
  });

  it('should navigate to partner login URL', () => {
    // We can't easily test window.location.href changes in unit tests
    // but we can test that the service is called.
    const originalLocation = window.location;
    vi.stubGlobal('location', { ...originalLocation, href: '' });

    component.doLoginPartner('google');

    expect(mockUserService.getPartnerLoginUrl).toHaveBeenCalledWith('google', undefined);
    expect(window.location.href).toBe('http://partner-login.url');

    vi.unstubAllGlobals();
  });
});
