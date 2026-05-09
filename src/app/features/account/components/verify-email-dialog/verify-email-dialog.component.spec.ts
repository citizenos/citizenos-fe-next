import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { VerifyEmailDialogComponent } from './verify-email-dialog.component';
import { DIALOG_DATA } from '../../../../shared/dialog/dialog-tokens';
import { DialogRef } from '../../../../shared/dialog/dialog-ref';

function createFixture(data: { email: string } = { email: 'test@example.com' }): ComponentFixture<VerifyEmailDialogComponent> {
  TestBed.configureTestingModule({
    imports: [VerifyEmailDialogComponent, TranslateModule.forRoot()],
    providers: [
      { provide: DIALOG_DATA, useValue: data },
      { provide: DialogRef, useValue: { close: vi.fn() } },
    ],
    schemas: [NO_ERRORS_SCHEMA],
  }).compileComponents();
  const fixture = TestBed.createComponent(VerifyEmailDialogComponent);
  fixture.detectChanges();
  return fixture;
}

describe('VerifyEmailDialogComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.resetTestingModule();
  });

  it('renders without error', () => {
    const fixture = createFixture();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('displays the email from dialog data', () => {
    const fixture = createFixture({ email: 'user@domain.com' });
    const el = fixture.nativeElement.querySelector('.link');
    expect(el?.textContent).toContain('user@domain.com');
  });

  it('has a close button', () => {
    const fixture = createFixture();
    const btn = fixture.nativeElement.querySelector('.btn_dialog_close');
    expect(btn).toBeTruthy();
  });

  it('has an ok button', () => {
    const fixture = createFixture();
    const btn = fixture.nativeElement.querySelector('.btn_big_submit');
    expect(btn).toBeTruthy();
  });
});
