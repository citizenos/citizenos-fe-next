import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { GroupShareComponent } from './group-share.component';
import { GroupJoinService } from '../../../../../core/services/group-join.service';
import { GroupMemberUserService } from '../../../../../core/services/group-member-user.service';
import { GroupDetailService } from '../../../../../core/services/group-detail.service';
import { DialogService } from '../../../../../shared/dialog/dialog.service';
import { of } from 'rxjs';

const mockGroup: any = {
  id: 'g1',
  permission: { level: 'admin' },
  join: { token: 'abc123', level: 'read' }
};

describe('GroupShareComponent', () => {
  let component: GroupShareComponent;
  let groupJoinService: any;
  let memberUserService: any;
  let groupDetailService: any;
  let dialog: any;

  beforeEach(() => {
    groupJoinService = {
      generateToken: vi.fn().mockReturnValue(of({ token: 'newtoken', level: 'read' })),
      updateLevel: vi.fn().mockReturnValue(of(null))
    };
    memberUserService = {
      LEVELS: ['read', 'admin']
    };
    groupDetailService = {
      canUpdate: vi.fn().mockReturnValue(true),
      canShare: vi.fn().mockReturnValue(true)
    };
    dialog = {
      open: vi.fn().mockReturnValue({ afterClosed: () => of(true) })
    };

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: GroupJoinService, useValue: groupJoinService },
        { provide: GroupMemberUserService, useValue: memberUserService },
        { provide: GroupDetailService, useValue: groupDetailService },
        { provide: DialogService, useValue: dialog }
      ]
    });
    component = TestBed.runInInjectionContext(() => new GroupShareComponent());
    (component as any).group = vi.fn().mockReturnValue(mockGroup);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit sets joinToken and joinLevel from group.join', () => {
    component.ngOnInit();
    expect(component.joinToken()).toBe('abc123');
    expect(component.joinLevel()).toBe('read');
  });

  it('ngOnInit generates join URL with token when canShare', () => {
    component.ngOnInit();
    expect(component.joinUrl()).toContain('/groups/join/abc123');
  });

  it('ngOnInit generates group join URL when no token', () => {
    (component as any).group = vi.fn().mockReturnValue({ ...mockGroup, join: null });
    component.ngOnInit();
    expect(component.joinUrl()).toContain('/groups/g1/join');
  });

  it('canUpdate delegates to groupDetailService', () => {
    expect(component.canUpdate()).toBe(true);
  });

  it('LEVELS comes from memberUserService', () => {
    expect(component.LEVELS).toEqual(['read', 'admin']);
  });

  describe('generateTokenJoin', () => {
    it('opens confirm dialog', () => {
      component.ngOnInit();
      component.generateTokenJoin();
      expect(dialog.open).toHaveBeenCalled();
    });

    it('calls generateToken and updates joinToken on confirm', () => {
      component.ngOnInit();
      component.generateTokenJoin();
      expect(groupJoinService.generateToken).toHaveBeenCalledWith('g1', 'read');
      expect(component.joinToken()).toBe('newtoken');
    });

    it('does not call generateToken when cancelled', () => {
      dialog.open = vi.fn().mockReturnValue({ afterClosed: () => of(false) });
      component.ngOnInit();
      component.generateTokenJoin();
      expect(groupJoinService.generateToken).not.toHaveBeenCalled();
    });
  });

  describe('doUpdateJoinToken', () => {
    it('calls updateLevel with current token', () => {
      component.ngOnInit();
      component.doUpdateJoinToken('admin');
      expect(groupJoinService.updateLevel).toHaveBeenCalledWith('g1', 'abc123', 'admin');
    });

    it('updates joinLevel on success', () => {
      component.ngOnInit();
      component.doUpdateJoinToken('admin');
      expect(component.joinLevel()).toBe('admin');
    });

    it('does nothing if no token', () => {
      (component as any).group = vi.fn().mockReturnValue({ ...mockGroup, join: null });
      component.ngOnInit();
      component.doUpdateJoinToken('admin');
      expect(groupJoinService.updateLevel).not.toHaveBeenCalled();
    });
  });

  describe('copyInviteLink', () => {
    it('writes to clipboard and sets copySuccess', async () => {
      Object.assign(navigator, {
        clipboard: { writeText: vi.fn().mockResolvedValue(undefined) }
      });
      component.ngOnInit();
      component.copyInviteLink();
      await Promise.resolve();
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(component.joinUrl());
    });
  });

  describe('showQR', () => {
    it('starts as false', () => {
      expect(component.showQR()).toBe(false);
    });

    it('can be set to true', () => {
      component.showQR.set(true);
      expect(component.showQR()).toBe(true);
    });
  });
});
