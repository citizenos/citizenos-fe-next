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
import { MissingDiscussionComponent } from './missing-discussion.component';

@Component({ template: '', standalone: true })
class EmptyComponent {}

const mockOverlayRef = { dispose: () => {} } as unknown as OverlayRef;
const mockTopic = { id: 'topic-1', title: 'T', status: 'inProgress', categories: [], discussionId: undefined };

describe('MissingDiscussionComponent', () => {
  let component: MissingDiscussionComponent;
  const mockDiscussionService = { create: vi.fn(), update: vi.fn() };
  const mockTopicService = { reloadTopic: vi.fn(), canEdit: vi.fn().mockReturnValue(true), STATUSES: {} };

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        provideRouter([{ path: '**', component: EmptyComponent }]),
        { provide: DialogRef, useValue: new DialogRef(mockOverlayRef) },
        { provide: DIALOG_DATA, useValue: { topic: mockTopic } },
        { provide: TopicDiscussionService, useValue: mockDiscussionService },
        { provide: TopicService, useValue: mockTopicService },
      ]
    });
    component = TestBed.runInInjectionContext(() => new MissingDiscussionComponent());
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose topic from dialog data', () => {
    expect(component.topic.id).toBe('topic-1');
  });

  it('should call create when topic has no discussionId', () => {
    mockDiscussionService.create.mockReturnValue(of({ id: 'disc-1' }));
    component.question.set('Test question?');
    component.save();
    expect(mockDiscussionService.create).toHaveBeenCalledWith('topic-1', expect.any(Object));
  });

  it('should call update when topic has existing discussionId', () => {
    const topicWithDiscussion = { ...mockTopic, discussionId: 'disc-1' };
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        provideRouter([{ path: '**', component: EmptyComponent }]),
        { provide: DialogRef, useValue: new DialogRef(mockOverlayRef) },
        { provide: DIALOG_DATA, useValue: { topic: topicWithDiscussion } },
        { provide: TopicDiscussionService, useValue: mockDiscussionService },
        { provide: TopicService, useValue: mockTopicService },
      ]
    });
    const comp = TestBed.runInInjectionContext(() => new MissingDiscussionComponent());
    mockDiscussionService.update.mockReturnValue(of({ id: 'disc-1' }));
    comp.save();
    expect(mockDiscussionService.update).toHaveBeenCalled();
  });
});
