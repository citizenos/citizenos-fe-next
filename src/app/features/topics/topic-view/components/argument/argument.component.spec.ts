import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ArgumentComponent } from './argument.component';
import { TopicArgumentService } from '../../../../../core/services/topic-argument.service';
import { UserStore } from '../../../../../core/state/user.store';
import { NotificationService } from '../../../../../core/services/notification.service';
import { DialogService } from '../../../../../shared/dialog/dialog.service';
import { DomSanitizer } from '@angular/platform-browser';
import { of } from 'rxjs';
import { signal } from '@angular/core';
import { Argument } from '../../../../../core/interfaces/discussion';

const mockArgument: Argument = {
  id: 'arg-1',
  type: 'pro',
  subject: 'This is good',
  text: '<p>Body text</p>',
  creator: { id: 'u1', name: 'Alice' },
  votes: { up: { count: 2, selected: false }, down: { count: 0, selected: false }, count: 2 },
  replies: { rows: [], count: 0 },
  edits: { '0': { subject: 'This is good', text: '<p>Body text</p>', createdAt: '2024-01-01' } },
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
    (component as unknown as { argument: unknown }).argument = signal({ ...mockArgument });
    (component as unknown as { topicId: unknown }).topicId = signal('topic-1');
    (component as unknown as { discussionId: unknown }).discussionId = signal('disc-1');
    (component as unknown as { root: unknown }).root = signal(null);
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
});
