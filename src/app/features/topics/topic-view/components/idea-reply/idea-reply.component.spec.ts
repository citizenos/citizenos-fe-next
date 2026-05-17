import { TestBed } from '@angular/core/testing';
import { IdeaReplyComponent } from './idea-reply.component';
import { TranslateModule } from '@ngx-translate/core';
import { TopicIdeationService } from '../../../../../core/services/topic-ideation.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { UserStore } from '../../../../../core/state/user.store';
import { DialogService } from '../../../../../shared/dialog/dialog.service';
import { of } from 'rxjs';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Component, Input, NO_ERRORS_SCHEMA } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { IdeaComment } from '../../../../../core/interfaces/ideation';

@Component({ selector: 'cos-icon', standalone: true, template: '' })
class MockIconComponent {
  @Input() name = '';
  @Input() size = 24;
}

describe('IdeaReplyComponent', () => {
  let mockIdeationService: Partial<TopicIdeationService>;
  let mockNotification: Partial<NotificationService>;
  let mockUserStore: Record<string, unknown>;
  let mockDialog: Partial<DialogService>;
  let mockSanitizer: Partial<DomSanitizer>;
  let mockRouter: Partial<Router>;

  beforeEach(async () => {
    mockIdeationService = {
      deleteIdeaComment: vi.fn().mockReturnValue(of({})),
      voteIdeaComment: vi.fn().mockReturnValue(of({ up: { count: 1 }, down: { count: 0 } })),
      reportIdeaComment: vi.fn()
    };
    mockNotification = { success: vi.fn(), error: vi.fn() };
    mockUserStore = { isAuthenticated: vi.fn().mockReturnValue(true), user: vi.fn().mockReturnValue({ id: 'user1' }) };
    mockDialog = { open: vi.fn().mockReturnValue({ afterClosed: () => of(true) }) };
    mockSanitizer = {
      bypassSecurityTrustHtml: (val: string) => val,
      sanitize: (_ctx: unknown, val: string | null) => val || ''
    };
    mockRouter = { url: '/test' };

    await TestBed.configureTestingModule({
      imports: [
        IdeaReplyComponent,
        TranslateModule.forRoot(),
        MockIconComponent
      ],
      providers: [
        provideAnimationsAsync(),
        { provide: TopicIdeationService, useValue: mockIdeationService },
        { provide: NotificationService, useValue: mockNotification },
        { provide: UserStore, useValue: mockUserStore },
        { provide: DialogService, useValue: mockDialog },
        { provide: DomSanitizer, useValue: mockSanitizer },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: { queryParams: of({}) } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(IdeaReplyComponent, {
      remove: { imports: [IconComponent] },
      add: { imports: [MockIconComponent] }
    })
    .compileComponents();
  });

  const createComponent = (inputs: { argument?: Partial<IdeaComment> } = {}) => {
    const fixture = TestBed.createComponent(IdeaReplyComponent);
    const component = fixture.componentInstance;
    const componentRef = fixture.componentRef;

    component.argument.set((inputs.argument || { id: 'arg1', creator: { id: 'c1', name: 'Test Author' }, text: 'Test text', votes: { up: { count: 0 } } }) as IdeaComment);
    component.topicId.set('topic1');
    component.ideationId.set('ideation1');
    component.ideaId.set('idea1');

    fixture.detectChanges();
    return { fixture, component, componentRef };
  };

  it('should create', () => {
    const { component } = createComponent();
    expect(component).toBeTruthy();
  });

  it.skip('should show edit form when toggleEdit is called', () => {
    const { component, fixture } = createComponent();
    expect(component.showEdit()).toBe(false);
    component.toggleEdit();
    expect(component.showEdit()).toBe(true);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-idea-reply-form')).toBeTruthy();
  });

  it('should call vote service when doArgumentVote is called', () => {
    const { component } = createComponent();
    component.doArgumentVote(1);
    expect(mockIdeationService.voteIdeaComment).toHaveBeenCalled();
  });

  it('should show delete confirmation dialog', () => {
    const { component } = createComponent();
    component.doShowDeleteArgument();
    expect(mockDialog.open).toHaveBeenCalled();
    expect(mockIdeationService.deleteIdeaComment).toHaveBeenCalled();
  });
});
