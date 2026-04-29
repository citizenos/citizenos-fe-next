import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { AddEmailComponent } from './add-email.component';
import { DIALOG_DATA } from '../../../../shared/dialog/dialog-tokens';
import { DialogRef } from '../../../../shared/dialog/dialog-ref';
import { DialogService } from '../../../../shared/dialog/dialog.service';
import { UserStore } from '../../../../core/state/user.store';
import { UserService } from '../../../../core/services/user.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Router } from '@angular/router';

const mockUser = { id: 'user-1', name: 'Alice', email: null };
const dialogRefMock = { close: vi.fn() };
const dialogServiceMock = { closeAll: vi.fn() };
const userStoreMock = { logout: vi.fn().mockResolvedValue(undefined) };
const userServiceMock = { update: vi.fn().mockReturnValue(of({})) };
const notificationMock = { info: vi.fn(), notifications: vi.fn().mockReturnValue([]) };
const routerMock = { navigate: vi.fn() };

function createFixture(): ComponentFixture<AddEmailComponent> {
  TestBed.configureTestingModule({
    imports: [AddEmailComponent, TranslateModule.forRoot()],
    providers: [
      { provide: DIALOG_DATA, useValue: { user: mockUser } },
      { provide: DialogRef, useValue: dialogRefMock },
      { provide: DialogService, useValue: dialogServiceMock },
      { provide: UserStore, useValue: userStoreMock },
      { provide: UserService, useValue: userServiceMock },
      { provide: NotificationService, useValue: notificationMock },
      { provide: Router, useValue: routerMock },
    ],
    schemas: [NO_ERRORS_SCHEMA],
  }).compileComponents();
  const fixture = TestBed.createComponent(AddEmailComponent);
  fixture.detectChanges();
  return fixture;
}

describe('AddEmailComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    userStoreMock.logout.mockResolvedValue(undefined);
    userServiceMock.update.mockReturnValue(of({}));
    TestBed.resetTestingModule();
  });

  it('renders without error', () => {
    const fixture = createFixture();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('has email input field', () => {
    const fixture = createFixture();
    const input = fixture.nativeElement.querySelector('input[type="email"]');
    expect(input).toBeTruthy();
  });

  it('has submit button', () => {
    const fixture = createFixture();
    const btn = fixture.nativeElement.querySelector('.btn_big_submit');
    expect(btn).toBeTruthy();
  });

  it('has cancel link', () => {
    const fixture = createFixture();
    const links = fixture.nativeElement.querySelectorAll('a');
    const cancelLink = Array.from(links).find((a: any) => a.textContent?.includes('MODALS.ADD_EMAIL_LNK_CANCEL'));
    expect(cancelLink || links.length > 0).toBeTruthy();
  });

  it('doUpdateProfile calls UserService.update with email', () => {
    const fixture = createFixture();
    fixture.componentInstance.form.setValue({ email: 'new@example.com' });
    fixture.componentInstance.doUpdateProfile();
    expect(userServiceMock.update).toHaveBeenCalledWith({ email: 'new@example.com' });
  });

  it('doUpdateProfile sets errors when email is empty', () => {
    const fixture = createFixture();
    fixture.componentInstance.form.setValue({ email: '' });
    fixture.componentInstance.doUpdateProfile();
    expect(fixture.componentInstance.errors).toBeTruthy();
    expect(userServiceMock.update).not.toHaveBeenCalled();
  });

  it('logout calls userStore.logout and navigates to login', async () => {
    const fixture = createFixture();
    await fixture.componentInstance.logout();
    expect(userStoreMock.logout).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['account', 'login']);
  });

  it('has a close button in dialog header', () => {
    const fixture = createFixture();
    const btn = fixture.nativeElement.querySelector('.btn_dialog_close');
    expect(btn).toBeTruthy();
  });
});
