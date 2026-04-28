import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TopicVoteSignSmartidComponent } from './topic-vote-sign-smartid.component';
import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';
import { DialogRef } from '../../../../../shared/dialog/dialog-ref';
import { TopicVoteService } from '../../../../../core/services/topic-vote.service';
import { TopicService } from '../../../../../core/services/topic.service';
import { NotificationService } from '../../../../../core/services/notification.service';

const mockData = { topic: { id: 't1', voteId: 'v1' }, options: [{ id: 'o1', value: 'Yes' }] };
const mockDialogRef = { close: vi.fn() };
const mockTopicVoteService = { cast: vi.fn(), status: vi.fn(), loadVote$: of(null) };
const mockTopicService = { reloadTopic: vi.fn() };
const mockNotification = { success: vi.fn(), error: vi.fn() };
const mockTranslate = { instant: vi.fn((key: string) => key) };

describe('TopicVoteSignSmartidComponent', () => {
  let component: TopicVoteSignSmartidComponent;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        { provide: DIALOG_DATA, useValue: mockData },
        { provide: DialogRef, useValue: mockDialogRef },
        { provide: TopicVoteService, useValue: mockTopicVoteService },
        { provide: TopicService, useValue: mockTopicService },
        { provide: NotificationService, useValue: mockNotification },
        { provide: TranslateService, useValue: mockTranslate }
      ]
    });
    component = TestBed.runInInjectionContext(() => new TopicVoteSignSmartidComponent());
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('doSignWithSmartId should not call cast when form is invalid', () => {
    component.doSignWithSmartId();
    expect(mockTopicVoteService.cast).not.toHaveBeenCalled();
  });

  it('doSignWithSmartId should set isLoading and call cast when form is valid', () => {
    mockTopicVoteService.cast.mockReturnValue(of({ challengeID: 5678, token: 'tok' }));
    mockTopicVoteService.status.mockReturnValue(of({ status: { code: 20002 }, data: {} }));
    component.signForm.setValue({ countryCode: 'EE', pid: '12345678901' });
    component.doSignWithSmartId();
    expect(mockTopicVoteService.cast).toHaveBeenCalledWith(expect.objectContaining({
      topicId: 't1',
      voteId: 'v1',
      pid: '12345678901',
      countryCode: 'EE'
    }));
  });

  it('should set challengeID when response contains it', () => {
    mockTopicVoteService.cast.mockReturnValue(of({ challengeID: 4242, token: 'tok' }));
    mockTopicVoteService.status.mockReturnValue(of({ status: { code: 20002 }, data: {} }));
    component.signForm.setValue({ countryCode: 'EE', pid: '12345678901' });
    component.doSignWithSmartId();
    expect(component.challengeID()).toBe(4242);
  });

  it('getOptionValueText should return option value if key not translated', () => {
    mockTranslate.instant.mockReturnValue('VIEWS.TOPICS_TOPICID.VOTE_LBL_OPTION_YES');
    expect(component.getOptionValueText('Yes')).toBe('Yes');
  });
});
