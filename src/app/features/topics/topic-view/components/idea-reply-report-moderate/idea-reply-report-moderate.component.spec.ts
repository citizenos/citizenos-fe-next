import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { IdeaReplyReportModerateComponent } from './idea-reply-report-moderate.component';
import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';
import { DialogRef } from '../../../../../shared/dialog/dialog-ref';
import { TopicIdeationService } from '../../../../../core/services/topic-ideation.service';

@Component({ selector: 'cos-dropdown', template: '', standalone: true })
class CosDropdownStub {}

const mockArgument = { id: 'comment1', subject: 'Test subject', text: 'Test text' };
const mockReport = { id: 'report1', type: 'spam', text: 'Spam content' };

const mockDialogData = {
  argument: mockArgument,
  report: mockReport,
  topicId: 'topic1',
  ideationId: 'ideation1',
  ideaId: 'idea1',
  commentId: 'comment1',
  reportId: 'report1',
  token: 'test-token'
};

const mockIdeationService = {
  COMMENT_REPORT_TYPES: { abuse: 'abuse', obscene: 'obscene', spam: 'spam', hate: 'hate', duplicate: 'duplicate', other: 'other' },
  moderateIdeaComment: vi.fn().mockReturnValue(of({}))
};

const mockDialogRef = { close: vi.fn() };

describe('IdeaReplyReportModerateComponent', () => {
  let component: IdeaReplyReportModerateComponent;
  let fixture: ComponentFixture<IdeaReplyReportModerateComponent>;

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [IdeaReplyReportModerateComponent, TranslateModule.forRoot()],
      providers: [
        { provide: DIALOG_DATA, useValue: mockDialogData },
        { provide: DialogRef, useValue: mockDialogRef },
        { provide: TopicIdeationService, useValue: mockIdeationService },
        provideRouter([{ path: '**', component: IdeaReplyReportModerateComponent }])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(IdeaReplyReportModerateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders without error', () => {
    expect(component).toBeTruthy();
  });

  it('shows heading', () => {
    const heading = fixture.nativeElement.querySelector('.title');
    expect(heading).toBeTruthy();
    expect(heading.getAttribute('translate')).toBe('COMPONENTS.IDEA_REPLY_REPORT_MODERATE.HEADING');
  });

  it('shows argument subject when set', () => {
    const subject = fixture.nativeElement.querySelector('.delete_info_text.italic');
    expect(subject).toBeTruthy();
  });

  it('hides argument subject when null', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [IdeaReplyReportModerateComponent, TranslateModule.forRoot()],
      providers: [
        { provide: DIALOG_DATA, useValue: { ...mockDialogData, argument: { id: 'c1', subject: null, text: null }, report: mockReport } },
        { provide: DialogRef, useValue: mockDialogRef },
        { provide: TopicIdeationService, useValue: mockIdeationService },
        provideRouter([{ path: '**', component: IdeaReplyReportModerateComponent }])
      ]
    }).compileComponents();
    const f = TestBed.createComponent(IdeaReplyReportModerateComponent);
    f.detectChanges();
    expect(f.nativeElement.querySelector('.delete_info_text.italic')).toBeNull();
  });

  it('pre-populates form type from report data', () => {
    expect(component.report.get('type')?.value).toBe('spam');
  });

  it('pre-populates form text from report data', () => {
    expect(component.report.get('text')?.value).toBe('Spam content');
  });

  it('selectReportType() updates form type value', () => {
    component.selectReportType('abuse');
    expect(component.report.get('type')?.value).toBe('abuse');
  });

  it('submit button is disabled when form text is empty', () => {
    component.report.get('text')?.setValue('');
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('.btn_big_submit');
    expect(button.disabled).toBeTruthy();
  });

  it('submit button is enabled when form is valid', () => {
    component.report.get('text')?.setValue('Valid reason text');
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('.btn_big_submit');
    expect(button.disabled).toBeFalsy();
  });

  it('doModerate() calls moderateIdeaComment with correct params', () => {
    component.report.get('text')?.setValue('Valid reason');
    component.doModerate();
    expect(mockIdeationService.moderateIdeaComment).toHaveBeenCalledWith(
      expect.objectContaining({
        topicId: 'topic1',
        ideationId: 'ideation1',
        ideaId: 'idea1',
        reportId: 'report1',
        token: 'test-token'
      })
    );
  });

  it('doModerate() calls dialogRef.close(true) on success', () => {
    component.report.get('text')?.setValue('Valid reason');
    component.doModerate();
    expect(mockDialogRef.close).toHaveBeenCalledWith(true);
  });

  it('shows error label when text is touched and empty', () => {
    component.report.get('text')?.setValue('');
    component.report.get('text')?.markAsTouched();
    fixture.detectChanges();
    const errorLabel = fixture.nativeElement.querySelector('.error_label');
    expect(errorLabel).toBeTruthy();
  });

  it('hides error label when text is not touched', () => {
    component.report.get('text')?.setValue('');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.error_label')).toBeNull();
  });
});
