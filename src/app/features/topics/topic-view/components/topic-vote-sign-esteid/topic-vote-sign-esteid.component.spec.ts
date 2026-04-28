import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TopicVoteSignEsteidComponent } from './topic-vote-sign-esteid.component';
import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';
import { DialogRef } from '../../../../../shared/dialog/dialog-ref';
import { TopicVoteService } from '../../../../../core/services/topic-vote.service';
import { TopicService } from '../../../../../core/services/topic.service';
import { NotificationService } from '../../../../../core/services/notification.service';

const mockData = { topic: { id: 't1', voteId: 'v1' }, options: [{ id: 'o1', value: 'Yes' }] };
const mockDialogRef = { close: vi.fn() };
const mockTopicVoteService = { cast: vi.fn(), sign: vi.fn(), status: vi.fn(), loadVote$: of(null) };
const mockTopicService = { reloadTopic: vi.fn() };
const mockNotification = { success: vi.fn(), error: vi.fn() };
const mockTranslate = { instant: vi.fn((key: string) => key) };

describe('TopicVoteSignEsteidComponent', () => {
  let component: TopicVoteSignEsteidComponent;

  beforeEach(() => {
    vi.clearAllMocks();
    (globalThis as any).hwcrypto = {
      getCertificate: vi.fn(),
      sign: vi.fn()
    };
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
    component = TestBed.runInInjectionContext(() => new TopicVoteSignEsteidComponent());
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('doSignWithMobile should not call cast when form is invalid', () => {
    component.doSignWithMobile();
    expect(mockTopicVoteService.cast).not.toHaveBeenCalled();
  });

  it('doSignWithMobile should set isLoading and call cast when form is valid', () => {
    mockTopicVoteService.cast.mockReturnValue(of({ challengeID: 1234, token: 'tok' }));
    component.mobiilIdForm.setValue({ pid: '12345678901', phoneNumber: '+37255555555' });
    component.doSignWithMobile();
    expect(component.isLoading()).toBe(false);
    expect(mockTopicVoteService.cast).toHaveBeenCalledWith(expect.objectContaining({
      topicId: 't1',
      voteId: 'v1',
      pid: '12345678901',
    }));
  });

  it('doSignWithMobile should set challengeID from response', () => {
    mockTopicVoteService.cast.mockReturnValue(of({ challengeID: 9999, token: 'tok' }));
    mockTopicVoteService.status.mockReturnValue(of({ status: { code: 20002 }, data: {} }));
    component.mobiilIdForm.setValue({ pid: '12345678901', phoneNumber: '+37255555555' });
    component.doSignWithMobile();
    expect(component.challengeID()).toBe(9999);
  });

  it('getOptionValueText should return option if translation key not found', () => {
    mockTranslate.instant.mockReturnValue('VIEWS.TOPICS_TOPICID.VOTE_LBL_OPTION_YES');
    const result = component.getOptionValueText('Yes');
    expect(result).toBe('Yes');
  });
});
