import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { EditIdeationDeadlineComponent } from './edit-ideation-deadline.component';
import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';
import { DialogRef } from '../../../../../shared/dialog/dialog-ref';
import { TopicIdeationService } from '../../../../../core/services/topic-ideation.service';
import { TopicService } from '../../../../../core/services/topic.service';
import { NotificationService } from '../../../../../core/services/notification.service';

const mockIdeation = { id: 'i1', deadline: null };
const mockTopic = { id: 't1' };
const mockDialogRef = { close: vi.fn() };
const mockTopicIdeationService = { update: vi.fn() };
const mockTopicService = { reloadTopic: vi.fn() };
const mockNotification = { success: vi.fn(), error: vi.fn() };

describe('EditIdeationDeadlineComponent', () => {
  let component: EditIdeationDeadlineComponent;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        { provide: DIALOG_DATA, useValue: { ideation: mockIdeation, topic: mockTopic } },
        { provide: DialogRef, useValue: mockDialogRef },
        { provide: TopicIdeationService, useValue: mockTopicIdeationService },
        { provide: TopicService, useValue: mockTopicService },
        { provide: NotificationService, useValue: mockNotification }
      ]
    });
    component = TestBed.runInInjectionContext(() => new EditIdeationDeadlineComponent());
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize deadline signal with null when ideation.deadline is null', () => {
    expect(component.deadline()).toBeNull();
  });

  it('onDeadlineChange should update deadline signal', () => {
    const date = new Date('2026-12-31');
    component.onDeadlineChange(date);
    expect(component.deadline()).toEqual(date);
  });

  it('save should call ideationService.update with correct data', () => {
    mockTopicIdeationService.update.mockReturnValue(of({}));
    const deadline = new Date('2026-12-31');
    component.onDeadlineChange(deadline);
    component.save();
    expect(mockTopicIdeationService.update).toHaveBeenCalledWith({
      topicId: 't1',
      ideationId: 'i1',
      deadline: deadline
    });
  });

  it('save should reload topic and close dialog on success', () => {
    mockTopicIdeationService.update.mockReturnValue(of({}));
    component.save();
    expect(mockTopicService.reloadTopic).toHaveBeenCalled();
    expect(mockDialogRef.close).toHaveBeenCalledWith(true);
  });

  it('save should display error messages on failure', () => {
    mockTopicIdeationService.update.mockReturnValue(throwError(() => ({ errors: { deadline: 'Invalid date' } })));
    component.save();
    expect(mockNotification.error).toHaveBeenCalledWith('Invalid date');
    expect(component.loading()).toBe(false);
  });
});
