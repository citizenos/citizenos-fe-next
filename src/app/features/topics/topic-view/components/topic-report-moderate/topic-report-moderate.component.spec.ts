import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { UpperCasePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { TopicReportModerateComponent } from './topic-report-moderate.component';
import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';
import { DialogRef } from '../../../../../shared/dialog/dialog-ref';
import { TopicReportService } from '../../../../../core/services/topic-report.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { Topic } from '../../../../../core/interfaces/topic';

@Component({ selector: 'cos-icon', standalone: true, template: '' })
class MockIconComponent { @Input() name = ''; @Input() size = 24; }
@Component({ selector: 'cos-button', standalone: true, template: '<ng-content></ng-content>' })
class MockButtonComponent { @Input() variant = ''; @Input() isDisabled = false; }
@Component({ selector: 'cos-dropdown', standalone: true, template: '' })
class MockDropdownComponent {}

const MOCK_TOPIC: Topic = {
  id: 'topic-1', title: 'Test', intro: null, description: '', status: 'inProgress',
  visibility: 'public', hashtag: null, join: { token: '', level: '' }, categories: [],
  endsAt: null, createdAt: '2024-01-01', updatedAt: '2024-01-01',
  sourcePartnerId: null, sourcePartnerObjectId: null, permission: { level: 'admin' },
  creator: { id: '', name: '' }, lastActivity: null, country: null, language: null,
  members: { users: { count: 0 }, groups: { count: 0 } },
  voteId: null, discussionId: null, comments: null, padUrl: null, authors: [], imageUrl: null,
  report: { id: 'report-1', type: 'spam', text: null, moderatedReasonType: null, moderatedReasonText: null },
};

describe('TopicReportModerateComponent', () => {
  let component: TopicReportModerateComponent;
  let fixture: ComponentFixture<TopicReportModerateComponent>;
  const mockDialogRef = { close: vi.fn() };
  const mockTopicReportService: Partial<TopicReportService> = {
    moderate: vi.fn().mockReturnValue(of({})),
    TYPES: { spam: 'SPAM', duplicate: 'DUPLICATE', abuse: 'ABUSE', hate: 'HATE', other: 'OTHER', obscene: 'OBSCENE' },
  };
  const mockNotificationService: Partial<NotificationService> = { success: vi.fn(), error: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [TopicReportModerateComponent, TranslateModule.forRoot()],
      providers: [
        { provide: DIALOG_DATA, useValue: { topic: MOCK_TOPIC } },
        { provide: DialogRef, useValue: mockDialogRef },
        { provide: TopicReportService, useValue: mockTopicReportService },
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    })
      .overrideComponent(TopicReportModerateComponent, {
        set: { imports: [TranslateModule, ReactiveFormsModule, UpperCasePipe, MockIconComponent, MockButtonComponent, MockDropdownComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(TopicReportModerateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should expose report types from service', () => {
    expect(component.reportTypes).toEqual(['spam', 'inappropriate']);
  });

  it('should have invalid form when text is empty', () => {
    expect(component.moderateForm.invalid).toBe(true);
  });

  it('changeType() should update form type', () => {
    component.changeType('inappropriate');
    expect(component.moderateForm.value.type).toBe('inappropriate');
  });

  it('doModerate() should not call service when form is invalid', () => {
    component.doModerate();
    expect(mockTopicReportService.moderate).not.toHaveBeenCalled();
  });

  it('doModerate() should call service and close on success', () => {
    component.moderateForm.patchValue({ type: 'spam', text: 'moderation reason' });
    component.doModerate();
    expect(mockTopicReportService.moderate).toHaveBeenCalledWith('topic-1', 'report-1', { type: 'spam', text: 'moderation reason' });
    expect(mockNotificationService.success).toHaveBeenCalled();
    expect(mockDialogRef.close).toHaveBeenCalledWith(true);
  });

  it('doModerate() should show error when service fails', () => {
    component.moderateForm.patchValue({ type: 'spam', text: 'reason' });
    (mockTopicReportService.moderate as ReturnType<typeof vi.fn>).mockReturnValue(throwError(() => new Error('error')));
    component.doModerate();
    expect(mockNotificationService.error).toHaveBeenCalled();
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });

  it('close() should close dialog', () => {
    component.close();
    expect(mockDialogRef.close).toHaveBeenCalledWith();
  });

  it('should not submit when isLoading is true', () => {
    component.moderateForm.patchValue({ type: 'spam', text: 'reason' });
    component.isLoading.set(true);
    component.doModerate();
    expect(mockTopicReportService.moderate).not.toHaveBeenCalled();
  });
});
