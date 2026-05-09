import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { GroupMemberUserComponent } from './group-member-user.component';
import { Group } from '../../../../../core/interfaces/group';
import { GroupMember, GroupMemberUserService } from '../../../../../core/services/group-member-user.service';
import { GroupDetailService } from '../../../../../core/services/group-detail.service';
import { DialogService } from '../../../../../shared/dialog/dialog.service';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';

const mockGroup: Partial<Group> = { id: 'g1', permission: { level: 'admin' } };
const mockMember: GroupMember = { id: 'u1', userId: 'u1', name: 'Test User', email: 'test@test.com', level: 'read', imageUrl: null };

describe('GroupMemberUserComponent', () => {
  let component: GroupMemberUserComponent;
  let memberUserService: Partial<GroupMemberUserService>;
  let groupDetailService: Partial<GroupDetailService>;
  let dialog: Partial<DialogService>;

  beforeEach(() => {
    memberUserService = {
      LEVELS: ['read', 'admin'],
      updateLevel: vi.fn().mockReturnValue(of(null)),
      removeMember: vi.fn().mockReturnValue(of(null))
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
        { provide: GroupMemberUserService, useValue: memberUserService },
        { provide: GroupDetailService, useValue: groupDetailService },
        { provide: DialogService, useValue: dialog }
      ]
    });
    component = TestBed.runInInjectionContext(() => new GroupMemberUserComponent());
    (component as unknown as { member: unknown }).member = signal(mockMember);
    (component as unknown as { group: unknown }).group = signal(mockGroup);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('canUpdate delegates to groupDetailService', () => {
    expect(component.canUpdate()).toBe(true);
    expect(groupDetailService.canUpdate).toHaveBeenCalledWith(mockGroup);
  });

  it('LEVELS comes from memberUserService', () => {
    expect(component.LEVELS).toEqual(['read', 'admin']);
  });

  describe('doUpdateMemberUser', () => {
    it('does nothing if level is unchanged', () => {
      component.doUpdateMemberUser('read');
      expect(memberUserService.updateLevel).not.toHaveBeenCalled();
    });

    it('calls updateLevel and updates member.level on success', () => {
      const member = { ...mockMember };
      (component as unknown as { member: unknown }).member = signal(member);
      component.doUpdateMemberUser('admin');
      expect(memberUserService.updateLevel).toHaveBeenCalledWith('g1', 'u1', 'admin');
      expect(member.level).toBe('admin');
    });

    it('rolls back level on error', () => {
      memberUserService.updateLevel = vi.fn().mockReturnValue(throwError(() => new Error('fail')));
      const member = { ...mockMember };
      (component as unknown as { member: unknown }).member = signal(member);
      component.doUpdateMemberUser('admin');
      expect(member.level).toBe('read');
    });
  });

  describe('doDeleteMemberUser', () => {
    it('opens confirm dialog', () => {
      component.doDeleteMemberUser();
      expect(dialog.open).toHaveBeenCalled();
    });

    it('calls removeMember and emits memberChanged on confirm', () => {
      const spy = vi.fn();
      component.memberChanged.subscribe(spy);
      component.doDeleteMemberUser();
      expect(memberUserService.removeMember).toHaveBeenCalledWith('g1', 'u1');
      expect(spy).toHaveBeenCalled();
    });

    it('does not call removeMember when dialog cancelled', () => {
      dialog.open = vi.fn().mockReturnValue({ afterClosed: () => of(false) });
      component.doDeleteMemberUser();
      expect(memberUserService.removeMember).not.toHaveBeenCalled();
    });
  });
});
