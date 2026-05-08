import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { TopicReportReviewComponent } from './topic-report-review.component';
import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';
import { DialogRef } from '../../../../../shared/dialog/dialog-ref';
import { TopicReportService } from '../../../../../core/services/topic-report.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { Topic } from '../../../../../core/interfaces/topic';

@Component({ selector: 'cos-icon', standalone: true, template: '' })
class MockIconComponent { @Input() name = ''; @Input() size = 24; }
@Component({ selector: 'cos-button', standalone: true, template: '<ng-content></ng-content>' })
class MockButtonComponent { @Input() variant = ''; @Input() isDisabled = false; }

const MOCK_TOPIC: Topic = {
  id: 'topic-1', title: 'Test', intro: null, description: '', status: 'inProgress',
  visibility: 'public', hashtag: null, join: { token: '', level: '' }, categories: [],
  endsAt: null, createdAt: '2024-01-01', updatedAt: '2024-01-01',
  sourcePartnerId: null, sourcePartnerObjectId: null, permission: { level: 'admin' },
  creator: {}, lastActivity: null, country: null, language: null,
  members: { users: { count: 0 }, groups: { count: 0 } },
  voteId: null, discussionId: null, comments: null, padUrl: null,
  authors: [], imageUrl: null,
  report: { id: 'report-1', type: 'spam', text: null, moderatedReasonType: null, moderatedReasonText: null },
};

describe('TopicReportReviewComponent', () => {
  let component: TopicReportReviewComponent;
  let fixture: ComponentFixture<TopicReportReviewComponent>;
  const mockDialogRef = { close: vi.fn() };
  const mockTopicReportService = { review: vi.fn().mockReturnValue(of({})) };
  const mockNotificationService = { success: vi.fn(), error: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [TopicReportReviewComponent, TranslateModule.forRoot()],
      providers: [
        { provide: DIALOG_DATA, useValue: { topic: MOCK_TOPIC } },
        { provide: DialogRef, useValue: mockDialogRef },
        { provide: TopicReportService, useValue: mockTopicReportService },
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    })
      .overrideComponent(TopicReportReviewComponent, { set: { imports: [TranslateModule, ReactiveFormsModule, MockIconComponent, MockButtonComponent] } })
      .compileComponents();

    fixture = TestBed.createComponent(TopicReportReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should initialise topic from dialog data', () => {
    expect(component.topic().id).toBe('topic-1');
  });

  it('should have an invalid form when text is empty', () => {
    expect(component.reviewForm.invalid).toBe(true);
  });

  it('should have a valid form when text is provided', () => {
    component.reviewForm.patchValue({ text: 'Review comment' });
    expect(component.reviewForm.valid).toBe(true);
  });

  it('should render the textarea', () => {
    expect(fixture.nativeElement.querySelector('textarea')).toBeTruthy();
  });

  it('doReview() should not call service when form is invalid', () => {
    component.doReview();
    expect(mockTopicReportService.review).not.toHaveBeenCalled();
  });

  it('doReview() should call service and close on success', () => {
    component.reviewForm.patchValue({ text: 'A review note' });
    component.doReview();
    expect(mockTopicReportService.review).toHaveBeenCalledWith('topic-1', 'report-1', { text: 'A review note' });
    expect(mockNotificationService.success).toHaveBeenCalled();
    expect(mockDialogRef.close).toHaveBeenCalledWith(true);
  });

  it('doReview() should show error when service fails', () => {
    component.reviewForm.patchValue({ text: 'A review note' });
    mockTopicReportService.review.mockReturnValue(throwError(() => new Error('fail')));
    component.doReview();
    expect(mockNotificationService.error).toHaveBeenCalled();
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });

  it('close() should close the dialog', () => {
    component.close();
    expect(mockDialogRef.close).toHaveBeenCalledWith();
  });

  it('should not submit when isLoading is true', () => {
    component.reviewForm.patchValue({ text: 'note' });
    component.isLoading.set(true);
    component.doReview();
    expect(mockTopicReportService.review).not.toHaveBeenCalled();
  });
});
