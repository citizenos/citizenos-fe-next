import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Component } from '@angular/core';
import { OverlayRef } from '@angular/cdk/overlay';
import { of, throwError } from 'rxjs';
import { DialogRef } from '../../../../../shared/dialog/dialog-ref';
import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';
import { TopicDiscussionService } from '../../../../../core/services/topic-discussion.service';
import { TopicService } from '../../../../../core/services/topic.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { TopicDiscussionCreateDialogComponent } from './topic-discussion-create-dialog.component';
import { Discussion } from '../../../../../core/interfaces/discussion';

@Component({ template: '', standalone: true })
class EmptyComponent {}

const _mockOverlayRef = { dispose: () => { return; } } as unknown as OverlayRef;
const mockTopic = { id: 'topic-1', title: 'T', status: 'inProgress', categories: [], discussionId: undefined };

describe('TopicDiscussionCreateDialogComponent', () => {
  let component: TopicDiscussionCreateDialogComponent;
  let mockDialogRef: { close: ReturnType<typeof vi.fn> };
  const mockDiscussionService = { create: vi.fn(), update: vi.fn() };
  const mockTopicService = {
    reloadTopic: vi.fn(),
    patch: vi.fn().mockReturnValue(of({})),
    STATUSES: { inProgress: 'inProgress', ideation: 'ideation' }
  };
  const mockNotificationService = {
    show: vi.fn(),
    showRaw: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
    clear: vi.fn(),
    dismiss: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockDialogRef = { close: vi.fn() };
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        provideRouter([{ path: '**', component: EmptyComponent }]),
        { provide: DialogRef, useValue: mockDialogRef },
        { provide: DIALOG_DATA, useValue: { topic: { ...mockTopic } } },
        { provide: TopicDiscussionService, useValue: mockDiscussionService },
        { provide: TopicService, useValue: mockTopicService },
        { provide: NotificationService, useValue: mockNotificationService },
      ]
    });
    component = TestBed.runInInjectionContext(() => new TopicDiscussionCreateDialogComponent());
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start on tab 1', () => {
    expect(component.activeTab()).toBe(1);
  });

  it('should navigate to tab 2', () => {
    component.selectTab(2);
    expect(component.activeTab()).toBe(2);
  });

  it('should have 2 tabs (Introduction and Settings)', () => {
    expect(component.tabs).toEqual([1, 2]);
  });

  it('should disable next on tab 2 when question is empty', () => {
    expect(component.isNextDisabled()).toBe(false);
    component.selectTab(2);
    expect(component.isNextDisabled()).toBe(true);
    component.question.set('How should we proceed?');
    expect(component.isNextDisabled()).toBe(false);
  });

  it('should disable next when isLoading is true', () => {
    component.selectTab(2);
    component.question.set('Valid question');
    expect(component.isNextDisabled()).toBe(false);
    component.isLoading.set(true);
    expect(component.isNextDisabled()).toBe(true);
  });

  it('should call create on save when no discussionId, set topic.discussionId, and close with discussion', () => {
    const createdDiscussion: Discussion = { id: 'disc-1', question: 'Q?', topicId: 'topic-1' } as unknown as Discussion;
    mockDiscussionService.create.mockReturnValue(of(createdDiscussion));
    component.question.set('Q?');
    component.save();

    expect(mockDiscussionService.create).toHaveBeenCalledWith('topic-1', expect.objectContaining({
      topicId: 'topic-1',
      question: 'Q?'
    }));
    expect(component.topic.discussionId).toBe('disc-1');
    expect(mockTopicService.reloadTopic).toHaveBeenCalled();
    expect(mockDialogRef.close).toHaveBeenCalledWith(createdDiscussion);
    expect(component.isLoading()).toBe(false);
  });

  it('should call update on save when topic already has discussionId', () => {
    const updatedDiscussion: Discussion = { id: 'disc-existing', question: 'Updated Q?', topicId: 'topic-1' } as unknown as Discussion;
    mockDiscussionService.update.mockReturnValue(of(updatedDiscussion));
    component.topic = { ...mockTopic, discussionId: 'disc-existing' } as unknown as typeof component.topic;
    component.question.set('Updated Q?');
    component.save();

    expect(mockDiscussionService.update).toHaveBeenCalledWith('topic-1', 'disc-existing', expect.objectContaining({
      topicId: 'topic-1',
      question: 'Updated Q?'
    }));
    expect(mockDialogRef.close).toHaveBeenCalledWith(updatedDiscussion);
  });

  it('should patch topic status to inProgress when saving from ideation status', () => {
    const createdDiscussion: Discussion = { id: 'disc-1', question: 'Q?', topicId: 'topic-1' } as unknown as Discussion;
    mockDiscussionService.create.mockReturnValue(of(createdDiscussion));
    component.topic = { ...mockTopic, status: 'ideation' } as unknown as typeof component.topic;
    component.question.set('Q?');
    component.save();

    expect(mockDiscussionService.create).toHaveBeenCalledWith('topic-1', expect.any(Object));
    expect(mockTopicService.patch).toHaveBeenCalledWith({ topicId: 'topic-1', status: 'inProgress' });
    expect(component.topic.status).toBe('inProgress');
    expect(component.topic.discussionId).toBe('disc-1');
    expect(mockTopicService.reloadTopic).toHaveBeenCalled();
    expect(mockDialogRef.close).toHaveBeenCalledWith(createdDiscussion);
  });

  it('should not patch topic status when topic status is already inProgress', () => {
    const createdDiscussion: Discussion = { id: 'disc-1', question: 'Q?', topicId: 'topic-1' } as unknown as Discussion;
    mockDiscussionService.create.mockReturnValue(of(createdDiscussion));
    component.topic = { ...mockTopic, status: 'inProgress' } as unknown as typeof component.topic;
    component.question.set('Q?');
    component.save();

    expect(mockTopicService.patch).not.toHaveBeenCalled();
    expect(mockDialogRef.close).toHaveBeenCalledWith(createdDiscussion);
  });

  it('should wait for reloadTopic if it returns an Observable before closing', () => {
    const createdDiscussion: Discussion = { id: 'disc-1', question: 'Q?', topicId: 'topic-1' } as unknown as Discussion;
    mockDiscussionService.create.mockReturnValue(of(createdDiscussion));
    mockTopicService.reloadTopic.mockReturnValue(of(void 0));
    component.question.set('Q?');
    component.save();

    expect(mockDialogRef.close).toHaveBeenCalledWith(createdDiscussion);
  });

  it('should handle error when discussionService.create fails: show notification, reset isLoading, keep dialog open', () => {
    mockDiscussionService.create.mockReturnValue(throwError(() => new Error('Server error')));
    component.question.set('Q?');
    component.save();

    expect(mockNotificationService.show).toHaveBeenCalledWith('error', 'MSG_ERROR_50000');
    expect(component.isLoading()).toBe(false);
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });

  it('should surface API error message key when provided in error response', () => {
    mockDiscussionService.create.mockReturnValue(throwError(() => ({
      error: { status: { message: 'MSG_ERROR_CUSTOM_DISCUSSION' } }
    })));
    component.question.set('Q?');
    component.save();

    expect(mockNotificationService.show).toHaveBeenCalledWith('error', 'MSG_ERROR_CUSTOM_DISCUSSION');
    expect(component.isLoading()).toBe(false);
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });

  it('should handle error when topicService.patch fails: show notification, reset isLoading, keep dialog open', () => {
    const createdDiscussion: Discussion = { id: 'disc-1', question: 'Q?', topicId: 'topic-1' } as unknown as Discussion;
    mockDiscussionService.create.mockReturnValue(of(createdDiscussion));
    mockTopicService.patch.mockReturnValue(throwError(() => new Error('Patch error')));
    component.topic = { ...mockTopic, status: 'ideation' } as unknown as typeof component.topic;
    component.question.set('Q?');
    component.save();

    expect(mockNotificationService.show).toHaveBeenCalledWith('error', 'MSG_ERROR_50000');
    expect(component.isLoading()).toBe(false);
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });
});
