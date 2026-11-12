import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { provideRouter } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NavComponent } from './nav.component';
import { UserStore } from '../../../state/user.store';
import { DialogService } from '../../../../shared/dialog';
import { Router } from '@angular/router';

@Component({ template: '', standalone: true })
class EmptyComponent {}

describe('NavComponent', () => {
  let fixture: ComponentFixture<NavComponent>;
  let component: NavComponent;
  let userStoreMock: unknown;
  let dialogServiceMock: unknown;

  beforeEach(async () => {
    userStoreMock = {
      isAuthenticated: vi.fn().mockReturnValue(false),
      user: vi.fn().mockReturnValue(null),
      logout: vi.fn().mockResolvedValue(undefined)
    };
    dialogServiceMock = {
      open: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [NavComponent, TranslateModule.forRoot()],
      providers: [
        provideRouter([{ path: '**', component: EmptyComponent }]),
        { provide: UserStore, useValue: userStoreMock },
        { provide: DialogService, useValue: dialogServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NavComponent);
    component = fixture.componentInstance;
    const translateService = TestBed.inject(TranslateService);
    translateService.use('en');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle navigation', () => {
    expect(component.showNav()).toBe(false);
    component.toggleNav();
    expect(component.showNav()).toBe(true);
    component.toggleNav();
    expect(component.showNav()).toBe(false);
  });

  it('should toggle create menu', () => {
    expect(component.showCreateMenu()).toBe(false);
    component.toggleCreateMenu();
    expect(component.showCreateMenu()).toBe(true);
  });

  it('closeCreateMenu() should set showCreateMenu to false', () => {
    component.showCreateMenu.set(true);
    component.closeCreateMenu();
    expect(component.showCreateMenu()).toBe(false);
  });

  it('closeNav() should reset showNav and showCreateMenu to false', () => {
    component.showNav.set(true);
    component.showCreateMenu.set(true);
    component.closeNav();
    expect(component.showNav()).toBe(false);
    expect(component.showCreateMenu()).toBe(false);
  });

  it('toggleNav() should close showCreateMenu when toggling nav off', () => {
    component.showNav.set(true);
    component.showCreateMenu.set(true);
    component.toggleNav();
    expect(component.showNav()).toBe(false);
    expect(component.showCreateMenu()).toBe(false);
  });

  it('logout() should call userStore.logout and close nav', async () => {
    component.showNav.set(true);
    await component.logout();
    expect((userStoreMock as { logout: () => void }).logout).toHaveBeenCalled();
    expect(component.showNav()).toBe(false);
  });

  it('doShowLogin() should close nav and navigate to account login view', () => {
    const router = TestBed.inject(Router);
    const navSpy = vi.spyOn(router, 'navigate');
    component.showNav.set(true);
    component.doShowLogin();
    expect(component.showNav()).toBe(false);
    expect(navSpy).toHaveBeenCalledWith(['/', 'en', 'account', 'login'], { queryParams: { redirectSuccess: '/' } });
  });

  it('doShowRegister() should close nav and navigate to account signup view', () => {
    const router = TestBed.inject(Router);
    const navSpy = vi.spyOn(router, 'navigate');
    component.showNav.set(true);
    component.doShowRegister();
    expect(component.showNav()).toBe(false);
    expect(navSpy).toHaveBeenCalledWith(['/', 'en', 'account', 'signup'], { queryParams: { redirectSuccess: '/' } });
  });

  it('should toggle profile dropdown', () => {
    expect(component.showProfileDropdown()).toBe(false);
    component.toggleProfileDropdown();
    expect(component.showProfileDropdown()).toBe(true);
    component.toggleProfileDropdown();
    expect(component.showProfileDropdown()).toBe(false);
  });

  it('closeNav() should also reset showProfileDropdown to false', () => {
    component.showProfileDropdown.set(true);
    component.closeNav();
    expect(component.showProfileDropdown()).toBe(false);
  });

  it('Escape key should close nav, create menu, and profile dropdown', () => {
    component.showNav.set(true);
    component.showCreateMenu.set(true);
    component.showProfileDropdown.set(true);
    component.onEscape();
    expect(component.showNav()).toBe(false);
    expect(component.showCreateMenu()).toBe(false);
    expect(component.showProfileDropdown()).toBe(false);
  });

  it('should provide accessible aria-label on logo links and include currentLanguageLabel in language button aria-label', () => {
    const el = fixture.nativeElement as HTMLElement;
    const logoLinks = el.querySelectorAll('.logo_wrap a');
    expect(logoLinks.length).toBe(2);
    logoLinks.forEach((link) => {
      expect(link.getAttribute('aria-label')).toBe('Citizen OS');
    });

    const langBtn = Array.from(el.querySelectorAll('button.nav_item')).find((btn) =>
      btn.textContent?.includes(component.currentLanguageLabel)
    );
    expect(langBtn).toBeTruthy();
    expect(langBtn?.getAttribute('aria-label')).toContain(component.currentLanguageLabel);
  });
});
