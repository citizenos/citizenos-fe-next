import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { TopicVoteDelegateComponent } from './topic-vote-delegate.component';
import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';
import { DialogRef } from '../../../../../shared/dialog/dialog-ref';
import { TopicMemberUserService } from '../../../../../core/services/topic-member-user.service';
import { VoteDelegationService } from '../../../../../core/services/vote-delegation.service';
import { TopicService } from '../../../../../core/services/topic.service';
import { UserStore } from '../../../../../core/state/user.store';
import { NotificationService } from '../../../../../core/services/notification.service';
import { TopicMemberUser } from '../../../../../core/services/topic-member-user.service';

const mockTopic = { id: 't1', voteId: 'v1' };
const mockUser = { id: 'me', name: 'Me' };
const mockDelegate = { id: 'user2', name: 'Bob', level: 'read' } as unknown as TopicMemberUser;
const mockDialogRef = { close: vi.fn() };
const mockMemberUserService = { query: vi.fn(() => of({ rows: [mockDelegate] })) };
const mockVoteDelegationService = { save: vi.fn(() => of({})) };
const mockTopicService = { reloadTopic: vi.fn() };
const mockUserStore = { user: vi.fn(() => mockUser) };
const mockNotification = { success: vi.fn(), error: vi.fn() };
const mockTranslate = { instant: vi.fn((key: string) => key) };

describe('TopicVoteDelegateComponent', () => {
  let component: TopicVoteDelegateComponent;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        { provide: DIALOG_DATA, useValue: { topic: mockTopic } },
        { provide: DialogRef, useValue: mockDialogRef },
        { provide: TopicMemberUserService, useValue: mockMemberUserService },
        { provide: VoteDelegationService, useValue: mockVoteDelegationService },
        { provide: TopicService, useValue: mockTopicService },
        { provide: UserStore, useValue: mockUserStore },
        { provide: NotificationService, useValue: mockNotification },
        { provide: TranslateService, useValue: mockTranslate }
      ]
    });
    component = TestBed.runInInjectionContext(() => new TopicVoteDelegateComponent());
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('selectUser should set delegateUser', () => {
    component.selectUser(mockDelegate);
    expect(component.delegateUser()).toEqual(mockDelegate);
  });

  it('selectUser should clear search string', () => {
    component.searchStr.set('Bob');
    component.selectUser(mockDelegate);
    expect(component.searchStr()).toBe('');
  });

  it('removeDelegate should clear delegateUser', () => {
    component.selectUser(mockDelegate);
    component.removeDelegate();
    expect(component.delegateUser()).toBeNull();
  });

  it('save should not call delegation service when no user selected', () => {
    component.save();
    expect(mockVoteDelegationService.save).not.toHaveBeenCalled();
  });

  it('save should call voteDelegationService.save with correct data', () => {
    component.selectUser(mockDelegate);
    component.save();
    expect(mockVoteDelegationService.save).toHaveBeenCalledWith({
      topicId: 't1',
      voteId: 'v1',
      userId: 'user2'
    });
  });

  it('save should reload topic and close dialog on success', () => {
    component.selectUser(mockDelegate);
    component.save();
    expect(mockTopicService.reloadTopic).toHaveBeenCalled();
    expect(mockDialogRef.close).toHaveBeenCalledWith(true);
  });

  it('save should show error notification on failure', () => {
    mockVoteDelegationService.save.mockReturnValue(throwError(() => new Error('fail')));
    component.selectUser(mockDelegate);
    component.save();
    expect(mockNotification.error).toHaveBeenCalled();
  });
});
