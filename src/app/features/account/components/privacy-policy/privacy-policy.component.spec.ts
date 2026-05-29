import { MockIconComponent } from '../../../../shared/testing/mocks';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Directive } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { PrivacyPolicyComponent } from './privacy-policy.component';
import { DIALOG_DATA, DialogService } from '../../../../shared/dialog';
import { UserService } from '../../../../core/services/user.service';
import { UserStore } from '../../../../core/state/user.store';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({ selector: 'cos-terms-links', template: '', standalone: true })
class TermsLinksStub {}

// eslint-disable-next-line @angular-eslint/directive-selector
@Directive({ selector: '[dialogClose]', standalone: true })
class DialogCloseStub {}

@Component({ template: '', standalone: true })
class EmptyComponent {}

const mockUser = { id: 'user1', name: 'Test User' };

describe('PrivacyPolicyComponent', () => {
  let fixture: ComponentFixture<PrivacyPolicyComponent>;
  let component: PrivacyPolicyComponent;
  let userService: unknown;
  let dialogService: unknown;
  let userStore: unknown;

  function setup(isNew = false) {
    userService = {
      updateTermsVersion: vi.fn().mockReturnValue(of({})),
      listUserConnections: vi.fn().mockReturnValue(of({ rows: [] })),
      deleteUser: vi.fn().mockReturnValue(of({}))
    };
    const mockDialogRef = { afterClosed: () => of(false) };
    dialogService = {
      open: vi.fn().mockReturnValue(mockDialogRef),
      closeAll: vi.fn()
    };
    userStore = {
      user: () => mockUser,
      logout: vi.fn().mockResolvedValue(undefined)
    };

    TestBed.configureTestingModule({
      imports: [PrivacyPolicyComponent, TranslateModule.forRoot()],
      providers: [
        { provide: DIALOG_DATA, useValue: { user: mockUser, new: isNew } },
        { provide: UserService, useValue: userService },
        { provide: DialogService, useValue: dialogService },
        { provide: UserStore, useValue: userStore },
        provideRouter([{ path: '**', component: EmptyComponent }])
      ]
    }).overrideComponent(PrivacyPolicyComponent, {
      set: { imports: [TranslateModule, TermsLinksStub, DialogCloseStub,
          MockIconComponent] }
    });

    fixture = TestBed.createComponent(PrivacyPolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => TestBed.resetTestingModule());

  it('renders without error', () => {
    setup();
    expect(component).toBeTruthy();
  });

  it('sets isNew from dialog data', () => {
    setup(true);
    expect(component.isNew).toBe(true);
  });

  it('calls updateTermsVersion on accept', () => {
    setup();
    component.accept();
    expect((userService as { updateTermsVersion: () => void }).updateTermsVersion).toHaveBeenCalled();
  });

  it('sets isNew to true when new flag is passed', () => {
    setup(true);
    expect(component.isNew).toBe(true);
  });

  it('opens confirm dialog on reject', () => {
    setup();
    component.reject();
    expect((dialogService as { open: () => void }).open).toHaveBeenCalledWith(ConfirmDialogComponent, expect.anything());
  });

  it('accept button triggers accept()', () => {
    setup();
    const spy = vi.spyOn(component, 'accept');
    fixture.nativeElement.querySelector('.btn_big_submit').click();
    expect(spy).toHaveBeenCalled();
  });
});
