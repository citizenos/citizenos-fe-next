import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArgumentReportModerateComponent } from './argument-report-moderate.component';
import { TopicArgumentService } from '../../../../../core/services/topic-argument.service';
import { DIALOG_DATA, DialogRef, DialogService } from '../../../../../shared/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { Component, Input } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({ selector: 'cos-input', standalone: true, template: '<ng-content></ng-content>' })
class MockInputComponent { @Input() placeholder = ''; }

const MOCK_ARGUMENT = { id: 'arg1', subject: 'Test subject', text: 'Test text' };
const MOCK_REPORT = { id: 'rep1', type: 'abuse', text: '', comment: MOCK_ARGUMENT };

const MOCK_DATA = {
  argument: MOCK_ARGUMENT,
  report: MOCK_REPORT,
  topicId: 'topic1',
  discussionId: 'disc1',
  commentId: 'arg1',
  token: 'tok123'
};

describe('ArgumentReportModerateComponent', () => {
  let component: ArgumentReportModerateComponent;
  let fixture: ComponentFixture<ArgumentReportModerateComponent>;

  const mockArgumentService = {
    ARGUMENT_REPORT_TYPES: { abuse: 'abuse', spam: 'spam', other: 'other' },
    moderate: vi.fn().mockReturnValue(of({}))
  };
  const mockDialogService = { closeAll: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [ArgumentReportModerateComponent, TranslateModule.forRoot()],
      providers: [
        { provide: DIALOG_DATA, useValue: { ...MOCK_DATA } },
        { provide: DialogRef, useValue: { close: vi.fn() } },
        { provide: DialogService, useValue: mockDialogService },
        { provide: TopicArgumentService, useValue: mockArgumentService }
      ]
    })
    .overrideComponent(ArgumentReportModerateComponent, {
      set: { imports: [UpperCasePipe, ReactiveFormsModule, TranslateModule, MockInputComponent] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArgumentReportModerateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should resolve argument from data.argument', () => {
    expect(component.argument?.id).toBe('arg1');
    expect(component.argument?.subject).toBe('Test subject');
  });

  it('should patch report form from data.report', () => {
    expect(component.report.value.type).toBe('abuse');
  });

  it('should populate reportTypes from service', () => {
    expect(component.reportTypes).toEqual(['abuse', 'spam', 'other']);
  });

  it('selectReportType updates form type', () => {
    component.selectReportType('spam');
    expect(component.report.value.type).toBe('spam');
  });

  it('should render argument subject when present', () => {
    const el: HTMLElement = fixture.nativeElement;
    const italic = el.querySelector('.delete_info_text.italic');
    expect(italic?.innerHTML).toContain('Test subject');
  });

  it('should not call moderate when form is invalid', () => {
    component.report.patchValue({ text: '' });
    component.doModerate();
    expect(mockArgumentService.moderate).not.toHaveBeenCalled();
  });

  it('should call moderate with correct data on valid submit', () => {
    component.report.patchValue({ type: 'abuse', text: 'This is abusive' });
    component.doModerate();
    expect(mockArgumentService.moderate).toHaveBeenCalledWith(expect.objectContaining({
      token: 'tok123',
      topicId: 'topic1',
      discussionId: 'disc1',
      reportId: 'rep1',
    }));
  });

  it('should close all dialogs on successful moderation', () => {
    component.report.patchValue({ type: 'abuse', text: 'violation' });
    component.doModerate();
    expect(mockDialogService.closeAll).toHaveBeenCalled();
  });

  it('should have a cancel link with dialogClose', () => {
    const el: HTMLElement = fixture.nativeElement;
    const cancel = el.querySelector('[dialogclose], [dialogClose]');
    expect(cancel).toBeTruthy();
  });
});
