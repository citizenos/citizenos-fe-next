import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterFormComponent } from './register-form.component';
import { TranslateModule } from '@ngx-translate/core';
import { UserStore } from '../../../../core/state/user.store';
import { UserService } from '../../../../core/services/user.service';
import { signal, NO_ERRORS_SCHEMA } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { provideRouter } from '@angular/router';

describe('RegisterFormComponent', () => {
  let component: RegisterFormComponent;
  let fixture: ComponentFixture<RegisterFormComponent>;
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
      imports: [RegisterFormComponent, TranslateModule.forRoot()],
      providers: [
        provideRouter([{ path: '**', component: class {} }]),
        { provide: UserStore, useValue: mockUserStore },
        { provide: UserService, useValue: mockUserService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form initially', () => {
    expect(component.registerForm().invalid()).toBeTruthy();
  });

  it('should toggle password visibility', () => {
    expect(component.showPassword()).toBeFalsy();
    component.togglePassword();
    expect(component.showPassword()).toBeTruthy();

    expect(component.showPasswordConfirm()).toBeFalsy();
    component.togglePasswordConfirm();
    expect(component.showPasswordConfirm()).toBeTruthy();
  });

  it('should emit registered on successful signup', async () => {
    const registeredSpy = vi.fn();
    component.registered.subscribe(registeredSpy);

    component.registerModel.set({
      name: 'John Doe',
      email: 'john@example.com',
      company: 'ACME',
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
    expect(registeredSpy).toHaveBeenCalled();
  });

  it('should handle signup error', async () => {
    component.registerModel.set({
      name: 'John Doe',
      email: 'john@example.com',
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

    expect(component.error()).toBe('Registration failed. Please verify your details and try again.');
  });

  it('should emit switchToLogin', () => {
    const switchSpy = vi.fn();
    component.switchToLogin.subscribe(switchSpy);

    component.onSwitchToLogin();

    expect(switchSpy).toHaveBeenCalled();
  });

  it('should switch registration method', () => {
    expect(component.selectedMethod()).toBe('default');
    component.selectedMethod.set('smartid');
    fixture.detectChanges();
    expect(component.selectedMethod()).toBe('smartid');
  });

  it('should navigate to partner login url with redirectSuccess from input if provided', () => {
    const originalLocation = window.location;
    vi.stubGlobal('location', { ...originalLocation, href: '' });

    fixture.componentRef.setInput('redirectSuccess', '/en/topics/vote/create');
    fixture.detectChanges();

    component.doLoginPartner('google');

    expect(mockUserService.getPartnerLoginUrl).toHaveBeenCalledWith('google', '/en/topics/vote/create');
    expect(window.location.href).toBe('http://partner-login.url');

    vi.unstubAllGlobals();
  });

  it('should navigate to partner login url with fallback to window.location.href when redirectSuccess is not provided', () => {
    const originalLocation = window.location;
    vi.stubGlobal('location', {
      ...originalLocation,
      href: 'http://localhost/en/topics/my-topic',
      pathname: '/en/topics/my-topic'
    });

    component.doLoginPartner('facebook');

    expect(mockUserService.getPartnerLoginUrl).toHaveBeenCalledWith('facebook', 'http://localhost/en/topics/my-topic');
    expect(window.location.href).toBe('http://partner-login.url');

    vi.unstubAllGlobals();
  });
});
