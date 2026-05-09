import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TopicReportReasonComponent } from './topic-report-reason.component';
import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';
import { DialogRef } from '../../../../../shared/dialog/dialog-ref';

@Component({ selector: 'cos-icon', standalone: true, template: '' })
class MockIconComponent { @Input() name = ''; @Input() size = 24; }

const MOCK_DATA = {
  report: { moderatedReasonType: 'spam', moderatedReasonText: 'This is spam content' }
};

describe('TopicReportReasonComponent', () => {
  let component: TopicReportReasonComponent;
  let fixture: ComponentFixture<TopicReportReasonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopicReportReasonComponent, TranslateModule.forRoot()],
      providers: [
        { provide: DIALOG_DATA, useValue: MOCK_DATA },
        { provide: DialogRef, useValue: { close: () => { return; } } },
      ],
    })
      .overrideComponent(TopicReportReasonComponent, { set: { imports: [TranslateModule, UpperCasePipe, MockIconComponent] } })
      .compileComponents();

    fixture = TestBed.createComponent(TopicReportReasonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose report data via data property', () => {
    expect(component.data.report.moderatedReasonType).toBe('spam');
    expect(component.data.report.moderatedReasonText).toBe('This is spam content');
  });

  it('should render the moderated reason text', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.explanation')?.textContent?.trim()).toBe('This is spam content');
  });

  it('should render the heading', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.title')).toBeTruthy();
  });

  it('should render a close button', () => {
    expect(fixture.nativeElement.querySelector('.btn_dialog_close')).toBeTruthy();
  });
});
