import { DialogCloseDirective } from '../../../../../shared/dialog/dialog-ref';
import { UpperCasePipe } from '@angular/common';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IdeaReportReasonComponent, IdeaReportReasonData } from './idea-report-reason.component';
import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';
import { DialogRef } from '../../../../../shared/dialog/dialog-ref';

const mockData: IdeaReportReasonData = {
  report: { moderatedReasonType: 'spam', moderatedReasonText: 'This is spam content' },
};

describe('IdeaReportReasonComponent', () => {
  let component: IdeaReportReasonComponent;
  let fixture: ComponentFixture<IdeaReportReasonComponent>;
  const mockDialogRef = { close: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [IdeaReportReasonComponent, TranslateModule.forRoot()],
      providers: [
        { provide: DialogRef, useValue: mockDialogRef },
        { provide: DIALOG_DATA, useValue: mockData },
      ],
    })
      .overrideComponent(IdeaReportReasonComponent, { set: { imports: [TranslateModule, IconComponent, UpperCasePipe, DialogCloseDirective] } })
      .compileComponents();

    fixture = TestBed.createComponent(IdeaReportReasonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should expose report data from DIALOG_DATA', () => {
    expect(component.data.report.moderatedReasonType).toBe('spam');
  });

  it('should render the heading element', () => {
    const heading = fixture.nativeElement.querySelector('h4.title');
    expect(heading).toBeTruthy();
  });

  it('should display the moderation reason type (uppercase)', () => {
    expect(fixture.nativeElement.querySelector('.reason')?.textContent).toContain('TXT_MODERATION_TYPES_SPAM');
  });

  it('should display the moderation reason text', () => {
    expect(fixture.nativeElement.querySelector('.explanation')?.textContent).toContain('This is spam content');
  });

  it('should have a close button that closes the dialog', () => {
    const closeBtn = fixture.nativeElement.querySelector('button[dialogClose]') as HTMLElement;
    expect(closeBtn).toBeTruthy();
    closeBtn.click();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });
});
