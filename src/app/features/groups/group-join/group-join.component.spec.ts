import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { GroupJoinComponent } from './group-join.component';
import { GroupJoinService } from '../../../core/services/group-join.service';
import { GroupDetailService } from '../../../core/services/group-detail.service';
import { UserStore } from '../../../core/state/user.store';
import { DialogService } from '../../../shared/dialog/dialog.service';
import { Group } from '../../../core/interfaces/group';

const mockGroup = {
  id: 'group-1',
  name: 'Test Group',
  imageUrl: null,
  description: 'desc',
  visibility: 'private',
  creator: { id: 'creator-1', name: 'Creator' },
  userLevel: null,
};

const mockDialogRef = { afterClosed: () => of(true) };
const mockDialogRefFalse = { afterClosed: () => of(false) };

function buildRoute(params: Record<string, string>, queryParams: Record<string, string> = {}) {
  return { snapshot: { params, queryParams } };
}

function setup(overrides: {
  group?: Partial<Group>;
  groupError?: { status: { code: number } };
  joinResult?: { id: string };
  joinError?: { status: { code: number } };
  dialogResult?: boolean;
  isAuthenticated?: boolean;
  routeParams?: Record<string, string>;
  queryParams?: Record<string, string>;
} = {}) {
  const dialogResult = overrides.dialogResult ?? true;
  const groupJoinServiceMock = {
    get: vi.fn().mockReturnValue(of(overrides.group ?? mockGroup)),
    join: vi.fn().mockReturnValue(overrides.joinError ? throwError(() => overrides.joinError) : of(overrides.joinResult ?? { id: 'group-1' })),
    joinPublic: vi.fn().mockReturnValue(overrides.joinError ? throwError(() => overrides.joinError) : of(overrides.joinResult ?? { id: 'group-1' })),
  };
  const groupDetailServiceMock = {
    loadGroup: vi.fn().mockReturnValue(overrides.groupError ? throwError(() => overrides.groupError) : of(overrides.group ?? mockGroup)),
  };
  const dialogServiceMock = {
    open: vi.fn().mockReturnValue(dialogResult ? mockDialogRef : mockDialogRefFalse),
  };
  const routerMock = { navigate: vi.fn() };
  const userStoreMock = {
    isAuthenticated: vi.fn().mockReturnValue(overrides.isAuthenticated ?? false),
  };

  const routeParams = overrides.routeParams ?? { token: 'tok-1' };
  TestBed.configureTestingModule({
    imports: [GroupJoinComponent],
    providers: [
      { provide: ActivatedRoute, useValue: buildRoute(routeParams, overrides.queryParams ?? {}) },
      { provide: Router, useValue: routerMock },
      { provide: GroupJoinService, useValue: groupJoinServiceMock },
      { provide: GroupDetailService, useValue: groupDetailServiceMock },
      { provide: UserStore, useValue: userStoreMock },
      { provide: DialogService, useValue: dialogServiceMock },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(GroupJoinComponent);
  fixture.detectChanges();

  return { fixture, groupJoinServiceMock, groupDetailServiceMock, dialogServiceMock, routerMock, userStoreMock };
}

describe('GroupJoinComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.resetTestingModule();
  });

  it('renders without error', () => {
    const { fixture } = setup();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('calls GroupJoinService.get with token when token param present', () => {
    const { groupJoinServiceMock } = setup({ routeParams: { token: 'my-token' } });
    expect(groupJoinServiceMock.get).toHaveBeenCalledWith('my-token');
  });

  it('calls GroupDetailService.loadGroup when no token (groupId param)', () => {
    const { groupDetailServiceMock } = setup({ routeParams: { groupId: 'group-1' } });
    expect(groupDetailServiceMock.loadGroup).toHaveBeenCalledWith('group-1');
  });

  it('navigates to /groups/:id immediately when user is already in group', () => {
    const { routerMock } = setup({ group: { ...mockGroup, userLevel: 'read' } });
    expect(routerMock.navigate).toHaveBeenCalledWith(['/groups', 'group-1']);
  });

  it('navigates to dashboard and opens dialog when no direct join and not in group', () => {
    const { routerMock, dialogServiceMock } = setup();
    expect(routerMock.navigate).toHaveBeenCalledWith(['dashboard']);
    expect(dialogServiceMock.open).toHaveBeenCalled();
  });

  it('calls GroupJoinService.join with token after dialog confirm', () => {
    const { groupJoinServiceMock } = setup();
    expect(groupJoinServiceMock.join).toHaveBeenCalledWith('tok-1');
  });

  it('navigates to /groups/:id after successful join', () => {
    const { routerMock } = setup({ joinResult: { id: 'group-1' } });
    expect(routerMock.navigate).toHaveBeenCalledWith(['/groups', 'group-1']);
  });

  it('calls GroupJoinService.joinPublic when no token', () => {
    const { groupJoinServiceMock } = setup({ routeParams: { groupId: 'group-1' } });
    expect(groupJoinServiceMock.joinPublic).toHaveBeenCalledWith('group-1');
  });

  it('does not join when dialog is dismissed', () => {
    const { groupJoinServiceMock } = setup({ dialogResult: false });
    expect(groupJoinServiceMock.join).not.toHaveBeenCalled();
  });

  it('navigates to login when hasDirectJoin and not logged in', () => {
    const { routerMock } = setup({
      isAuthenticated: false,
      queryParams: { join: 'true' },
    });
    expect(routerMock.navigate).toHaveBeenCalledWith(
      ['/account/login'],
      expect.objectContaining({ queryParams: expect.objectContaining({ redirectSuccess: expect.any(String) }) })
    );
  });

  it('joins directly when hasDirectJoin and logged in', () => {
    const { groupJoinServiceMock } = setup({
      isAuthenticated: true,
      queryParams: { join: 'true' },
    });
    expect(groupJoinServiceMock.join).toHaveBeenCalled();
  });

  it('navigates to /404 on 404 error', () => {
    const { routerMock } = setup({
      groupError: { status: { code: 40400 } },
      routeParams: { groupId: 'group-1' },
    });
    expect(routerMock.navigate).toHaveBeenCalledWith(['/404']);
  });
});
