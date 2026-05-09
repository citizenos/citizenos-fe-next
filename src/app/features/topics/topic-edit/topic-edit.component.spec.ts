import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute, Router } from '@angular/router';
import { Component } from '@angular/core';
import { of } from 'rxjs';

@Component({ template: '', standalone: true })
class EmptyComponent {}

import { TopicService } from '../../../core/services/topic.service';
import { UploadService } from '../../../core/services/upload.service';
import { NotificationService } from '../../../core/services/notification.service';
import { TopicMemberUserService } from '../../../core/services/topic-member-user.service';
import { TopicInviteUserService } from '../../../core/services/topic-invite-user.service';
import { TopicDiscussionService } from '../../../core/services/topic-discussion.service';
import { TopicIdeationService } from '../../../core/services/topic-ideation.service';
import { TopicVoteService } from '../../../core/services/topic-vote.service';
import { DialogService } from '../../../shared/dialog';
import { TopicSettingsDisabledDialogComponent } from '../topic-view/components/topic-settings-disabled-dialog/topic-settings-disabled-dialog.component';
import { TopicSettingsLockedComponent } from '../topic-view/components/topic-settings-locked/topic-settings-locked.component';
import { TopicEditDisabledDialogComponent } from '../topic-view/components/topic-edit-disabled-dialog/topic-edit-disabled-dialog.component';
import { TopicEditComponent } from './topic-edit.component';
import { Topic } from '../../../core/interfaces/topic';

const mockTopic = { id: 'topic-1', title: 'Existing Topic', visibility: 'public', status: 'inProgress', categories: [], discussionId: 'disc-1' };
const mockTopicService = {
  get: vi.fn(),
  patch: vi.fn(),
  canEditDescription: vi.fn().mockReturnValue(true),
  canDelete: vi.fn().mockReturnValue(true),
  STATUSES: { draft: 'draft', inProgress: 'inProgress', ideation: 'ideation', voting: 'voting' }
};
const mockDialogRef = { afterClosed: () => of(undefined) };
const mockDialogService = { open: vi.fn().mockReturnValue(mockDialogRef) };
const mockUploadService = { upload: vi.fn() };
const mockNotificationService = { showRaw: vi.fn() };
const mockMemberUserService = { loadItems: vi.fn() };
const mockInviteUserService = { loadItems: vi.fn() };
const mockDiscussionService = { get: vi.fn(), create: vi.fn(), update: vi.fn() };
const mockIdeationService = { get: vi.fn(), save: vi.fn(), update: vi.fn() };
const mockVoteService = { get: vi.fn(), save: vi.fn(), update: vi.fn() };

describe('TopicEditComponent', () => {
  let component: TopicEditComponent;

  beforeEach(() => {
    vi.clearAllMocks();
    mockTopicService.get.mockReturnValue(of(mockTopic));
    mockTopicService.canEditDescription.mockReturnValue(true);
    mockTopicService.canDelete.mockReturnValue(true);
    mockDialogService.open.mockReturnValue(mockDialogRef);
    mockTopicService.patch.mockReturnValue(of(mockTopic));
    mockUploadService.upload.mockReturnValue(of(null));
    mockMemberUserService.loadItems.mockReturnValue(of([]));
    mockInviteUserService.loadItems.mockReturnValue(of([]));
    mockDiscussionService.get.mockReturnValue(of({ id: 'disc-1', question: 'Q', deadline: null }));
    
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'topics/edit/:topicId', component: EmptyComponent },
          { path: 'topics/create/:topicId', component: EmptyComponent },
          { path: 'topics/:topicId', component: EmptyComponent }
        ]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => 'topic-1' } }
          }
        },
        { provide: TopicService, useValue: mockTopicService },
        { provide: UploadService, useValue: mockUploadService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: TopicMemberUserService, useValue: mockMemberUserService },
        { provide: TopicInviteUserService, useValue: mockInviteUserService },
        { provide: TopicDiscussionService, useValue: mockDiscussionService },
        { provide: TopicIdeationService, useValue: mockIdeationService },
        { provide: TopicVoteService, useValue: mockVoteService },
        { provide: DialogService, useValue: mockDialogService }
      ]
    });

    component = TestBed.runInInjectionContext(() => new TopicEditComponent());
  });

  it('should create and load topic', () => {
    component.ngOnInit();
    expect(mockTopicService.get).toHaveBeenCalledWith('topic-1');
    expect(component.topic().id).toBe('topic-1');
  });

  it('should redirect to create if topic is draft', () => {
    const draftTopic = { ...mockTopic, status: 'draft' };
    mockTopicService.get.mockReturnValue(of(draftTopic));
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');
    
    component.ngOnInit();
    expect(navigateSpy).toHaveBeenCalledWith(['/topics', 'create', 'topic-1'], expect.any(Object));
  });

  it('should save topic on publish', () => {
    component.topic.set(mockTopic);
    component.publishTopic();
    expect(mockTopicService.patch).toHaveBeenCalled();
  });

  it('should load ideation data if topic has ideationId', () => {
    const ideationTopic = { ...mockTopic, status: 'ideation', ideationId: 'ideation-1' };
    mockTopicService.get.mockReturnValue(of(ideationTopic));
    mockIdeationService.get.mockReturnValue(of({ id: 'ideation-1', question: 'IQ' }));
    
    component.ngOnInit();
    expect(mockIdeationService.get).toHaveBeenCalled();
    expect(component.steps().some(s => s.key === 'ideation')).toBe(true);
  });

  it('should load vote data if topic has voteId', () => {
    const voteTopic = { ...mockTopic, status: 'voting', voteId: 'vote-1' };
    mockTopicService.get.mockReturnValue(of(voteTopic));
    mockVoteService.get.mockReturnValue(of({ id: 'vote-1', description: 'VQ' }));

    component.ngOnInit();
    expect(mockVoteService.get).toHaveBeenCalled();
    expect(component.steps().some(s => s.key === 'voting')).toBe(true);
  });

  it('should open TopicSettingsLockedComponent when navigating to discussion if canEditDescription is false', () => {
    mockTopicService.canEditDescription.mockReturnValue(false);
    component.topic.set(mockTopic as unknown as Topic);
    component.onStepChange('discussion');
    expect(mockDialogService.open).toHaveBeenCalledWith(TopicSettingsLockedComponent);
  });

  it('should open TopicEditDisabledDialogComponent when navigating to info if canEditDescription is false', () => {
    mockTopicService.canEditDescription.mockReturnValue(false);
    component.topic.set(mockTopic as unknown as Topic);
    component.onStepChange('info');
    expect(mockDialogService.open).toHaveBeenCalledWith(TopicEditDisabledDialogComponent);
  });

  it('should open TopicSettingsDisabledDialogComponent when navigating to settings if canDelete is false', () => {
    mockTopicService.canDelete.mockReturnValue(false);
    component.topic.set(mockTopic as unknown as Topic);
    component.onStepChange('settings');
    expect(mockDialogService.open).toHaveBeenCalledWith(TopicSettingsDisabledDialogComponent);
  });
});
