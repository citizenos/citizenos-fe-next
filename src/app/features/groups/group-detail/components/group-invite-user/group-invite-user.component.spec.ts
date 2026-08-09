import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { GroupInviteUserComponent } from './group-invite-user.component';
import { GroupInviteUserService } from '../../../../../core/services/group-invite-user.service';
import { GroupDetailService } from '../../../../../core/services/group-detail.service';
import { DialogService } from '../../../../../shared/dialog/dialog.service';
import { of, throwError } from 'rxjs';

import { Group } from '../../../../../core/interfaces/group';
import { GroupMember } from '../../../../../core/services/group-member-user.service';
import { signal } from '@angular/core';

const mockGroup: Partial<Group> = { id: 'g1', permission: { level: 'admin' } };
const mockUser: GroupMember = { id: 'u1', name: 'Invited User', email: 'invited@test.com', level: 'read', invite: { id: 'inv1', level: 'read' } };

describe('GroupInviteUserComponent', () => {
  let component: GroupInviteUserComponent;
  let inviteUserService: Partial<GroupInviteUserService>;
  let groupDetailService: Partial<GroupDetailService>;
  let dialog: Partial<DialogService>;

  beforeEach(() => {
    inviteUserService = {
      LEVELS: { read: 'read', admin: 'admin' },
      updateInvite: vi.fn().mockReturnValue(of(null)),
      deleteInvite: vi.fn().mockReturnValue(of(null))
    };
    groupDetailService = {
      canUpdate: vi.fn().mockReturnValue(true)
    };
    dialog = {
      open: vi.fn().mockReturnValue({ afterClosed: () => of(true) })
    };

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: GroupInviteUserService, useValue: inviteUserService },
        { provide: GroupDetailService, useValue: groupDetailService },
        { provide: DialogService, useValue: dialog }
      ]
    });
    component = TestBed.runInInjectionContext(() => new GroupInviteUserComponent());
    component = TestBed.runInInjectionContext(() => new GroupInviteUserComponent());
    (component as unknown as { user: unknown }).user = signal(mockUser);
    (component as unknown as { group: unknown }).group = signal(mockGroup);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('canUpdate delegates to groupDetailService', () => {
    expect(component.canUpdate()).toBe(true);
    expect(groupDetailService.canUpdate).toHaveBeenCalledWith(mockGroup);
  });

  it('LEVELS comes from inviteUserService', () => {
    expect(component.LEVELS).toEqual({ read: 'read', admin: 'admin' });
  });

  describe('doUpdateInviteUser', () => {
    it('does nothing if level is unchanged', () => {
      component.doUpdateInviteUser('read');
      expect(inviteUserService.updateInvite).not.toHaveBeenCalled();
    });

    it('calls updateInvite and updates invite.level', () => {
      const user = { ...mockUser, invite: { id: 'inv1', level: 'read' } };
      (component as unknown as { user: unknown }).user = signal(user);
      component.doUpdateInviteUser('admin');
      expect(inviteUserService.updateInvite).toHaveBeenCalledWith('g1', 'inv1', 'admin');
      expect(user.invite.level).toBe('admin');
    });

    it('rolls back invite.level on error', () => {
      inviteUserService.updateInvite = vi.fn().mockReturnValue(throwError(() => new Error('fail')));
      const user = { ...mockUser, invite: { id: 'inv1', level: 'read' } };
      (component as unknown as { user: unknown }).user = signal(user);
      component.doUpdateInviteUser('admin');
      expect(user.invite.level).toBe('read');
    });
  });

  describe('doDeleteInviteUser', () => {
    it('opens confirm dialog', () => {
      component.doDeleteInviteUser();
      expect(dialog.open).toHaveBeenCalled();
    });

    it('calls deleteInvite and emits memberChanged on confirm', () => {
      const spy = vi.fn();
      component.memberChanged.subscribe(spy);
      component.doDeleteInviteUser();
      expect(inviteUserService.deleteInvite).toHaveBeenCalledWith('g1', 'inv1');
      expect(spy).toHaveBeenCalled();
    });

    it('does not call deleteInvite when dialog cancelled', () => {
      dialog.open = vi.fn().mockReturnValue({ afterClosed: () => of(false) });
      component.doDeleteInviteUser();
      expect(inviteUserService.deleteInvite).not.toHaveBeenCalled();
    });
  });
});
