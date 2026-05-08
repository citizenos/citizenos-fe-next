import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { TopicInviteDialogComponent } from './topic-invite-dialog.component';
import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';
import { DialogRef } from '../../../../../shared/dialog/dialog-ref';
import { TopicService } from '../../../../../core/services/topic.service';
import { TopicInviteUserService } from '../../../../../core/services/topic-invite-user.service';
import { SearchService } from '../../../../../core/services/search.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { Topic } from '../../../../../core/interfaces/topic';

const MOCK_TOPIC: Topic = {
  id: 'topic-1', title: 'Test', intro: null, description: '', status: 'inProgress',
  visibility: 'public', hashtag: null, join: { token: '', level: '' }, categories: [],
  endsAt: null, createdAt: '2024-01-01', updatedAt: '2024-01-01',
  sourcePartnerId: null, sourcePartnerObjectId: null, permission: { level: 'admin' },
  creator: {}, lastActivity: null, country: null, language: null,
  members: { users: { count: 0 }, groups: { count: 0 } },
  voteId: null, discussionId: null, comments: null, padUrl: null, authors: [], imageUrl: null,
};

const MOCK_USER = { id: 'u1', name: 'Alice', email: 'alice@example.com' };

describe('TopicInviteDialogComponent', () => {
  let component: TopicInviteDialogComponent;
  let fixture: ComponentFixture<TopicInviteDialogComponent>;
  const mockDialogRef = { close: vi.fn() };
  const mockTopicService = {
    LEVELS: { read: 1, edit: 2, admin: 3 },
    canUpdate: vi.fn().mockReturnValue(true),
  };
  const mockTopicInviteUserService = { save: vi.fn().mockReturnValue(of({})) };
  const mockSearchService = {
    searchUsers: vi.fn().mockReturnValue(of({ results: { public: { users: { count: 1, rows: [MOCK_USER] } } } })),
  };
  const mockNotificationService = { success: vi.fn(), error: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [TopicInviteDialogComponent, TranslateModule.forRoot()],
      providers: [
        { provide: DIALOG_DATA, useValue: { topic: MOCK_TOPIC } },
        { provide: DialogRef, useValue: mockDialogRef },
        { provide: TopicService, useValue: mockTopicService },
        { provide: TopicInviteUserService, useValue: mockTopicInviteUserService },
        { provide: SearchService, useValue: mockSearchService },
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    })
      .overrideComponent(TopicInviteDialogComponent, { set: { schemas: [NO_ERRORS_SCHEMA] } })
      .compileComponents();

    fixture = TestBed.createComponent(TopicInviteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should initialise topic from dialog data', () => {
    expect(component.topic().id).toBe('topic-1');
  });

  it('should default to invite tab', () => {
    expect(component.activeTab()).toBe('invite');
  });

  describe('when data.tab is share', () => {
    let f2: ComponentFixture<TopicInviteDialogComponent>;

    beforeEach(async () => {
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [TopicInviteDialogComponent, TranslateModule.forRoot()],
        providers: [
          { provide: DIALOG_DATA, useValue: { topic: MOCK_TOPIC, tab: 'share' } },
          { provide: DialogRef, useValue: mockDialogRef },
          { provide: TopicService, useValue: mockTopicService },
          { provide: TopicInviteUserService, useValue: mockTopicInviteUserService },
          { provide: SearchService, useValue: mockSearchService },
          { provide: NotificationService, useValue: mockNotificationService },
        ],
      })
        .overrideComponent(TopicInviteDialogComponent, { set: { schemas: [NO_ERRORS_SCHEMA] } })
        .compileComponents();
      f2 = TestBed.createComponent(TopicInviteDialogComponent);
      f2.detectChanges();
    });

    it('should switch to share tab', () => {
      expect(f2.componentInstance.activeTab()).toBe('share');
    });
  });

  it('should start with empty searchResults', () => {
    expect(component.searchResults()).toEqual([]);
  });

  it('onSearchChange() should not search for strings < 2 chars', () => {
    component.onSearchChange('a');
    expect(mockSearchService.searchUsers).not.toHaveBeenCalled();
  });

  it('onSearchChange() should search for strings >= 2 chars', () => {
    component.onSearchChange('al');
    expect(mockSearchService.searchUsers).toHaveBeenCalledWith('al');
    expect(component.searchResults()).toEqual([MOCK_USER]);
  });

  it('onSearchChange() with empty string clears results', () => {
    component.searchResults.set([MOCK_USER]);
    component.onSearchChange('');
    expect(component.searchResults()).toEqual([]);
  });

  it('addMember() adds member to selectedMembers', () => {
    component.addMember(MOCK_USER);
    expect(component.selectedMembers()).toHaveLength(1);
    expect(component.selectedMembers()[0].id).toBe('u1');
  });

  it('addMember() does not add duplicate members', () => {
    component.addMember(MOCK_USER);
    component.addMember(MOCK_USER);
    expect(component.selectedMembers()).toHaveLength(1);
  });

  it('addMember() assigns the current globalLevel to the member', () => {
    component.globalLevel.set('edit');
    component.addMember(MOCK_USER);
    expect(component.selectedMembers()[0].level).toBe('edit');
  });

  it('removeMember() removes a member from selectedMembers', () => {
    component.addMember(MOCK_USER);
    const member = component.selectedMembers()[0];
    component.removeMember(member);
    expect(component.selectedMembers()).toHaveLength(0);
  });

  it('updateAllLevels() updates globalLevel and all member levels', () => {
    component.addMember(MOCK_USER);
    component.updateAllLevels('admin');
    expect(component.globalLevel()).toBe('admin');
    expect(component.selectedMembers()[0].level).toBe('admin');
  });

  it('addMembersFromInput() should add valid email addresses', () => {
    component.searchString.set('test@example.com');
    component.addMembersFromInput();
    expect(component.selectedMembers()).toHaveLength(1);
    expect(component.selectedMembers()[0].email).toBe('test@example.com');
  });

  it('addMembersFromInput() should ignore invalid emails', () => {
    component.searchString.set('not-an-email');
    component.addMembersFromInput();
    expect(component.selectedMembers()).toHaveLength(0);
  });

  it('doInvite() should not call service when no members selected', () => {
    component.doInvite();
    expect(mockTopicInviteUserService.save).not.toHaveBeenCalled();
  });

  it('doInvite() should call service and close dialog on success', () => {
    component.addMember(MOCK_USER);
    component.doInvite();
    expect(mockTopicInviteUserService.save).toHaveBeenCalledWith('topic-1', expect.arrayContaining([
      expect.objectContaining({ userId: 'u1', email: 'alice@example.com' })
    ]));
    expect(mockNotificationService.success).toHaveBeenCalled();
    expect(mockDialogRef.close).toHaveBeenCalledWith(true);
  });

  it('doInvite() should show error when service fails', () => {
    mockTopicInviteUserService.save.mockReturnValue(throwError(() => new Error('fail')));
    component.addMember(MOCK_USER);
    component.doInvite();
    expect(mockNotificationService.error).toHaveBeenCalled();
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });

  it('close() should close the dialog', () => {
    component.close();
    expect(mockDialogRef.close).toHaveBeenCalledWith();
  });

  it('canInvite() returns topicService.canUpdate result', () => {
    expect(component.canInvite()).toBe(true);
    mockTopicService.canUpdate.mockReturnValue(false);
    expect(component.canInvite()).toBe(false);
  });
});
