import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { VoteCreateDialogComponent } from './vote-create-dialog.component';
import { DIALOG_DATA } from '../../../shared/dialog/dialog-tokens';
import { DialogRef } from '../../../shared/dialog/dialog-ref';
import { TopicVoteService } from '../../../core/services/topic-vote.service';
import { NotificationService } from '../../../core/services/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

const mockTopic = { id: 'topic-1', title: 'Test Topic', ideationId: null, discussionId: null };
const mockVoteService = { save: vi.fn() };
const mockNotification = { success: vi.fn(), showRaw: vi.fn() };
const mockDialogRef = { close: vi.fn() };
const mockTranslate = { currentLang: 'en' };

describe('VoteCreateDialogComponent', () => {
  let component: VoteCreateDialogComponent;

  beforeEach(() => {
    vi.clearAllMocks();
    mockVoteService.save.mockReturnValue(of({ id: 'vote-1' }));

    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: '**', redirectTo: '' }]),
        { provide: DIALOG_DATA, useValue: { topic: mockTopic } },
        { provide: DialogRef, useValue: mockDialogRef },
        { provide: TopicVoteService, useValue: mockVoteService },
        { provide: NotificationService, useValue: mockNotification },
        { provide: TranslateService, useValue: mockTranslate },
      ]
    });
    component = TestBed.runInInjectionContext(() => new VoteCreateDialogComponent());
  });

  it('should start on intro step', () => {
    expect(component.currentStep()).toBe('intro');
  });

  it('should default vote to regular type with Yes/No options', () => {
    const v = component.vote();
    expect(v.type).toBe('regular');
    expect(v.options).toEqual([{ value: 'Yes' }, { value: 'No' }]);
  });

  it('goToStep should switch steps', () => {
    component.goToStep('settings');
    expect(component.currentStep()).toBe('settings');
    component.goToStep('intro');
    expect(component.currentStep()).toBe('intro');
  });

  it('onVoteUpdate should merge updates', () => {
    component.onVoteUpdate({ question: 'Should we do this?' });
    expect(component.vote().question).toBe('Should we do this?');
  });

  it('onSubmit should call voteService.save with topicId and description', () => {
    component.onVoteUpdate({ question: 'Test question?' });
    component.onSubmit();
    expect(mockVoteService.save).toHaveBeenCalledWith(expect.objectContaining({
      topicId: 'topic-1',
      description: 'Test question?',
    }));
  });

  it('onSubmit should close dialog and show success on save', () => {
    component.onSubmit();
    expect(mockDialogRef.close).toHaveBeenCalledWith(true);
    expect(mockNotification.success).toHaveBeenCalled();
  });

  it('onSubmit should show error notification on failure', () => {
    mockVoteService.save.mockReturnValue(throwError(() => new Error('fail')));
    component.onSubmit();
    expect(mockNotification.showRaw).toHaveBeenCalled();
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });
});
