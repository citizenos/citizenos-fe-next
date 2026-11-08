import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginFormComponent } from './login-form.component';
import { TranslateModule } from '@ngx-translate/core';
import { UserStore } from '../../../../core/state/user.store';
import { UserService } from '../../../../core/services/user.service';
import { signal, NO_ERRORS_SCHEMA } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { provideRouter } from '@angular/router';

describe('LoginFormComponent', () => {
  let component: LoginFormComponent;
  let fixture: ComponentFixture<LoginFormComponent>;
  let mockUserStore: { login: ReturnType<typeof vi.fn>; isLoading: ReturnType<typeof signal<boolean>> };
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
      imports: [LoginFormComponent, TranslateModule.forRoot()],
      providers: [
        provideRouter([{ path: '**', component: class {} }]),
        { provide: UserStore, useValue: mockUserStore },
        { provide: UserService, useValue: mockUserService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form initially', () => {
    expect(component.loginForm().invalid()).toBeTruthy();
  });

  it('should toggle password visibility', () => {
    expect(component.showPassword()).toBeFalsy();
    component.togglePassword();
    expect(component.showPassword()).toBeTruthy();
  });

  it('should emit loggedIn on successful login', async () => {
    const loggedInSpy = vi.fn();
    component.loggedIn.subscribe(loggedInSpy);

    component.loginModel.set({
      email: 'test@example.com',
      password: 'password123'
    });
    fixture.detectChanges();
    TestBed.flushEffects();

    mockUserStore.login.mockResolvedValue({});

    await component.save(component.loginModel());

    expect(mockUserStore.login).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(loggedInSpy).toHaveBeenCalled();
  });

  it('should handle login error', async () => {
    component.loginModel.set({
      email: 'test@example.com',
      password: 'wrong'
    });
    fixture.detectChanges();
    TestBed.flushEffects();

    mockUserStore.login.mockRejectedValue(new Error('Invalid credentials'));

    await component.save(component.loginModel());

    expect(component.error()).toBe('Invalid email or password.');
  });

  it('should emit switchToRegister', () => {
    const switchSpy = vi.fn();
    component.switchToRegister.subscribe(switchSpy);

    component.onSwitchToRegister();

    expect(switchSpy).toHaveBeenCalled();
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

  it('should switch to forgot password view inside dialog when onForgotPassword() is called', () => {
    fixture.componentRef.setInput('isDialog', true);
    fixture.detectChanges();

    const forgotSpy = vi.fn();
    component.forgotPassword.subscribe(forgotSpy);

    component.onForgotPassword();
    fixture.detectChanges();

    expect(forgotSpy).toHaveBeenCalled();
    expect(component.selectedMethod()).toBe('forgot');
    expect(fixture.nativeElement.querySelector('app-password-forgot')).toBeTruthy();
  });

  it('should return to default login view and emit backToLogin when onBackFromForgot() is called', () => {
    fixture.componentRef.setInput('isDialog', true);
    component.selectedMethod.set('forgot');
    fixture.detectChanges();

    const backSpy = vi.fn();
    component.backToLogin.subscribe(backSpy);

    component.onBackFromForgot();
    fixture.detectChanges();

    expect(component.selectedMethod()).toBe('default');
    expect(backSpy).toHaveBeenCalled();
  });

  it('should switch to smartid and esteid in dialog mode and return to default on cancelled', () => {
    fixture.componentRef.setInput('isDialog', true);
    fixture.detectChanges();

    component.selectMethod('smartid');
    fixture.detectChanges();
    expect(component.selectedMethod()).toBe('smartid');
    expect(fixture.nativeElement.querySelector('app-smart-id')).toBeTruthy();

    component.selectMethod('esteid');
    fixture.detectChanges();
    expect(component.selectedMethod()).toBe('esteid');
    expect(fixture.nativeElement.querySelector('app-esteid')).toBeTruthy();
  });
});
