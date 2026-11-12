import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { PageUnauthorizedComponent } from './page-unauthorized.component';
import { provideRouter, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Component, signal, WritableSignal } from '@angular/core';
import { UserStore } from '../../state/user.store';

@Component({ template: '', standalone: true })
class EmptyComponent {}

describe('PageUnauthorizedComponent', () => {
  let fixture: ComponentFixture<PageUnauthorizedComponent>;
  let component: PageUnauthorizedComponent;
  let router: Router;
  let isAuthSignal: WritableSignal<boolean>;

  beforeEach(async () => {
    isAuthSignal = signal(false);
    const userStoreMock = {
      isAuthenticated: isAuthSignal
    };

    await TestBed.configureTestingModule({
      imports: [PageUnauthorizedComponent, TranslateModule.forRoot()],
      providers: [
        provideRouter([{ path: '**', component: EmptyComponent }]),
        { provide: UserStore, useValue: userStoreMock }
      ]
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.use('en');

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(PageUnauthorizedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders without error', () => {
    expect(component).toBeTruthy();
  });

  it('renders the unauthorized container, card, badge, and illustration', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.unauthorized_page_wrap')).toBeTruthy();
    expect(el.querySelector('.unauthorized_card')).toBeTruthy();
    expect(el.querySelector('.illustration_wrap')).toBeTruthy();
    expect(el.querySelector('.status_badge')?.textContent?.trim()).toBe('401');
    expect(el.querySelector('.main_heading')).toBeTruthy();
    expect(el.querySelector('.description')).toBeTruthy();
  });

  it('renders login and register buttons when user is logged out', () => {
    const el = fixture.nativeElement as HTMLElement;
    const buttons = el.querySelectorAll('.actions_wrap button');
    expect(buttons.length).toBe(2);

    const navSpy = vi.spyOn(router, 'navigate');
    const loginBtn = el.querySelector('.btn_big_submit') as HTMLButtonElement;
    loginBtn.click();
    expect(navSpy).toHaveBeenCalledWith(['/', 'en', 'account', 'login'], { queryParams: { redirectSuccess: '/' } });

    const registerBtn = el.querySelector('.btn_big_submit_ghost') as HTMLButtonElement;
    registerBtn.click();
    expect(navSpy).toHaveBeenCalledWith(['/', 'en', 'account', 'signup'], { queryParams: { redirectSuccess: '/' } });
  });

  it('renders topic navigation links when user is authenticated', () => {
    isAuthSignal.set(true);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const links = el.querySelectorAll('.actions_wrap a');
    expect(links.length).toBe(2);
    expect(links[0].getAttribute('href')).toBe('/en/my/topics');
    expect(links[1].getAttribute('href')).toBe('/en/public/topics');
  });

  it('renders back to dashboard link', () => {
    const el = fixture.nativeElement as HTMLElement;
    const backLink = el.querySelector('.link_back') as HTMLAnchorElement;
    expect(backLink).toBeTruthy();
    expect(backLink.getAttribute('href')).toBe('/en');
  });
});
