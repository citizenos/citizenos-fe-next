import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PageUnauthorizedComponent } from './page-unauthorized.component';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthDialogService } from '../../services/auth-dialog.service';

const mockAuthDialog = {
  openLogin: vi.fn()
};

function setup() {
  TestBed.configureTestingModule({
    imports: [PageUnauthorizedComponent, TranslateModule.forRoot()],
    providers: [
      provideRouter([]),
      { provide: AuthDialogService, useValue: mockAuthDialog }
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(PageUnauthorizedComponent);
  fixture.detectChanges();
  return { fixture, component: fixture.componentInstance };
}

describe('PageUnauthorizedComponent', () => {
  it('renders without error', () => {
    const { fixture } = setup();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the unauthorized container element', () => {
    const { fixture } = setup();
    const el = fixture.nativeElement.querySelector('.page_unauthorized');
    expect(el).toBeTruthy();
  });

  it('renders a link back to dashboard', () => {
    const { fixture } = setup();
    const link = fixture.nativeElement.querySelector('a[href="/dashboard"]');
    expect(link).toBeTruthy();
  });

  it('renders a login button that triggers openLogin', () => {
    const { fixture, component } = setup();
    const btn = fixture.nativeElement.querySelector('button.btn_big_submit') as HTMLButtonElement;
    expect(btn).toBeTruthy();
    btn.click();
    expect(mockAuthDialog.openLogin).toHaveBeenCalled();
  });
});
