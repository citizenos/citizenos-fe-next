import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Component } from '@angular/core';
import { OverlayRef } from '@angular/cdk/overlay';
import { of } from 'rxjs';
import { DialogRef } from '../../../../../shared/dialog/dialog-ref';
import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';
import { TopicDiscussionService } from '../../../../../core/services/topic-discussion.service';
import { TopicService } from '../../../../../core/services/topic.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { EditDiscussionDeadlineComponent } from './edit-discussion-deadline.component';

@Component({ template: '', standalone: true })
class EmptyComponent {}

const mockOverlayRef = { dispose: () => {} } as unknown as OverlayRef;
const mockDiscussion = { id: 'disc-1', question: 'Q?', deadline: null as any };
const mockTopic = { id: 'topic-1', title: 'T', status: 'inProgress', categories: [] };

describe('EditDiscussionDeadlineComponent', () => {
  let component: EditDiscussionDeadlineComponent;
  const mockDiscussionService = { update: vi.fn() };
  const mockTopicService = { reloadTopic: vi.fn() };
  const mockNotificationService = { error: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        provideRouter([{ path: '**', component: EmptyComponent }]),
        { provide: DialogRef, useValue: new DialogRef(mockOverlayRef) },
        { provide: DIALOG_DATA, useValue: { discussion: mockDiscussion, topic: mockTopic } },
        { provide: TopicDiscussionService, useValue: mockDiscussionService },
        { provide: TopicService, useValue: mockTopicService },
        { provide: NotificationService, useValue: mockNotificationService },
      ]
    });
    component = TestBed.runInInjectionContext(() => new EditDiscussionDeadlineComponent());
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set isNew true when discussion has no deadline', () => {
    expect(component.isNew).toBe(true);
  });

  it('should set isNew false when discussion has a deadline', () => {
    TestBed.resetTestingModule();
    const discussionWithDeadline = { ...mockDiscussion, deadline: '2026-06-01T12:00:00Z' };
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        provideRouter([{ path: '**', component: EmptyComponent }]),
        { provide: DialogRef, useValue: new DialogRef(mockOverlayRef) },
        { provide: DIALOG_DATA, useValue: { discussion: discussionWithDeadline, topic: mockTopic } },
        { provide: TopicDiscussionService, useValue: mockDiscussionService },
        { provide: TopicService, useValue: mockTopicService },
        { provide: NotificationService, useValue: mockNotificationService },
      ]
    });
    const comp = TestBed.runInInjectionContext(() => new EditDiscussionDeadlineComponent());
    expect(comp.isNew).toBe(false);
  });

  it('should call discussionService.update on save', () => {
    mockDiscussionService.update.mockReturnValue(of({}));
    const date = new Date('2026-06-01');
    component.onDeadlineChange(date);
    component.save();
    expect(mockDiscussionService.update).toHaveBeenCalledWith('topic-1', 'disc-1', expect.any(Object));
  });
});
