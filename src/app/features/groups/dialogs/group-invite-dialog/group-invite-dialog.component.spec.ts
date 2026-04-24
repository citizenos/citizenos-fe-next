import { TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runInInjectionContext, EnvironmentInjector } from '@angular/core';
import { GroupInviteDialogComponent } from './group-invite-dialog.component';
import { DIALOG_DATA } from '../../../../shared/dialog/dialog-tokens';
import { DialogRef } from '../../../../shared/dialog/dialog-ref';
import { GroupInviteUserService } from '../../../../core/services/group-invite-user.service';
import { GroupJoinService } from '../../../../core/services/group-join.service';
import { GroupMemberUserService } from '../../../../core/services/group-member-user.service';
import { SearchService } from '../../../../core/services/search.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { DialogService } from '../../../../shared/dialog/dialog.service';
import { UserStore } from '../../../../core/state/user.store';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

const mockGroup = { id: 'g1', name: 'Test', visibility: 'public', join: { token: 'tok123', level: 'read' } };
const mockDialogRef = { close: vi.fn() };
const mockInviteUserService = { invite: vi.fn().mockReturnValue(of({})) };
const mockGroupJoinService = {
  generateToken: vi.fn().mockReturnValue(of({ token: 'newTok', level: 'read' })),
  updateLevel: vi.fn().mockReturnValue(of({})),
};
const mockMemberUserService = { LEVELS: ['read', 'admin'] };
const mockSearchService = {
  searchUsers: vi.fn().mockReturnValue(of({ results: { public: { users: { rows: [] } } } })),
};
const mockNotification = { success: vi.fn() };
const mockDialogService = { open: vi.fn().mockReturnValue({ afterClosed: () => of(true) }) };
const mockUserStore = { user: vi.fn().mockReturnValue(null) };

describe('GroupInviteDialogComponent', () => {
  let injector: EnvironmentInjector;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: DIALOG_DATA, useValue: { group: mockGroup } },
        { provide: DialogRef, useValue: mockDialogRef },
        { provide: GroupInviteUserService, useValue: mockInviteUserService },
        { provide: GroupJoinService, useValue: mockGroupJoinService },
        { provide: GroupMemberUserService, useValue: mockMemberUserService },
        { provide: SearchService, useValue: mockSearchService },
        { provide: NotificationService, useValue: mockNotification },
        { provide: DialogService, useValue: mockDialogService },
        { provide: UserStore, useValue: mockUserStore },
      ],
    });
    injector = TestBed.inject(EnvironmentInjector);
  });

  function makeComp() {
    return runInInjectionContext(injector, () => new GroupInviteDialogComponent());
  }

  it('should instantiate', () => {
    expect(makeComp()).toBeTruthy();
  });

  it('activeTab defaults to invite', () => {
    expect(makeComp().activeTab()).toBe('invite');
  });

  it('pendingUsers starts empty', () => {
    expect(makeComp().pendingUsers()).toEqual([]);
  });

  it('joinUrl is generated from group join token', () => {
    const comp = makeComp();
    expect(comp.joinUrl()).toContain('tok123');
  });

  it('addMember adds user to pendingUsers', () => {
    const comp = makeComp();
    comp.addMember({ userId: 'u1', name: 'Alice' });
    expect(comp.pendingUsers().length).toBe(1);
    expect(comp.pendingUsers()[0].userId).toBe('u1');
  });

  it('addMember prevents duplicates', () => {
    const comp = makeComp();
    comp.addMember({ userId: 'u1', name: 'Alice' });
    comp.addMember({ userId: 'u1', name: 'Alice' });
    expect(comp.pendingUsers().length).toBe(1);
  });

  it('removeMember removes from pendingUsers', () => {
    const comp = makeComp();
    const user = { userId: 'u1', name: 'Alice' };
    comp.addMember(user);
    comp.removeMember(comp.pendingUsers()[0]);
    expect(comp.pendingUsers()).toEqual([]);
  });

  it('addEmail with valid email adds user', () => {
    const comp = makeComp();
    comp.addEmail('test@example.com');
    expect(comp.pendingUsers().length).toBe(1);
  });

  it('addEmail with invalid email adds to invalidEmails', () => {
    const comp = makeComp();
    comp.addEmail('not-an-email');
    expect(comp.invalidEmails().length).toBe(1);
  });

  it('invite with no users sets noUsersSelected', () => {
    const comp = makeComp();
    comp.invite();
    expect(comp.noUsersSelected()).toBe(true);
    expect(mockInviteUserService.invite).not.toHaveBeenCalled();
  });

  it('invite with users calls invite service', () => {
    const comp = makeComp();
    comp.addMember({ userId: 'u1', name: 'Alice' });
    comp.invite();
    expect(mockInviteUserService.invite).toHaveBeenCalledWith('g1', expect.arrayContaining([
      expect.objectContaining({ userId: 'u1' })
    ]));
  });

  it('updateAllLevels changes level for all pending users', () => {
    const comp = makeComp();
    comp.addMember({ userId: 'u1', name: 'Alice' });
    comp.updateAllLevels('admin');
    expect(comp.pendingUsers()[0].level).toBe('admin');
    expect(comp.selectedLevel()).toBe('admin');
  });
});
