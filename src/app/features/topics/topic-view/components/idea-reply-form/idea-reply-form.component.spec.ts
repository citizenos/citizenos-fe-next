import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IdeaReplyFormComponent } from './idea-reply-form.component';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TopicIdeationService } from '../../../../../core/services/topic-ideation.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { UserStore } from '../../../../../core/state/user.store';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Component, Input, ComponentRef } from '@angular/core';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

@Component({
  selector: 'cos-icon',
  standalone: true,
  template: ''
})
class MockIconComponent {
  @Input() name: string = '';
  @Input() size: number | string = 24;
}

describe('IdeaReplyFormComponent', () => {
  let mockIdeationService: any;
  let mockNotification: any;
  let mockUserStore: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockIdeationService = {
      COMMENT_TYPES_MAXLENGTH: { reply: 2048 },
      saveIdeaComment: vi.fn().mockReturnValue(of({ id: 'new-comment' })),
      updateIdeaComment: vi.fn().mockReturnValue(of({ id: 'updated-comment' }))
    };
    mockNotification = { success: vi.fn(), error: vi.fn() };
    mockUserStore = { isAuthenticated: vi.fn().mockReturnValue(true), user: vi.fn().mockReturnValue({ id: 'user1' }) };
    mockRouter = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [
        IdeaReplyFormComponent,
        TranslateModule.forRoot(),
        ReactiveFormsModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: TopicIdeationService, useValue: mockIdeationService },
        { provide: NotificationService, useValue: mockNotification },
        { provide: UserStore, useValue: mockUserStore },
        { provide: Router, useValue: mockRouter },
        {
          provide: ActivatedRoute,
          useValue: { queryParams: of({}) }
        }
      ]
    })
    .overrideComponent(IdeaReplyFormComponent, {
        remove: { imports: [IconComponent] },
        add: { imports: [MockIconComponent] }
    })
    .compileComponents();
  });

  const createComponent = async (inputs: any = {}) => {
    const fixture = TestBed.createComponent(IdeaReplyFormComponent);
    const component = fixture.componentInstance;
    const componentRef = fixture.componentRef;
    
    // Set required inputs
    component.topicId.set(inputs.topicId || 'topic1');
    component.ideationId.set(inputs.ideationId || 'ideation1');
    component.ideaId.set(inputs.ideaId || 'idea1');
    
    if (inputs.editMode !== undefined) component.editMode.set(inputs.editMode);
    if (inputs.argument) component.argument.set(inputs.argument);
    
    fixture.detectChanges();
    await fixture.whenStable();
    return { fixture, component, componentRef };
  };

  it('should create', async () => {
    const { component } = await createComponent();
    expect(component).toBeTruthy();
  });

  it('should validate form requirements', async () => {
    const { component } = await createComponent();
    const textControl = component.replyForm.get('text');
    textControl?.setValue('');
    expect(textControl?.valid).toBe(false);

    textControl?.setValue('A valid reply');
    expect(textControl?.valid).toBe(true);
  });

  it('should call saveIdeaComment on save when in post mode', async () => {
    const { component } = await createComponent();
    component.replyForm.get('text')?.setValue('Test reply');
    component.save();
    expect(mockIdeationService.saveIdeaComment).toHaveBeenCalled();
    expect(mockNotification.success).toHaveBeenCalled();
  });

  it('should call updateIdeaComment on save when in edit mode', async () => {
    const { component, fixture } = await createComponent({
        editMode: true,
        argument: { id: 'arg1', text: 'Old text' }
    });
    
    // Check if signals are actually set
    if (component.editMode() && component.argument()) {
        component.ngOnInit(); // Force it if effect didn't run
    }
    fixture.detectChanges();

    expect(component.replyForm.get('text')?.value).toBe('Old text');
    
    component.replyForm.get('text')?.setValue('Updated text');
    component.save();
    expect(mockIdeationService.updateIdeaComment).toHaveBeenCalled();
    expect(mockNotification.success).toHaveBeenCalled();
  });

  it('should handle service errors', async () => {
    const { component } = await createComponent();
    mockIdeationService.saveIdeaComment.mockReturnValue(throwError(() => ({ errors: { text: 'too long' } })));
    component.replyForm.get('text')?.setValue('Test reply');
    component.save();
    expect(component.errors()).toEqual({ text: 'too long' });
  });

  it('should emit showReplyChange on close', async () => {
    const { component } = await createComponent();
    const emitSpy = vi.spyOn(component.showReplyChange, 'emit');
    component.close();
    expect(emitSpy).toHaveBeenCalledWith(false);
  });
});
