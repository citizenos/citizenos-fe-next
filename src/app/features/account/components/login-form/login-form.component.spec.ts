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

  it('should navigate to partner login url', () => {
    const originalLocation = window.location;
    vi.stubGlobal('location', { ...originalLocation, href: '' });

    component.doLoginPartner('google');

    expect(mockUserService.getPartnerLoginUrl).toHaveBeenCalledWith('google', undefined);
    expect(window.location.href).toBe('http://partner-login.url');

    vi.unstubAllGlobals();
  });
});
