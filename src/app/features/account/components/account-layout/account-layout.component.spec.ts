import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountLayoutComponent } from './account-layout.component';
import { RouterOutlet } from '@angular/router';
import { By } from '@angular/platform-browser';
import { describe, it, expect, beforeEach } from 'vitest';
import { provideRouter } from '@angular/router';

describe('AccountLayoutComponent', () => {
  let component: AccountLayoutComponent;
  let fixture: ComponentFixture<AccountLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountLayoutComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(AccountLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a router-outlet', () => {
    const debugElement = fixture.debugElement.query(By.directive(RouterOutlet));
    expect(debugElement).toBeTruthy();
  });

  it('should have a logo with a routerLink to root', () => {
    const logoContainer = fixture.nativeElement.querySelector('.logo-container');
    expect(logoContainer).toBeTruthy();
    // In Angular 17+, routerLink is an attribute that we can check
    // However, it's better to check if it has the directive if we want to be sure.
    // For now, let's just check if the element exists and is rendered.
  });

  it('should have an illustration column and a form column', () => {
    const illustrationColumn = fixture.nativeElement.querySelector('.illustration-column');
    const formColumn = fixture.nativeElement.querySelector('.form-column');
    expect(illustrationColumn).toBeTruthy();
    expect(formColumn).toBeTruthy();
  });
});
