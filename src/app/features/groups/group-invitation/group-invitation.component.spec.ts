import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { GroupInvitationComponent } from './group-invitation.component';
import { GroupInviteUserService } from '../../../core/services/group-invite-user.service';
import { UserStore } from '../../../core/state/user.store';
import { DialogService } from '../../../shared/dialog/dialog.service';
import { NotificationService } from '../../../core/services/notification.service';
import { GroupInvite, GroupInvitation } from '../../../core/services/group-invite-user.service';
import { User } from '../../../core/interfaces/user';

const mockInvite = {
  id: 'invite-1',
  inviteId: 'invite-1',
  level: 'read',
  group: { id: 'group-1', name: 'Test Group', description: 'desc', visibility: 'private' },
  creator: { id: 'creator-1', name: 'Creator' },
  user: { id: 'user-2', name: 'User 2', email: 'user@example.com', isRegistered: true },
};

const mockDialogRef = { afterClosed: () => of(true) };
const mockDialogRefFalse = { afterClosed: () => of(false) };

function buildRoute(params: Record<string, string>, queryParams: Record<string, string> = {}) {
  return { snapshot: { params, queryParams } };
}

function setup(overrides: {
  invite?: Partial<GroupInvitation>;
  inviteError?: { message?: string; code?: number };
  dialogResult?: boolean;
  isAuthenticated?: boolean;
  currentUser?: Partial<User> | null;
  queryParams?: Record<string, string>;
} = {}) {
  const inviteServiceMock = {
    get: vi.fn().mockReturnValue(overrides.inviteError ? throwError(() => overrides.inviteError) : of(overrides.invite ?? mockInvite)),
    accept: vi.fn().mockReturnValue(of({})),
  };
  const dialogResult = overrides.dialogResult ?? true;
  const dialogServiceMock = {
    open: vi.fn().mockReturnValue(dialogResult === true ? mockDialogRef : mockDialogRefFalse),
  };
  const routerMock = { navigate: vi.fn() };
  const notificationMock = { error: vi.fn() };
  const userStoreMock = {
    isAuthenticated: vi.fn().mockReturnValue(overrides.isAuthenticated ?? false),
    user: vi.fn().mockReturnValue(overrides.currentUser ?? null),
    logout: vi.fn().mockResolvedValue(undefined),
  };

  TestBed.configureTestingModule({
    imports: [GroupInvitationComponent],
    providers: [
      { provide: ActivatedRoute, useValue: buildRoute({ groupId: 'group-1', inviteId: 'invite-1' }, overrides.queryParams) },
      { provide: Router, useValue: routerMock },
      { provide: GroupInviteUserService, useValue: inviteServiceMock },
      { provide: UserStore, useValue: userStoreMock },
      { provide: DialogService, useValue: dialogServiceMock },
      { provide: NotificationService, useValue: notificationMock },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(GroupInvitationComponent);
  fixture.detectChanges();

  return { fixture, inviteServiceMock, dialogServiceMock, routerMock, notificationMock, userStoreMock };
}

describe('GroupInvitationComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.resetTestingModule();
  });

  it('renders without error', () => {
    const { fixture } = setup();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('calls GroupInviteUserService.get with groupId and inviteId', () => {
    const { inviteServiceMock } = setup();
    expect(inviteServiceMock.get).toHaveBeenCalledWith({ groupId: 'group-1', inviteId: 'invite-1' });
  });

  it('navigates to dashboard and opens dialog when no direct join', () => {
    const { routerMock, dialogServiceMock } = setup();
    expect(routerMock.navigate).toHaveBeenCalledWith(['dashboard']);
    expect(dialogServiceMock.open).toHaveBeenCalled();
  });

  it('does not open dialog when hasDirectJoin and user matches and is logged in', () => {
    const { dialogServiceMock } = setup({
      invite: { ...mockInvite, user: { id: 'user-1', name: 'User 1', email: 'me@test.com', isRegistered: true } },
      isAuthenticated: true,
      currentUser: { id: 'user-1' },
      queryParams: { join: 'true' },
    });
    expect(dialogServiceMock.open).not.toHaveBeenCalled();
  });

  it('calls accept when logged in and user ID matches after dialog confirm', () => {
    const { inviteServiceMock } = setup({
      invite: { ...mockInvite, user: { id: 'user-1', name: 'User 1', email: 'me@test.com', isRegistered: true } },
      isAuthenticated: true,
      currentUser: { id: 'user-1' },
    });
    expect(inviteServiceMock.accept).toHaveBeenCalledWith({ groupId: 'group-1', inviteId: 'invite-1' });
  });

  it('navigates to groups/:groupId after successful accept', () => {
    const { routerMock } = setup({
      invite: { ...mockInvite, user: { id: 'user-1', name: 'User 1', email: 'me@test.com', isRegistered: true } },
      isAuthenticated: true,
      currentUser: { id: 'user-1' },
    });
    expect(routerMock.navigate).toHaveBeenCalledWith(['/groups', 'group-1']);
  });

  it('navigates to login when logged in but user ID does not match after dialog confirm', () => {
    const { userStoreMock } = setup({
      isAuthenticated: true,
      currentUser: { id: 'other-user' },
    });
    expect(userStoreMock.logout).toHaveBeenCalled();
  });

  it('navigates to login for registered user not logged in after dialog confirm', () => {
    const { routerMock } = setup({
      invite: { ...mockInvite, user: { id: 'user-2', name: 'User 2', email: 'user@example.com', isRegistered: true } },
      isAuthenticated: false,
      currentUser: null,
    });
    expect(routerMock.navigate).toHaveBeenCalledWith(
      ['/account/login'],
      expect.objectContaining({ queryParams: expect.objectContaining({ userId: 'user-2' }) })
    );
  });

  it('navigates to signup for unregistered user after dialog confirm', () => {
    const { routerMock } = setup({
      invite: { ...mockInvite, user: { id: 'user-2', name: 'User 2', email: 'user@example.com', isRegistered: false } },
      isAuthenticated: false,
      currentUser: null,
    });
    expect(routerMock.navigate).toHaveBeenCalledWith(
      ['/account/signup'],
      expect.objectContaining({ queryParams: expect.objectContaining({ inviteId: 'invite-1' }) })
    );
  });

  it('does not navigate anywhere special when dialog is dismissed', () => {
    const { routerMock } = setup({ dialogResult: false });
    const calls = routerMock.navigate.mock.calls;
    const hasMeaningfulNavigation = calls.some((c: string[][]) => {
      const path = c[0] as unknown as string[];
      return path.includes('/account/login') || path.includes('/account/signup') || path.includes('/groups');
    });
    expect(hasMeaningfulNavigation).toBe(false);
  });

  it('navigates to / on error', () => {
    vi.useFakeTimers();
    const { routerMock } = setup({ inviteError: { message: 'fail' } });
    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
    vi.useRealTimers();
  });

  it('shows specific error notification for code 41002', () => {
    vi.useFakeTimers();
    const { notificationMock } = setup({ inviteError: { code: 41002 } });
    vi.runAllTimers();
    expect(notificationMock.error).toHaveBeenCalledWith('MSG_ERROR_GET_API_USERS_GROUPS_INVITES_USERS_41002');
    vi.useRealTimers();
  });
});
