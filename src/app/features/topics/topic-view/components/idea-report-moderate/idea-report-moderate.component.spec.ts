import { TestBed } from '@angular/core/testing';
import { Component, Directive, Input } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { of } from 'rxjs';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { IdeaReportModerateComponent } from './idea-report-moderate.component';
import { DIALOG_DATA, DialogService } from '../../../../../shared/dialog';
import { TopicIdeationService } from '../../../../../core/services/topic-ideation.service';

@Component({ selector: 'cos-input', template: '<ng-content/>', standalone: true })
class InputStub { @Input() placeholder?: string; }

@Directive({ selector: '[cosDropdown]', standalone: true })
class CosDropdownStub {}

// eslint-disable-next-line @angular-eslint/directive-selector
@Directive({ selector: '[dialogClose]', standalone: true })
class DialogCloseStub { @Input() dialogClose: unknown; }

const mockData = {
  idea: { id: 'idea1', statement: 'Test idea statement', description: null },
  report: { id: 'report1', type: 'spam', text: '', idea: null },
  topicId: 'topic1',
  ideationId: 'ideation1',
  ideaId: 'idea1',
  token: 'tok123'
};

describe('IdeaReportModerateComponent', () => {
  let fixture: ComponentFixture<IdeaReportModerateComponent>;
  let component: IdeaReportModerateComponent;
  let ideationService: Partial<TopicIdeationService> & { IDEA_REPORT_TYPES: Record<string, string> };
  let dialogService: Partial<DialogService>;

  beforeEach(async () => {
    ideationService = {
      IDEA_REPORT_TYPES: { obscene: 'obscene', spam: 'spam', hate: 'hate', duplicate: 'duplicate', other: 'other' },
      moderateIdea: vi.fn().mockReturnValue(of({}))
    };
    dialogService = { closeAll: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [IdeaReportModerateComponent, ReactiveFormsModule, TranslateModule.forRoot()],
      providers: [
        { provide: DIALOG_DATA, useValue: mockData },
        { provide: TopicIdeationService, useValue: ideationService },
        { provide: DialogService, useValue: dialogService }
      ]
    }).overrideComponent(IdeaReportModerateComponent, {
      set: { imports: [UpperCasePipe, ReactiveFormsModule, TranslateModule, InputStub, CosDropdownStub, DialogCloseStub] }
    }).compileComponents();

    fixture = TestBed.createComponent(IdeaReportModerateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders without error', () => {
    expect(component).toBeTruthy();
  });

  it('populates report types from ideation service', () => {
    expect(component.reportTypes).toEqual(['obscene', 'spam', 'hate', 'duplicate', 'other']);
  });

  it('patches form with report data', () => {
    expect(component.report.value.type).toBe('spam');
  });

  it('shows idea statement when present', () => {
    const el = fixture.nativeElement.querySelector('.delete_info_text.italic');
    expect(el?.innerHTML).toContain('Test idea statement');
  });

  it('selectReportType updates form control', () => {
    component.selectReportType('hate');
    expect(component.report.value.type).toBe('hate');
  });

  it('does not submit when form is invalid', () => {
    component.report.patchValue({ text: '' });
    component.doModerate();
    expect(ideationService.moderateIdea).not.toHaveBeenCalled();
  });

  it('calls moderateIdea and closes dialog on valid submit', () => {
    component.report.patchValue({ type: 'spam', text: 'This is spam content' });
    component.doModerate();
    expect(ideationService.moderateIdea).toHaveBeenCalledWith(
      expect.objectContaining({ topicId: 'topic1', ideationId: 'ideation1', token: 'tok123' })
    );
    expect(dialogService.closeAll).toHaveBeenCalled();
  });
});
