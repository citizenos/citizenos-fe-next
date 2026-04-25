import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ArgumentComponent } from './argument.component';
import { TopicArgumentService } from '../../../../../core/services/topic-argument.service';
import { UserStore } from '../../../../../core/state/user.store';
import { NotificationService } from '../../../../../core/services/notification.service';
import { DialogService } from '../../../../../shared/dialog/dialog.service';
import { DomSanitizer } from '@angular/platform-browser';
import { of } from 'rxjs';

const mockArgument = {
  id: 'arg-1',
  type: 'pro',
  subject: 'This is good',
  text: '<p>Body text</p>',
  creator: { id: 'u1', name: 'Alice' },
  votes: { up: { count: 2, selected: false }, down: { count: 0, selected: false } },
  replies: { rows: [], count: 0 },
  edits: [{}],
  createdAt: '2024-01-01',
  deletedAt: null,
};

const mockArgumentService = { vote: vi.fn(), save: vi.fn(), update: vi.fn(), delete: vi.fn() };
const mockUserStore = { isAuthenticated: vi.fn(() => true), user: vi.fn(() => ({ id: 'u1' })) };
const mockNotification = { success: vi.fn(), showRaw: vi.fn() };
const mockDialog = { open: vi.fn(() => ({ afterClosed: () => of(true) })) };
const mockSanitizer = { bypassSecurityTrustHtml: vi.fn(v => v) };

describe('ArgumentComponent', () => {
  let component: ArgumentComponent;

  beforeEach(() => {
    vi.clearAllMocks();
    mockArgumentService.vote.mockReturnValue(of({ up: { count: 3, selected: true }, down: { count: 0, selected: false } }));
    mockArgumentService.save.mockReturnValue(of({ id: 'reply-1' }));
    mockArgumentService.update.mockReturnValue(of({ ...mockArgument, subject: 'Updated' }));
    mockArgumentService.delete.mockReturnValue(of({}));

    TestBed.configureTestingModule({
      providers: [
        { provide: TopicArgumentService, useValue: mockArgumentService },
        { provide: UserStore, useValue: mockUserStore },
        { provide: NotificationService, useValue: mockNotification },
        { provide: DialogService, useValue: mockDialog },
        { provide: DomSanitizer, useValue: mockSanitizer },
      ]
    });

    component = TestBed.runInInjectionContext(() => new ArgumentComponent());
    component.argument = () => ({ ...mockArgument });
    component.topicId = () => 'topic-1';
    component.discussionId = () => 'disc-1';
    component.root = () => null;
    component.ngOnInit();
  });

  it('should initialise edit signals from argument', () => {
    expect(component.editSubject()).toBe('This is good');
    expect(component.editText()).toBe('<p>Body text</p>');
  });

  it('argumentId should combine id and version', () => {
    expect(component.argumentId()).toBe('arg-1_v0');
  });

  it('isEdited returns false for single-edit argument', () => {
    expect(component.isEdited()).toBe(false);
  });

  it('canEdit returns true when user is owner and not deleted', () => {
    expect(component.canEdit()).toBe(true);
  });

  it('canEdit returns false when user is not owner', () => {
    mockUserStore.user.mockReturnValue({ id: 'other-user' });
    expect(component.canEdit()).toBe(false);
  });

  it('vote should call argumentService.vote', () => {
    component.vote(1);
    expect(mockArgumentService.vote).toHaveBeenCalledWith(expect.objectContaining({ value: 1, commentId: 'arg-1' }));
  });

  it('vote should not call service when not authenticated', () => {
    mockUserStore.isAuthenticated.mockReturnValue(false);
    component.vote(1);
    expect(mockArgumentService.vote).not.toHaveBeenCalled();
  });

  it('doDelete should open confirm dialog and call delete on confirm', () => {
    const deletedEmit = vi.spyOn(component.deleted, 'emit');
    component.doDelete();
    expect(mockDialog.open).toHaveBeenCalled();
    expect(mockArgumentService.delete).toHaveBeenCalled();
    expect(deletedEmit).toHaveBeenCalled();
  });

  it('postReply should call save and emit deleted for parent reload', () => {
    const deletedEmit = vi.spyOn(component.deleted, 'emit');
    component.replyText.set('My reply');
    component.postReply();
    expect(mockArgumentService.save).toHaveBeenCalledWith(expect.objectContaining({ type: 'reply' }));
    expect(deletedEmit).toHaveBeenCalled();
  });

  it('postReply should do nothing when text is empty', () => {
    component.replyText.set('  ');
    component.postReply();
    expect(mockArgumentService.save).not.toHaveBeenCalled();
  });
});
