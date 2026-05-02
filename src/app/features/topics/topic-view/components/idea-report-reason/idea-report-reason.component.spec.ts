import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IdeaReportReasonComponent, IdeaReportReasonData } from './idea-report-reason.component';
import { TranslateModule } from '@ngx-translate/core';
import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';
import { DialogRef } from '../../../../../shared/dialog/dialog-ref';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Component, Input } from '@angular/core';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';

@Component({
  selector: 'cos-icon',
  standalone: true,
  template: ''
})
class MockIconComponent {
  @Input() name = '';
  @Input() size: any;
}

describe('IdeaReportReasonComponent', () => {
  let component: IdeaReportReasonComponent;
  let fixture: ComponentFixture<IdeaReportReasonComponent>;

  const mockData: IdeaReportReasonData = {
    report: {
      moderatedReasonType: 'spam',
      moderatedReasonText: 'This is spam content'
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        IdeaReportReasonComponent,
        TranslateModule.forRoot(),
        MockIconComponent
      ],
      providers: [
        { provide: DialogRef, useValue: { close: vi.fn() } },
        { provide: DIALOG_DATA, useValue: mockData }
      ]
    })
    .overrideComponent(IdeaReportReasonComponent, {
      remove: { imports: [IconComponent] },
      add: { imports: [MockIconComponent] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(IdeaReportReasonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the moderation reason and text', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.reason')?.textContent).toContain('TXT_MODERATION_TYPES_SPAM');
    expect(compiled.querySelector('.explanation')?.textContent).toContain('This is spam content');
  });
});
