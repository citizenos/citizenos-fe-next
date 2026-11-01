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
import { TopicDiscussionCreateDialogComponent } from './topic-discussion-create-dialog.component';

@Component({ template: '', standalone: true })
class EmptyComponent {}

const _mockOverlayRef = { dispose: () => { return; } } as unknown as OverlayRef;
const mockTopic = { id: 'topic-1', title: 'T', status: 'inProgress', categories: [], discussionId: undefined };

describe('TopicDiscussionCreateDialogComponent', () => {
  let component: TopicDiscussionCreateDialogComponent;
  const mockDiscussionService = { create: vi.fn(), update: vi.fn() };
  const mockTopicService = {
    reloadTopic: vi.fn(),
    patch: vi.fn().mockReturnValue(of({})),
    STATUSES: { inProgress: 'inProgress', ideation: 'ideation' }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        provideRouter([{ path: '**', component: EmptyComponent }]),
        { provide: DialogRef, useValue: { close: vi.fn() } },
        { provide: DIALOG_DATA, useValue: { topic: mockTopic } },
        { provide: TopicDiscussionService, useValue: mockDiscussionService },
        { provide: TopicService, useValue: mockTopicService },
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

  it('should call create on save when no discussionId', () => {
    mockDiscussionService.create.mockReturnValue(of({ id: 'disc-1' }));
    component.question.set('Q?');
    component.save();
    expect(mockDiscussionService.create).toHaveBeenCalledWith('topic-1', expect.any(Object));
  });

  it('should patch topic status to inProgress when saving from ideation status', () => {
    mockDiscussionService.create.mockReturnValue(of({ id: 'disc-1' }));
    component.topic = { ...mockTopic, status: 'ideation' } as unknown as typeof component.topic;
    component.question.set('Q?');
    component.save();
    expect(mockDiscussionService.create).toHaveBeenCalledWith('topic-1', expect.any(Object));
    expect(mockTopicService.patch).toHaveBeenCalledWith({ topicId: 'topic-1', status: 'inProgress' });
    expect(mockTopicService.reloadTopic).toHaveBeenCalled();
  });
});
