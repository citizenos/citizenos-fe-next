import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IdeaReportComponent, IdeaReportData } from './idea-report.component';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TopicIdeationService } from '../../../../../core/services/topic-ideation.service';
import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';
import { DialogRef } from '../../../../../shared/dialog/dialog-ref';
import { of, throwError } from 'rxjs';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Component, Input } from '@angular/core';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { InitialsComponent } from '../../../../../shared/components/initials/initials.component';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { DropdownComponent } from '../../../../../shared/components/dropdown/dropdown.component';

@Component({
  selector: 'cos-initials',
  standalone: true,
  template: ''
})
class MockInitialsComponent {
  @Input() name: string = '';
}

@Component({
  selector: 'cos-icon',
  standalone: true,
  template: ''
})
class MockIconComponent {
  @Input() name: string = '';
}

@Component({
  selector: 'cos-input',
  standalone: true,
  template: '<ng-content></ng-content>'
})
class MockInputComponent {
  @Input() placeholder: string = '';
  @Input() hasError: boolean = false;
  @Input() errorMessage: string = '';
}

@Component({
  selector: 'cos-dropdown',
  standalone: true,
  template: '<ng-content select="[selection]"></ng-content><ng-content select="[options]"></ng-content>'
})
class MockDropdownComponent {}

describe('IdeaReportComponent', () => {
  let component: IdeaReportComponent;
  let fixture: ComponentFixture<IdeaReportComponent>;
  let mockIdeaService: any;
  let mockDialogRef: any;

  const mockData: IdeaReportData = {
    idea: { id: 'idea1', author: { name: 'Test User' } } as any,
    ideationId: 'ideation1',
    topicId: 'topic1'
  };

  beforeEach(async () => {
    mockIdeaService = {
      IDEA_REPORT_TYPES: { obscene: 'obscene', spam: 'spam' },
      reportIdea: vi.fn().mockReturnValue(of({}))
    };
    mockDialogRef = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [
        IdeaReportComponent,
        TranslateModule.forRoot(),
        ReactiveFormsModule,
        MockInitialsComponent,
        MockIconComponent,
        MockInputComponent,
        MockDropdownComponent
      ],
      providers: [
        { provide: TopicIdeationService, useValue: mockIdeaService },
        { provide: DialogRef, useValue: mockDialogRef },
        { provide: DIALOG_DATA, useValue: mockData }
      ]
    })
    .overrideComponent(IdeaReportComponent, {
      remove: {
        imports: [IconComponent, InitialsComponent, InputComponent, DropdownComponent]
      },
      add: {
        imports: [MockIconComponent, MockInitialsComponent, MockInputComponent, MockDropdownComponent]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(IdeaReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate form', () => {
    component.report.get('text')?.setValue('');
    expect(component.report.valid).toBe(false);

    component.report.get('text')?.setValue('Reporing text');
    expect(component.report.valid).toBe(true);
  });

  it('should call service on doReport', () => {
    component.report.get('text')?.setValue('Some text');
    component.doReport();
    expect(mockIdeaService.reportIdea).toHaveBeenCalled();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should handle error on doReport', () => {
    mockIdeaService.reportIdea.mockReturnValue(throwError(() => ({ errors: { text: 'error' } })));
    component.report.get('text')?.setValue('Some text');
    component.doReport();
    expect(component.errors()).toEqual({ text: 'error' });
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });
});
