import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Directive, Input } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { InviteEditorsComponent, EditorMember } from './invite-editors.component';
import { DIALOG_DATA, DialogRef } from '../../../../../shared/dialog';
import { TopicService } from '../../../../../core/services/topic.service';
import { TopicInviteUserService } from '../../../../../core/services/topic-invite-user.service';
import { SearchService } from '../../../../../core/services/search.service';
import { NotificationService } from '../../../../../core/services/notification.service';

@Component({ selector: 'cos-input', template: '<ng-content/>', standalone: true })
class InputStub { @Input() placeholder: string | undefined; }

@Component({ selector: 'cos-initials', template: '', standalone: true })
class InitialsStub { @Input() name: string | undefined; }

@Component({ selector: 'cos-pagination', template: '', standalone: true })
class PaginationStub { @Input() totalPages: number | undefined; @Input() page: number | undefined; }

@Directive({ selector: '[cosDropdown]', standalone: true })
class CosDropdownStub {}

// eslint-disable-next-line @angular-eslint/directive-selector
@Directive({ selector: '[dialogClose]', standalone: true })
class DialogCloseStub {}

const mockTopic = { id: 'topic1', title: 'Test Topic' };

describe('InviteEditorsComponent', () => {
  let fixture: ComponentFixture<InviteEditorsComponent>;
  let component: InviteEditorsComponent;
  let topicService: Partial<TopicService>;
  let inviteUserService: Partial<TopicInviteUserService>;
  let searchService: Partial<SearchService>;
  let notification: Partial<NotificationService>;
  let dialogRef: Partial<DialogRef<InviteEditorsComponent>>;

  beforeEach(() => TestBed.resetTestingModule());

  beforeEach(async () => {
    topicService = {
      LEVELS: { read: 'read', edit: 'edit', admin: 'admin' }
    };
    inviteUserService = {
      save: vi.fn().mockReturnValue(of({ data: [] }))
    };
    searchService = {
      searchUsers: vi.fn().mockReturnValue(of({ results: { public: { users: { count: 0, rows: [] } } } }))
    };
    notification = { success: vi.fn(), error: vi.fn() };
    dialogRef = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [InviteEditorsComponent, FormsModule, TranslateModule.forRoot()],
      providers: [
        { provide: DIALOG_DATA, useValue: { topic: mockTopic } },
        { provide: DialogRef, useValue: dialogRef },
        { provide: TopicService, useValue: topicService },
        { provide: TopicInviteUserService, useValue: inviteUserService },
        { provide: SearchService, useValue: searchService },
        { provide: NotificationService, useValue: notification }
      ]
    }).overrideComponent(InviteEditorsComponent, {
      set: {
        imports: [
          UpperCasePipe, FormsModule, TranslateModule,
          InputStub, InitialsStub, PaginationStub, CosDropdownStub, DialogCloseStub
        ]
      }
    }).compileComponents();

    fixture = TestBed.createComponent(InviteEditorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders without error', () => {
    expect(component).toBeTruthy();
  });

  it('initializes with topic from dialog data', () => {
    expect(component.topic).toEqual(mockTopic);
  });

  it('LEVELS contains edit and admin only', () => {
    expect(component.LEVELS).toContain('edit');
    expect(component.LEVELS).toContain('admin');
    expect(component.LEVELS).not.toContain('read');
  });

  it('onSearch sets searchResults when results returned', () => {
    searchService.searchUsers = vi.fn().mockReturnValue(of({
      results: { public: { users: { count: 1, rows: [{ id: 'u1', name: 'Alice', email: 'alice@example.com' }] } } }
    }));
    component.onSearch('ali');
    expect(component.searchResults()).toHaveLength(1);
    expect(component.searchResults()[0].name).toBe('Alice');
  });

  it('onSearch sets email result when no users and input is email', () => {
    searchService.searchUsers = vi.fn().mockReturnValue(of({
      results: { public: { users: { count: 0, rows: [] } } }
    }));
    component.onSearch('test@example.com');
    expect(component.searchResults()).toHaveLength(1);
    expect(component.searchResults()[0].email).toBe('test@example.com');
  });

  it('onSearch clears results for short input', () => {
    component.onSearch('a');
    expect(component.searchResults()).toHaveLength(0);
  });

  it('addTopicMember adds a user to members list', () => {
    const user = { id: 'u1', name: 'Alice', email: 'alice@example.com', imageUrl: null, level: 'edit' } as unknown as EditorMember;
    component.addTopicMember(user);
    expect(component.members()).toHaveLength(1);
    expect(component.members()[0].id).toBe('u1');
  });

  it('addTopicMember does not add duplicate users', () => {
    const user = { id: 'u1', name: 'Alice', email: 'alice@example.com', imageUrl: null, level: 'edit' } as unknown as EditorMember;
    component.addTopicMember(user);
    component.addTopicMember(user);
    expect(component.members()).toHaveLength(1);
  });

  it('addTopicMember with no arg adds from search string (email)', () => {
    component.searchString.set('test@example.com');
    component.addTopicMember();
    expect(component.members()).toHaveLength(1);
    expect(component.members()[0].id).toBe('test@example.com');
  });

  it('addTopicMember with invalid email adds to invalid list', () => {
    component.searchString.set('notanemail');
    component.addTopicMember();
    expect(component.invalid()).toContain('notanemail');
  });

  it('removeTopicMemberUser removes a member', () => {
    const user = { id: 'u1', name: 'Alice', email: 'alice@example.com', imageUrl: null, level: 'edit' } as unknown as EditorMember;
    component.addTopicMember(user);
    component.removeTopicMemberUser(component.members()[0]);
    expect(component.members()).toHaveLength(0);
  });

  it('updateTopicMemberUserLevel changes individual member level', () => {
    const user = { id: 'u1', name: 'Alice', email: 'alice@example.com', imageUrl: null, level: 'edit' } as unknown as EditorMember;
    component.addTopicMember(user);
    const member = component.members()[0];
    component.updateTopicMemberUserLevel(member, 'admin');
    expect(component.members()[0].level).toBe('admin');
  });

  it('updateAllMemberLevels changes all members', () => {
    component.addTopicMember({ id: 'u1', name: 'Alice', email: 'alice@example.com', imageUrl: null, level: 'edit' } as unknown as EditorMember);
    component.addTopicMember({ id: 'u2', name: 'Bob', email: 'bob@example.com', imageUrl: null, level: 'edit' } as unknown as EditorMember);
    component.updateAllMemberLevels('admin');
    expect(component.members().every(m => m.level === 'admin')).toBe(true);
  });

  it('removeAllMembers clears the list', () => {
    component.addTopicMember({ id: 'u1', name: 'Alice', email: 'alice@example.com', imageUrl: null, level: 'edit' } as unknown as EditorMember);
    component.removeAllMembers();
    expect(component.members()).toHaveLength(0);
  });

  it('removeInvalidEmail removes by index', () => {
    component.searchString.set('bad1,bad2');
    component.addTopicMember();
    expect(component.invalid()).toHaveLength(2);
    component.removeInvalidEmail(0);
    expect(component.invalid()).toHaveLength(1);
  });

  it('totalPages computed from members length', () => {
    expect(component.totalPages()).toBe(0);
    for (let i = 0; i < 11; i++) {
      component.addTopicMember({ id: `u${i}`, name: `User${i}`, email: `u${i}@example.com`, imageUrl: null, level: 'edit' } as unknown as EditorMember);
    }
    expect(component.totalPages()).toBe(2);
  });

  it('isOnPage returns true for items on current page', () => {
    expect(component.isOnPage(0)).toBe(true);
    expect(component.isOnPage(9)).toBe(true);
    expect(component.isOnPage(10)).toBe(false);
  });

  it('inviteEditors does nothing when members is empty', () => {
    component.inviteEditors();
    expect(inviteUserService.save).not.toHaveBeenCalled();
  });

  it('inviteEditors calls save and closes dialog', () => {
    component.addTopicMember({ id: 'u1', name: 'Alice', email: 'alice@example.com', imageUrl: null, level: 'edit' } as unknown as EditorMember);
    component.inviteEditors();
    expect(inviteUserService.save).toHaveBeenCalledWith('topic1', expect.any(Array));
    expect(notification.success).toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalled();
  });

  it('inviteMessage signal updates correctly', () => {
    component.inviteMessage.set('Hello!');
    expect(component.inviteMessage()).toBe('Hello!');
  });
});
