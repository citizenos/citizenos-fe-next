import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArgumentReplyComponent } from './argument-reply.component';
import { TopicArgumentService } from '../../../../../core/services/topic-argument.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { UserStore } from '../../../../../core/state/user.store';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Component, signal } from '@angular/core';

@Component({ template: '' })
class EmptyComponent {}

const MOCK_ARGUMENT = {
  id: 'arg1',
  discussionId: 'disc1',
  type: 'pro',
  edits: { '0': {}, '1': {} }
};

describe('ArgumentReplyComponent', () => {
  let component: ArgumentReplyComponent;
  let fixture: ComponentFixture<ArgumentReplyComponent>;

  const mockArgumentService = {
    ARGUMENT_TYPES_MAXLENGTH: { reply: 2048 },
    save: vi.fn().mockReturnValue(of({ id: 'new-reply-id' }))
  };
  const mockNotification = { error: vi.fn() };
  const isAuthenticated = signal(true);
  const mockUserStore = { isAuthenticated };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [ArgumentReplyComponent, TranslateModule.forRoot()],
      providers: [
        provideRouter([{ path: '**', component: EmptyComponent }]),
        { provide: TopicArgumentService, useValue: mockArgumentService },
        { provide: NotificationService, useValue: mockNotification },
        { provide: UserStore, useValue: mockUserStore }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ArgumentReplyComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('argument', { ...MOCK_ARGUMENT });
    fixture.componentRef.setInput('topicId', 'topic1');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the form when user is authenticated', () => {
    const el: HTMLElement = fixture.nativeElement;
    const form = el.querySelector('form');
    expect(form).toBeTruthy();
  });

  it('should not show the form when user is not authenticated', async () => {
    isAuthenticated.set(false);
    fixture.detectChanges();
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    const form = el.querySelector('form');
    expect(form).toBeFalsy();
    isAuthenticated.set(true);
  });

  it('should show error notification when text is empty and saveReply is called', () => {
    component.saveReply();
    expect(mockNotification.error).toHaveBeenCalledWith('COMPONENTS.ARGUMENT_REPLY.ERROR_NO_TEXT');
    expect(mockArgumentService.save).not.toHaveBeenCalled();
  });

  it('should call save with correct data when text is provided', () => {
    component.replyText.set('This is my reply');
    component.saveReply();
    expect(mockArgumentService.save).toHaveBeenCalledWith(expect.objectContaining({
      parentId: 'arg1',
      type: 'reply',
      discussionId: 'disc1',
      text: 'This is my reply',
      topicId: 'topic1'
    }));
  });

  it('should compute parentVersion from edits keys', () => {
    component.replyText.set('reply');
    component.saveReply();
    const callArg = mockArgumentService.save.mock.calls[0][0];
    expect(callArg.parentVersion).toBe(1); // 2 edits - 1
  });

  it('should emit false on close', () => {
    const spy = vi.fn();
    component.showReplyChange.subscribe(spy);
    component.close();
    expect(spy).toHaveBeenCalledWith(false);
  });

  it('should render cancel button', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.close_button')).toBeTruthy();
  });

  it('should render submit button', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.btn_medium_submit')).toBeTruthy();
  });

  it('should set errors signal on API error', () => {
    mockArgumentService.save.mockReturnValue(throwError(() => ({ errors: { text: 'Too long' } })));
    component.replyText.set('reply');
    component.saveReply();
    expect(component.errors()).toEqual({ text: 'Too long' });
  });

  it('should show error label when errors.text is set', async () => {
    component.errors.set({ text: 'COMPONENTS.ARGUMENT_REPLY.ERROR_NO_TEXT' });
    fixture.detectChanges();
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.error_label')).toBeTruthy();
  });
});
