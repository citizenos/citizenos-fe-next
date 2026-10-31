import { TestBed } from '@angular/core/testing';
import { IdeaReplyComponent } from './idea-reply.component';
import { TranslateModule } from '@ngx-translate/core';
import { TopicIdeationService } from '../../../../../core/services/topic-ideation.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { UserStore } from '../../../../../core/state/user.store';
import { DialogService } from '../../../../../shared/dialog/dialog.service';
import { of } from 'rxjs';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { IdeaComment } from '../../../../../core/interfaces/ideation';

interface MockArgument extends Partial<IdeaComment> {
  parent?: {
    id?: string;
    author?: { name?: string };
    creator?: { name?: string };
  };
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
      COMMENT_TYPES_MAXLENGTH: { reply: 2048 } as { [key: string]: number; reply: number },
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
        TranslateModule.forRoot()
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
    }).compileComponents();
  });

  const createComponent = (inputs: { argument?: MockArgument; canReply?: boolean } = {}) => {
    const fixture = TestBed.createComponent(IdeaReplyComponent);
    const component = fixture.componentInstance;
    const componentRef = fixture.componentRef;

    component.argument.set((inputs.argument || {
      id: 'arg1',
      creator: { id: 'user1', name: 'Test Author' },
      text: 'Test text',
      votes: { up: { count: 0 } }
    }) as IdeaComment);
    component.topicId.set('topic1');
    component.ideationId.set('ideation1');
    component.ideaId.set('idea1');
    if (inputs.canReply !== undefined) {
      componentRef.setInput('canReply', inputs.canReply);
    }

    fixture.detectChanges();
    return { fixture, component, componentRef };
  };

  it('should create', () => {
    const { component } = createComponent();
    expect(component).toBeTruthy();
  });

  it('should show edit form when toggleEdit is called', () => {
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

  it('should toggle mobileActions when toggleMobileActions is called', () => {
    const { component } = createComponent();
    expect(component.mobileActions()).toBe(false);

    component.toggleMobileActions();
    expect(component.mobileActions()).toBe(true);

    component.toggleMobileActions();
    expect(component.mobileActions()).toBe(false);
  });

  it('should render mobile actions bottom sheet and overlay when mobileActions is true', () => {
    const { component, fixture } = createComponent();
    component.mobileActions.set(true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.overlay')).toBeTruthy();
    expect(compiled.querySelector('.mobile_actions_wrap')).toBeTruthy();
  });

  it('should close mobile actions when close button or overlay is clicked', () => {
    const { component, fixture } = createComponent();
    component.mobileActions.set(true);
    fixture.detectChanges();

    const overlay = fixture.nativeElement.querySelector('.overlay') as HTMLElement;
    overlay.click();
    expect(component.mobileActions()).toBe(false);

    component.mobileActions.set(true);
    fixture.detectChanges();

    const closeBtn = fixture.nativeElement.querySelector('.btn_small_close') as HTMLElement;
    closeBtn.click();
    expect(component.mobileActions()).toBe(false);
  });

  it('should trigger mobile edit action and close mobileActions', () => {
    const { component, fixture } = createComponent();
    component.mobileActions.set(true);
    fixture.detectChanges();

    const editBtn = fixture.nativeElement.querySelector('.btn_edit_reply') as HTMLElement;
    expect(editBtn).toBeTruthy();
    editBtn.click();

    expect(component.showEdit()).toBe(true);
    expect(component.mobileActions()).toBe(false);
  });

  it('should trigger mobile copy-link action and close mobileActions', () => {
    const { component, fixture } = createComponent();
    const copySpy = vi.spyOn(component, 'copyReplyLink');
    component.mobileActions.set(true);
    fixture.detectChanges();

    const copyBtn = fixture.nativeElement.querySelector('.btn_copy_link') as HTMLElement;
    expect(copyBtn).toBeTruthy();
    copyBtn.click();

    expect(copySpy).toHaveBeenCalled();
    expect(component.mobileActions()).toBe(false);
  });

  it('should trigger mobile report action and close mobileActions', () => {
    const { component, fixture } = createComponent();
    const reportSpy = vi.spyOn(component, 'doShowReportOverlay');
    component.mobileActions.set(true);
    fixture.detectChanges();

    const reportBtn = fixture.nativeElement.querySelector('.btn_report_reply') as HTMLElement;
    expect(reportBtn).toBeTruthy();
    reportBtn.click();

    expect(reportSpy).toHaveBeenCalled();
    expect(component.mobileActions()).toBe(false);
  });

  it('should trigger mobile delete action and close mobileActions', () => {
    const { component, fixture } = createComponent();
    const deleteSpy = vi.spyOn(component, 'doShowDeleteArgument');
    component.mobileActions.set(true);
    fixture.detectChanges();

    const deleteBtn = fixture.nativeElement.querySelector('.btn_delete_reply') as HTMLElement;
    expect(deleteBtn).toBeTruthy();
    deleteBtn.click();

    expect(deleteSpy).toHaveBeenCalled();
    expect(component.mobileActions()).toBe(false);
  });

  it('should evaluate canEditReply() and canDeleteReply() correctly based on creator', () => {
    const { component } = createComponent({
      argument: {
        id: 'arg1',
        creator: { id: 'user1', name: 'User 1' }
      }
    });

    expect(component.canEditReply()).toBe(true);
    expect(component.canDeleteReply()).toBe(true);

    component.argument.set({
      id: 'arg2',
      creator: { id: 'other_user', name: 'Other' }
    } as IdeaComment);

    expect(component.canEditReply()).toBe(false);
    expect(component.canDeleteReply()).toBe(false);
  });

  it('should render bold recipient mention prefix when replying to a parent author', () => {
    const { fixture } = createComponent({
      argument: {
        id: 'reply1',
        creator: { id: 'user1', name: 'User 1' },
        text: 'This is my reply text',
        parent: { author: { name: 'Margo Loor' } }
      }
    });

    const compiled = fixture.nativeElement as HTMLElement;
    const recipientEl = compiled.querySelector('strong.recipient_mention');
    expect(recipientEl).toBeTruthy();
    expect(recipientEl?.textContent).toContain('Margo Loor');
  });

  it('should not render recipient mention when argument has no parent author', () => {
    const { fixture } = createComponent({
      argument: {
        id: 'reply1',
        creator: { id: 'user1', name: 'User 1' },
        text: 'Top level comment'
      }
    });

    const compiled = fixture.nativeElement as HTMLElement;
    const recipientEl = compiled.querySelector('strong.recipient_mention');
    expect(recipientEl).toBeNull();
  });

  it('should render reply button with btn_reply_argument class when canReply is true', () => {
    const { fixture } = createComponent({ canReply: true });

    const compiled = fixture.nativeElement as HTMLElement;
    const replyBtn = compiled.querySelector('.btn_reply_argument') as HTMLElement;
    expect(replyBtn).toBeTruthy();
  });
});
