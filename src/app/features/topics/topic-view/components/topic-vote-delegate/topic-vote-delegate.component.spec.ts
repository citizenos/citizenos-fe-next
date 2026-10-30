import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { TopicVoteDelegateComponent } from './topic-vote-delegate.component';
import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';
import { DialogRef } from '../../../../../shared/dialog/dialog-ref';
import { TopicMemberUserService, TopicMemberUser } from '../../../../../core/services/topic-member-user.service';
import { VoteDelegationService } from '../../../../../core/services/vote-delegation.service';
import { TopicService } from '../../../../../core/services/topic.service';
import { UserStore } from '../../../../../core/state/user.store';
import { NotificationService } from '../../../../../core/services/notification.service';

const mockTopic = { id: 't1', voteId: 'v1' };
const mockUser = { id: 'me', name: 'Me' };
const mockDelegate = { id: 'user2', name: 'Bob', level: 'read' } as unknown as TopicMemberUser;
const mockDialogRef = { close: vi.fn() };
const mockMemberUserService = { query: vi.fn(() => of({ rows: [mockDelegate] })) };
const mockVoteDelegationService = { save: vi.fn(() => of({})) };
const mockTopicService = { reloadTopic: vi.fn() };
const mockUserStore = { user: vi.fn(() => mockUser) };
const mockNotification = {
  success: vi.fn(),
  error: vi.fn(),
  clear: vi.fn(),
  dismissAll: vi.fn(),
  dismiss: vi.fn(),
  notifications: signal([])
};

describe('TopicVoteDelegateComponent', () => {
  let component: TopicVoteDelegateComponent;
  let fixture: ComponentFixture<TopicVoteDelegateComponent>;

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [TopicVoteDelegateComponent, TranslateModule.forRoot()],
      providers: [
        { provide: DIALOG_DATA, useValue: { topic: mockTopic } },
        { provide: DialogRef, useValue: mockDialogRef },
        { provide: TopicMemberUserService, useValue: mockMemberUserService },
        { provide: VoteDelegationService, useValue: mockVoteDelegationService },
        { provide: TopicService, useValue: mockTopicService },
        { provide: UserStore, useValue: mockUserStore },
        { provide: NotificationService, useValue: mockNotification }
      ]
    }).overrideComponent(TopicVoteDelegateComponent, {
      set: { schemas: [NO_ERRORS_SCHEMA] }
    }).compileComponents();

    fixture = TestBed.createComponent(TopicVoteDelegateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and render dialog container with search_wrap', () => {
    expect(component).toBeTruthy();
    const searchWrap = fixture.debugElement.query(By.css('#search_wrap'));
    expect(searchWrap).toBeTruthy();
    const typeahead = fixture.debugElement.query(By.css('cos-typeahead'));
    expect(typeahead).toBeTruthy();
  });

  it('selectUser / addUser should set delegateUser', () => {
    component.selectUser(mockDelegate);
    expect(component.delegateUser()).toEqual(mockDelegate);
  });

  it('addUser without valid member should show error notification', () => {
    component.addUser();
    expect(mockNotification.error).toHaveBeenCalledWith('MSG_ERROR_POST_API_USERS_TOPICS_VOTES_DELEGATIONS_40002');
    expect(component.delegateUser()).toBeNull();
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

  it('should render row_list with delegate user info when delegate is selected', () => {
    component.selectUser(mockDelegate);
    fixture.detectChanges();

    const rowList = fixture.debugElement.query(By.css('.row_list'));
    expect(rowList).toBeTruthy();
    expect(rowList.nativeElement.textContent).toContain('Bob');

    const deleteBtn = fixture.debugElement.query(By.css('.row_cell_dialog button'));
    expect(deleteBtn).toBeTruthy();
    deleteBtn.triggerEventHandler('click', null);
    expect(component.delegateUser()).toBeNull();
  });
});
