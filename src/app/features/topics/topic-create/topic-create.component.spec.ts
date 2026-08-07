import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({ template: '', standalone: true })
class EmptyComponent {}
import { TopicService } from '../../../core/services/topic.service';
import { UploadService } from '../../../core/services/upload.service';
import { NotificationService } from '../../../core/services/notification.service';
import { TopicMemberUserService } from '../../../core/services/topic-member-user.service';
import { TopicInviteUserService } from '../../../core/services/topic-invite-user.service';
import { TopicDiscussionService } from '../../../core/services/topic-discussion.service';
import { GroupMemberTopicService } from '../../../core/services/group-member-topic.service';
import { DialogService } from '../../../shared/dialog/dialog.service';
import { TopicCreateComponent } from './topic-create.component';
import { of } from 'rxjs';
import { GroupDetailService } from '../../../core/services/group-detail.service';
import { Router, ActivatedRoute } from '@angular/router';

const mockTopic = { id: 'new-id', title: '', visibility: 'private', status: 'draft', categories: [] };
const mockTopicService = { save: vi.fn(), patch: vi.fn(), get: vi.fn() };
const mockUploadService = { upload: vi.fn() };
const mockNotificationService = { showRaw: vi.fn(), success: vi.fn() };
const mockMemberUserService = { loadItems: vi.fn() };
const mockInviteUserService = { loadItems: vi.fn() };
const mockDiscussionService = { get: vi.fn(), create: vi.fn(), update: vi.fn() };
const mockGroupMemberTopicService = { addTopic: vi.fn(), removeTopicFromGroup: vi.fn() };
const mockDialogService = { open: vi.fn() };
const mockGroup = { id: 'g1', name: 'Test Group', visibility: 'private' };
const mockGroupDetailService = {
  loadGroup: vi.fn().mockReturnValue(of(mockGroup)),
  get: vi.fn().mockReturnValue(of(mockGroup))
};

function setupProviders() {
  TestBed.configureTestingModule({
    imports: [TranslateModule.forRoot()],
    providers: [
      provideRouter([{ path: 'topics/:id', component: EmptyComponent }]),
      { provide: TopicService, useValue: mockTopicService },
      { provide: UploadService, useValue: mockUploadService },
      { provide: NotificationService, useValue: mockNotificationService },
      { provide: TopicMemberUserService, useValue: mockMemberUserService },
      { provide: TopicInviteUserService, useValue: mockInviteUserService },
      { provide: TopicDiscussionService, useValue: mockDiscussionService },
      { provide: GroupMemberTopicService, useValue: mockGroupMemberTopicService },
      { provide: DialogService, useValue: mockDialogService },
      { provide: GroupDetailService, useValue: mockGroupDetailService }
    ]
  });
}

describe('TopicCreateComponent (business logic)', () => {
  let component: TopicCreateComponent;

  beforeEach(() => {
    vi.clearAllMocks();
    mockTopicService.save.mockReturnValue(of(mockTopic));
    mockTopicService.patch.mockReturnValue(of({ ...mockTopic, status: 'inProgress' }));
    mockUploadService.upload.mockReturnValue(of(null));

    mockDiscussionService.create.mockReturnValue(of({ id: 'disc-1', question: '', deadline: null }));
    mockDiscussionService.update.mockReturnValue(of({ id: 'disc-1', question: '', deadline: null }));
    mockGroupMemberTopicService.addTopic.mockReturnValue(of(null));
    mockGroupMemberTopicService.removeTopicFromGroup.mockReturnValue(of(null));
    mockDialogService.open.mockReturnValue({ afterClosed: () => of(true) });
    setupProviders();
    component = TestBed.runInInjectionContext(() => new TopicCreateComponent());
  });

  it('should start at info step', () => {
    expect(component.currentStep()).toBe('info');
  });

  it('canNavigateTo info always returns true', () => {
    expect(component.canNavigateTo('info')).toBe(true);
  });

  it('canNavigateTo settings requires title', () => {
    expect(component.canNavigateTo('settings')).toBe(false);
    component.onTopicUpdate({ title: 'New Topic' });
    expect(component.canNavigateTo('settings')).toBe(true);
  });

  it('saveToSettings creates topic if none exists', () => {
    component.onTopicUpdate({ title: 'Test' });
    component.saveToSettings();
    expect(mockTopicService.save).toHaveBeenCalled();
  });

  it('saveToSettings skips save if topic already has id', () => {
    mockTopicService.patch.mockReturnValue(of({ id: 'existing-id', title: 'Test', status: 'inProgress' }));
    component.topicModel.set({ id: 'existing-id', title: 'Test' });
    component.saveToSettings();
    expect(mockTopicService.save).not.toHaveBeenCalled();
    expect(component.currentStep()).toBe('settings');
  });

  it('saveAsDraft calls patch and shows success notification', () => {
    component.topicModel.set({ id: 'topic-1', title: 'Draft Topic' });
    component.saveAsDraft();
    expect(mockTopicService.patch).toHaveBeenCalled();
    expect(mockNotificationService.showRaw).toHaveBeenCalledWith('success', expect.any(String));
  });

  it('publishTopic calls patch with status inProgress when topic has id', () => {
    component.topicModel.set({ title: 'New Topic', id: 'topic-1' });
    component.publishTopic();
    expect(mockTopicService.patch).toHaveBeenCalledWith(expect.objectContaining({ status: 'inProgress' }));
  });

  it('inviteEditors opens dialog', () => {
    component.topicModel.set({ id: 'topic-1', title: 'Test' });
    component.inviteEditors();
    expect(mockDialogService.open).toHaveBeenCalled();
  });

  it('onGroupsAdded updates signal', () => {
    const groups = [{ id: 'g1', name: 'Group 1' }];
    component.onGroupsAdded(groups);
    expect(component.addedGroups()).toEqual(groups);
  });

  it('shows loading overlay when isLoading is true', () => {
    const fixture = TestBed.createComponent(TopicCreateComponent);
    fixture.componentInstance.isLoading.set(true);
    fixture.detectChanges();
    const overlay = fixture.nativeElement.querySelector('.loading-overlay');
    expect(overlay).toBeTruthy();
  });

  it('shows error notification when createTopicEagerly fails', () => {
    mockTopicService.save.mockReturnValue({
      pipe: () => ({
        subscribe: (callbacks: any) => callbacks.error()
      })
    });
    
    component.ngOnInit();
    expect(mockNotificationService.showRaw).toHaveBeenCalledWith('error', 'VIEWS.TOPIC_CREATE.ERROR_SAVE_FAILED');
  });

  it('should initialize isCreatedFromGroup and load group when groupId query param is present', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: ActivatedRoute, useValue: {
            snapshot: { paramMap: { get: () => null } },
            queryParams: of({ groupId: 'group-123' })
          }
        },
        { provide: Router, useValue: { navigate: vi.fn().mockResolvedValue(true) } },
        { provide: TopicService, useValue: mockTopicService },
        { provide: UploadService, useValue: mockUploadService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: TopicMemberUserService, useValue: mockMemberUserService },
        { provide: TopicInviteUserService, useValue: mockInviteUserService },
        { provide: TopicDiscussionService, useValue: mockDiscussionService },
        { provide: GroupMemberTopicService, useValue: mockGroupMemberTopicService },
        { provide: DialogService, useValue: mockDialogService },
        { provide: GroupDetailService, useValue: mockGroupDetailService }
      ]
    });
    
    const comp = TestBed.runInInjectionContext(() => new TopicCreateComponent());
    comp.ngOnInit();

    expect(comp.isCreatedFromGroup()).toBe(true);
    expect(mockGroupDetailService.loadGroup).toHaveBeenCalledWith('group-123');
    expect(comp.addedGroups().length).toBe(1);
    expect(comp.addedGroups()[0].id).toBe('g1');
    expect(comp.topicModel().visibility).toBe('private');
  });
});

