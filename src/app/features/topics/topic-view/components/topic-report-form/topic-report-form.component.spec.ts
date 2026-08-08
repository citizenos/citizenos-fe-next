import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { UpperCasePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { TopicReportFormComponent } from './topic-report-form.component';
import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';
import { DialogRef } from '../../../../../shared/dialog/dialog-ref';
import { TopicReportService } from '../../../../../core/services/topic-report.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { Topic } from '../../../../../core/interfaces/topic';
import { FormRoot, FormField } from '@angular/forms/signals';
import { DialogCloseDirective } from 'src/app/shared/dialog/dialog-ref';

@Component({ selector: 'cos-icon', standalone: true, template: '' })
class MockIconComponent { @Input() name = ''; @Input() size = 24; }
@Component({ selector: 'cos-button', standalone: true, template: '<ng-content></ng-content>' })
class MockButtonComponent { @Input() variant = ''; @Input() isDisabled = false; }
@Component({ selector: 'cos-dropdown', standalone: true, template: '' })
class MockDropdownComponent { @Input() items: { value: string; label?: string }[] = []; }

const MOCK_TOPIC: Topic = {
  id: 'topic-1', title: 'Test', intro: null, description: '', status: 'inProgress',
  visibility: 'public', hashtag: null, join: { token: '', level: '' }, categories: [],
  endsAt: null, createdAt: '2024-01-01', updatedAt: '2024-01-01',
  sourcePartnerId: null, sourcePartnerObjectId: null, permission: { level: 'read' },
  creator: { id: '', name: '' }, lastActivity: null, country: null, language: null,
  members: { users: { count: 0 }, groups: { count: 0 } },
  voteId: null, discussionId: null, comments: null, padUrl: null, authors: [], imageUrl: null,
};

const MOCK_TYPES = { spam: 'SPAM', inappropriate: 'INAPPROPRIATE' };

describe('TopicReportFormComponent', () => {
  let component: TopicReportFormComponent;
  let fixture: ComponentFixture<TopicReportFormComponent>;
  const mockDialogRef = { close: vi.fn() };
  const mockTopicReportService = {
    save: vi.fn().mockReturnValue(of({})),
    TYPES: MOCK_TYPES,
  };
  const mockNotificationService = { success: vi.fn(), error: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [TopicReportFormComponent, TranslateModule.forRoot()],
      providers: [
        { provide: DIALOG_DATA, useValue: { topic: MOCK_TOPIC } },
        { provide: DialogRef, useValue: mockDialogRef },
        { provide: TopicReportService, useValue: mockTopicReportService },
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    })
      .overrideComponent(TopicReportFormComponent, {
        set: { imports: [TranslateModule, FormRoot, FormField, UpperCasePipe, MockIconComponent, MockButtonComponent, MockDropdownComponent, DialogCloseDirective] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(TopicReportFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should expose report types from service', () => {
    expect(component.reportTypes).toEqual(Object.keys(MOCK_TYPES));
  });

  it('should initialise form with first report type', () => {
    expect(component.reportForm().value().type).toBe('spam');
  });

  it('should have invalid form when text is empty', () => {
    expect(component.reportForm().invalid()).toBe(true);
  });

  it('changeType() should update form type', () => {
    component.changeType('inappropriate');
    fixture.detectChanges();
    TestBed.flushEffects();
    expect(component.reportForm().value().type).toBe('inappropriate');
  });

  it('doReport() should not call service when form is invalid', () => {
    component.doReport();
    expect(mockTopicReportService.save).not.toHaveBeenCalled();
  });

  it('doReport() should call service and close on success', () => {
    component.reportModel.update(m => ({ ...m, text: 'This is spam' }));
    fixture.detectChanges();
    TestBed.flushEffects();
    component.doReport();
    expect(mockTopicReportService.save).toHaveBeenCalledWith({
      topicId: 'topic-1', type: 'spam', text: 'This is spam',
    });
    expect(mockNotificationService.success).toHaveBeenCalled();
    expect(mockDialogRef.close).toHaveBeenCalledWith(true);
  });

  it('doReport() should show error when service fails', () => {
    component.reportModel.update(m => ({ ...m, text: 'content' }));
    fixture.detectChanges();
    TestBed.flushEffects();
    mockTopicReportService.save.mockReturnValue(throwError(() => new Error('fail')));
    component.doReport();
    expect(mockNotificationService.error).toHaveBeenCalled();
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });

  it('close() should close dialog', () => {
    component.close();
    expect(mockDialogRef.close).toHaveBeenCalledWith();
  });

  it('should not submit when isLoading is true', () => {
    component.reportModel.update(m => ({ ...m, text: 'content' }));
    fixture.detectChanges();
    TestBed.flushEffects();
    component.isLoading.set(true);
    component.doReport();
    expect(mockTopicReportService.save).not.toHaveBeenCalled();
  });
});
