import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArgumentReportComponent } from './argument-report.component';
import { TopicArgumentService } from '../../../../../core/services/topic-argument.service';
import { DIALOG_DATA, DialogRef } from '../../../../../shared/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { Component, Input, output } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';


@Component({ selector: 'cos-icon', standalone: true, template: '' })
class MockIconComponent { @Input() name = ''; @Input() size: string | number = 24; }

@Component({ selector: 'cos-button', standalone: true, template: '<button (click)="clicked.emit($event)"><ng-content></ng-content></button>' })
class MockButtonComponent {
  @Input() variant = 'primary';
  @Input() size = 'md';
  @Input() isDisabled = false;
  clicked = output<MouseEvent>();
}

@Component({ selector: 'cos-dropdown', standalone: true, template: '<ng-content select="[selection]"></ng-content><ng-content select="[options]"></ng-content>' })
class MockDropdownComponent {}

@Component({ selector: 'cos-initials', standalone: true, template: '' })
class MockInitialsComponent { @Input() name = ''; }

const MOCK_ARGUMENT = {
  id: 'arg1',
  discussionId: 'disc1',
  creator: { name: 'Test User', imageUrl: null }
};

describe('ArgumentReportComponent', () => {
  let component: ArgumentReportComponent;
  let fixture: ComponentFixture<ArgumentReportComponent>;

  const mockArgumentService = {
    ARGUMENT_REPORT_TYPES: { abuse: 'abuse', spam: 'spam', other: 'other' },
    report: vi.fn().mockReturnValue(of({}))
  };

  const mockDialogRef = { close: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [ArgumentReportComponent, TranslateModule.forRoot(), NoopAnimationsModule],
      providers: [
        { provide: DIALOG_DATA, useValue: { argument: { ...MOCK_ARGUMENT }, topicId: 'topic1' } },
        { provide: DialogRef, useValue: mockDialogRef },
        { provide: TopicArgumentService, useValue: mockArgumentService }
      ]
    })
    .overrideComponent(ArgumentReportComponent, {
      set: {
        imports: [
          TranslateModule,
          UpperCasePipe,
          ReactiveFormsModule,
          MockIconComponent,
          MockButtonComponent,
          MockDropdownComponent,
          MockInitialsComponent
        ]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArgumentReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should populate reportTypes from service', () => {
    expect(component.reportTypes).toEqual(['abuse', 'spam', 'other']);
  });

  it('should update form type on selectReportType', () => {
    component.selectReportType('spam');
    expect(component.reportForm.value.type).toBe('spam');
  });

  it('should not submit when form is invalid', () => {
    component.reportForm.patchValue({ text: '' });
    component.doReport();
    expect(mockArgumentService.report).not.toHaveBeenCalled();
  });

  it('should call report and close on valid submit', () => {
    component.reportForm.patchValue({ type: 'abuse', text: 'This is inappropriate content' });
    component.doReport();
    expect(mockArgumentService.report).toHaveBeenCalledWith({
      topicId: 'topic1',
      discussionId: 'disc1',
      commentId: 'arg1',
      type: 'abuse',
      text: 'This is inappropriate content'
    });
    expect(mockDialogRef.close).toHaveBeenCalledWith(true);
  });

  it('should close dialog on close()', () => {
    component.close();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });
});
