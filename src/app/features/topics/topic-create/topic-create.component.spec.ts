import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Component } from '@angular/core';

@Component({ template: '', standalone: true })
class EmptyComponent {}
import { TopicService } from '../../../core/services/topic.service';
import { UploadService } from '../../../core/services/upload.service';
import { NotificationService } from '../../../core/services/notification.service';
import { TopicMemberUserService } from '../../../core/services/topic-member-user.service';
import { TopicInviteUserService } from '../../../core/services/topic-invite-user.service';
import { TopicDiscussionService } from '../../../core/services/topic-discussion.service';
import { TopicCreateComponent } from './topic-create.component';
import { of } from 'rxjs';

const mockTopic = { id: 'new-id', title: '', visibility: 'private', status: 'draft', categories: [] };
const mockTopicService = { save: vi.fn(), patch: vi.fn() };
const mockUploadService = { upload: vi.fn() };
const mockNotificationService = { showRaw: vi.fn(), success: vi.fn() };
const mockMemberUserService = { loadItems: vi.fn() };
const mockInviteUserService = { loadItems: vi.fn() };
const mockDiscussionService = { get: vi.fn(), create: vi.fn(), update: vi.fn() };

function setupProviders() {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([{ path: 'topics/:id', component: EmptyComponent }]),
      { provide: TopicService, useValue: mockTopicService },
      { provide: UploadService, useValue: mockUploadService },
      { provide: NotificationService, useValue: mockNotificationService },
      { provide: TopicMemberUserService, useValue: mockMemberUserService },
      { provide: TopicInviteUserService, useValue: mockInviteUserService },
      { provide: TopicDiscussionService, useValue: mockDiscussionService }
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
    mockMemberUserService.loadItems.mockReturnValue(of([]));
    mockInviteUserService.loadItems.mockReturnValue(of([]));
    mockDiscussionService.create.mockReturnValue(of({ id: 'disc-1', question: '', deadline: null }));
    mockDiscussionService.update.mockReturnValue(of({ id: 'disc-1', question: '', deadline: null }));
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

  it('transitionToSettings creates topic if none exists', () => {
    component.onTopicUpdate({ title: 'Test' });
    component.transitionToSettings();
    expect(mockTopicService.save).toHaveBeenCalled();
  });

  it('transitionToSettings skips save if topic already has id', () => {
    component.topic.set({ id: 'existing-id', title: 'Test' });
    component.transitionToSettings();
    expect(mockTopicService.save).not.toHaveBeenCalled();
    expect(component.currentStep()).toBe('settings');
  });

  it('saveAsDraft calls save and shows success notification', () => {
    component.topic.set({ title: 'Draft Topic' });
    component.saveAsDraft();
    expect(mockTopicService.save).toHaveBeenCalled();
    expect(mockNotificationService.showRaw).toHaveBeenCalledWith('success', expect.any(String));
  });

  it('publishTopic calls patch with status inProgress when topic has id', () => {
    component.topic.set({ title: 'New Topic', id: 'topic-1' });
    component.publishTopic();
    expect(mockTopicService.patch).toHaveBeenCalledWith(expect.objectContaining({ status: 'inProgress' }));
  });
});
