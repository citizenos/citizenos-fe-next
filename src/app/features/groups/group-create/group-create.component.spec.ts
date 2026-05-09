import { TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runInInjectionContext, EnvironmentInjector } from '@angular/core';
import { GroupCreateComponent } from './group-create.component';
import { UserGroupService } from '../../../core/services/user-group.service';
import { GroupInviteUserService } from '../../../core/services/group-invite-user.service';
import { GroupMemberTopicService } from '../../../core/services/group-member-topic.service';
import { NotificationService } from '../../../core/services/notification.service';
import { provideRouter, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

const mockGroup = { id: 'g1', name: 'New Group', imageUrl: null };

const mockUserGroupService = {
  save: vi.fn().mockReturnValue(of(mockGroup)),
  uploadGroupImage: vi.fn().mockReturnValue(of({ link: 'http://img' })),
};

const mockInviteService = {
  invite: vi.fn().mockReturnValue(of({})),
};

const mockTopicService = {
  addTopic: vi.fn().mockReturnValue(of({})),
};

const mockNotification = {
  success: vi.fn(),
  error: vi.fn(),
};

const mockRouter = { navigate: vi.fn().mockReturnValue(Promise.resolve(true)) };

describe('GroupCreateComponent', () => {
  let injector: EnvironmentInjector;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: Router, useValue: mockRouter },
        { provide: UserGroupService, useValue: mockUserGroupService },
        { provide: GroupInviteUserService, useValue: mockInviteService },
        { provide: GroupMemberTopicService, useValue: mockTopicService },
        { provide: NotificationService, useValue: mockNotification },
      ],
    });
    injector = TestBed.inject(EnvironmentInjector);
  });

  function makeComp(): GroupCreateComponent {
    return runInInjectionContext(injector, () => new GroupCreateComponent());
  }

  it('should instantiate', () => {
    expect(makeComp()).toBeTruthy();
  });

  it('defaults to info step', () => {
    expect(makeComp().currentStep()).toBe('info');
  });

  it('currentStepIndex reflects step order', () => {
    const comp = makeComp();
    comp.setStep('settings');
    expect(comp.currentStepIndex()).toBe(1);
  });

  it('nextStep advances to next step', () => {
    const comp = makeComp();
    comp.nextStep();
    expect(comp.currentStep()).toBe('settings');
  });

  it('previousStep goes back', () => {
    const comp = makeComp();
    comp.setStep('settings');
    comp.previousStep();
    expect(comp.currentStep()).toBe('info');
  });

  it('previousStep is no-op on first step', () => {
    const comp = makeComp();
    comp.previousStep();
    expect(comp.currentStep()).toBe('info');
  });

  it('updateGroup merges partial data', () => {
    const comp = makeComp();
    comp.updateGroup({ name: 'Test' });
    expect(comp.group().name).toBe('Test');
    expect(comp.group().visibility).toBe('private');
  });

  it('updateImageFile sets imageFile signal', () => {
    const comp = makeComp();
    const file = new File([''], 'test.jpg');
    comp.updateImageFile(file);
    expect(comp.imageFile()).toBe(file);
  });

  it('createGroup shows error when name is empty', () => {
    const comp = makeComp();
    comp.createGroup();
    expect(mockNotification.error).toHaveBeenCalledWith('VIEWS.GROUP_CREATE.ERROR_NAME_REQUIRED');
    expect(mockUserGroupService.save).not.toHaveBeenCalled();
  });

  it('createGroup calls save and navigates on success', () => {
    const comp = makeComp();
    comp.updateGroup({ name: 'My Group' });
    comp.createGroup();
    expect(mockUserGroupService.save).toHaveBeenCalled();
    expect(mockNotification.success).toHaveBeenCalledWith(
      'VIEWS.GROUP_CREATE.NOTIFICATION_SUCCESS_MESSAGE',
      'VIEWS.GROUP_CREATE.NOTIFICATION_SUCCESS_TITLE'
    );
  });

  it('createGroup calls invite when users are added', () => {
    const comp = makeComp();
    comp.updateGroup({
      name: 'My Group',
      members: { users: [{ id: 'u1', level: 'read' }], topics: { rows: [], count: 0 } },
    });
    comp.createGroup();
    expect(mockInviteService.invite).toHaveBeenCalledWith('g1', expect.arrayContaining([
      expect.objectContaining({ userId: 'u1', level: 'read' }),
    ]));
  });

  it('createGroup calls addTopic when topics are added', () => {
    const comp = makeComp();
    comp.updateGroup({
      name: 'My Group',
      members: {
        users: [],
        topics: { rows: [{ id: 't1', permission: { level: 'admin' } }], count: 1 },
      },
    });
    comp.createGroup();
    expect(mockTopicService.addTopic).toHaveBeenCalledWith('g1', 't1', 'admin');
  });

  it('cancel navigates to my groups', () => {
    const comp = makeComp();
    comp.cancel();
    expect(mockRouter.navigate).toHaveBeenCalledWith(expect.arrayContaining(['my', 'groups']));
  });
});
