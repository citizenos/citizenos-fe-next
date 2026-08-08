import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { VoteCreateDialogComponent } from './vote-create-dialog.component';
import { DIALOG_DATA, DialogRef } from '../../../shared/dialog';
import { TopicVoteService } from '../../../core/services/topic-vote.service';
import { NotificationService } from '../../../core/services/notification.service';
import { TopicService } from '../../../core/services/topic.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

const mockTopic = { id: 'topic-1', title: 'Test Topic', ideationId: null, discussionId: null };
const mockVoteService = { save: vi.fn() };
const mockNotification = { 
  success: vi.fn(), 
  error: vi.fn(),
  showRaw: vi.fn(),
  clear: vi.fn() 
};
const mockDialogRef = { close: vi.fn() };
const mockTranslate = { currentLang: 'en' };
const mockTopicService = { reloadTopic: vi.fn() };

describe('VoteCreateDialogComponent', () => {
  let component: VoteCreateDialogComponent;

  beforeEach(() => {
    vi.clearAllMocks();
    mockVoteService.save.mockReturnValue(of({ id: 'vote-1' }));

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        provideRouter([{ path: '**', redirectTo: '' }]),
        { provide: DIALOG_DATA, useValue: { topic: mockTopic } },
        { provide: DialogRef, useValue: mockDialogRef },
        { provide: TopicVoteService, useValue: mockVoteService },
        { provide: TopicService, useValue: mockTopicService },
        { provide: NotificationService, useValue: mockNotification },
        { provide: TranslateService, useValue: mockTranslate },
      ]
    });
    component = TestBed.runInInjectionContext(() => new VoteCreateDialogComponent());
  });

  it('should start on intro tab', () => {
    expect(component.tabActive()).toBe(1);
  });

  it('should default vote to regular type', () => {
    const v = component.vote();
    expect(v.type).toBe('regular');
  });

  it('should not proceed to next tab if question missing', () => {
    component.tabActive.set(2);
    expect(component.isNextDisabled()).toBe(true);
    component.tabNext();
    expect(component.tabActive()).toBe(2);
  });

  it('should proceed to next tab if question provided', () => {
    component.tabActive.set(2);
    component.updateVote('description', 'Test question?');
    expect(component.isNextDisabled()).toBe(false);
    component.tabNext();
    expect(component.tabActive()).toBe(3);
  });

  it('onSubmit should call voteService.save with topicId and description', () => {
    component.updateVote('description', 'Test question?');
    component.createVote();
    expect(mockVoteService.save).toHaveBeenCalledWith(expect.objectContaining({
      topicId: 'topic-1',
      description: 'Test question?',
      type: 'regular'
    }));
  });

  it('createVote should close dialog and show success on save', () => {
    component.updateVote('description', 'Test question?');
    component.createVote();
    expect(mockDialogRef.close).toHaveBeenCalledWith(true);
    expect(mockNotification.success).toHaveBeenCalled();
  });

  it('createVote should show error notification on failure', () => {
    mockVoteService.save.mockReturnValue(throwError(() => ({ errors: { msg: 'fail' } })));
    component.updateVote('description', 'Test question?');
    component.createVote();
    expect(mockNotification.showRaw).toHaveBeenCalledWith('error', 'fail');
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });
});
