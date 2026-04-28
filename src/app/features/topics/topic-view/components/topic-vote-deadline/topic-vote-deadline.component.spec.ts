import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { TopicVoteDeadlineComponent } from './topic-vote-deadline.component';
import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';
import { DialogRef } from '../../../../../shared/dialog/dialog-ref';
import { TopicVoteService } from '../../../../../core/services/topic-vote.service';
import { TopicService } from '../../../../../core/services/topic.service';
import { NotificationService } from '../../../../../core/services/notification.service';

const mockVote = { id: 'v1', endsAt: null, reminderTime: null };
const mockTopic = { id: 't1' };
const mockDialogRef = { close: vi.fn() };
const mockTopicVoteService = { update: vi.fn(), loadVote$: of(null) };
const mockTopicService = { reloadTopic: vi.fn() };
const mockNotification = { success: vi.fn(), error: vi.fn() };

describe('TopicVoteDeadlineComponent', () => {
  let component: TopicVoteDeadlineComponent;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        { provide: DIALOG_DATA, useValue: { vote: mockVote, topic: mockTopic } },
        { provide: DialogRef, useValue: mockDialogRef },
        { provide: TopicVoteService, useValue: mockTopicVoteService },
        { provide: TopicService, useValue: mockTopicService },
        { provide: NotificationService, useValue: mockNotification }
      ]
    });
    component = TestBed.runInInjectionContext(() => new TopicVoteDeadlineComponent());
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('isNew should be true when vote has no endsAt', () => {
    expect(component.isNew).toBe(true);
  });

  it('onDeadlineChange should update deadline signal', () => {
    const date = new Date('2026-12-31');
    component.onDeadlineChange(date);
    expect(component.deadline()).toEqual(date);
  });

  it('onReminderChange should update reminderTime signal', () => {
    const date = new Date('2026-11-01');
    component.onReminderChange(date);
    expect(component.reminderTime()).toEqual(date);
  });

  it('save should call topicVoteService.update with merged vote data', () => {
    mockTopicVoteService.update.mockReturnValue(of({}));
    const deadline = new Date('2026-12-31');
    component.onDeadlineChange(deadline);
    component.save();
    expect(mockTopicVoteService.update).toHaveBeenCalledWith(expect.objectContaining({
      id: 'v1',
      topicId: 't1',
      endsAt: deadline
    }));
  });

  it('save should reload topic and close dialog on success', () => {
    mockTopicVoteService.update.mockReturnValue(of({}));
    component.save();
    expect(mockTopicService.reloadTopic).toHaveBeenCalled();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('save should display error messages on failure', () => {
    mockTopicVoteService.update.mockReturnValue(throwError(() => ({ errors: { endsAt: 'Invalid date' } })));
    component.save();
    expect(mockNotification.error).toHaveBeenCalledWith('Invalid date');
  });
});
