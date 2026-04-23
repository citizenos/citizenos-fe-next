import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { VoteCreateComponent } from './vote-create.component';
import { TopicService } from '../../../core/services/topic.service';
import { TopicVoteService } from '../../../core/services/topic-vote.service';
import { NotificationService } from '../../../core/services/notification.service';
import { of } from 'rxjs';

const mockTopic = { id: 'topic-1', title: 'Test', visibility: 'private', status: 'draft', categories: [] };
const mockVote = { id: 'vote-1', question: '', type: 'regular', authType: 'soft', options: [], delegationIsAllowed: false, autoClose: [], endsAt: null };
const mockTopicService = { save: vi.fn(), patch: vi.fn(), loadTopic: vi.fn() };
const mockVoteService = { save: vi.fn(), update: vi.fn(), get: vi.fn() };
const mockNotificationService = { success: vi.fn(), showRaw: vi.fn() };

describe('VoteCreateComponent (business logic)', () => {
  let component: VoteCreateComponent;

  beforeEach(() => {
    vi.clearAllMocks();
    mockTopicService.save.mockReturnValue(of(mockTopic));
    mockTopicService.patch.mockReturnValue(of(mockTopic));
    mockTopicService.loadTopic.mockReturnValue(of(mockTopic));
    mockVoteService.save.mockReturnValue(of({ ...mockVote, description: '' }));
    mockVoteService.update.mockReturnValue(of(mockVote));
    mockVoteService.get.mockReturnValue(of({ ...mockVote, description: '' }));

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: TopicService, useValue: mockTopicService },
        { provide: TopicVoteService, useValue: mockVoteService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: ActivatedRoute, useValue: { snapshot: { params: {} } } }
      ]
    });
    component = TestBed.runInInjectionContext(() => new VoteCreateComponent());
  });

  it('should start at info step', () => {
    expect(component.currentStep()).toBe('info');
  });

  it('onInfoNext should save topic if no id', () => {
    component.onInfoNext();
    expect(mockTopicService.save).toHaveBeenCalled();
  });

  it('onInfoNext should skip save if topic has id', () => {
    component.topic.set({ id: 'existing-id', title: 'Test' });
    component.onInfoNext();
    expect(mockTopicService.save).not.toHaveBeenCalled();
    expect(component.currentStep()).toBe('settings');
  });

  it('onTopicUpdate merges updates', () => {
    component.onTopicUpdate({ title: 'New Title' });
    expect(component.topic().title).toBe('New Title');
  });

  it('onVoteUpdate merges updates', () => {
    component.onVoteUpdate({ question: 'New question?' });
    expect(component.vote().question).toBe('New question?');
  });

  it('onPublish patches topic with voting status', () => {
    component.topic.set({ ...mockTopic });
    component.vote.set({ ...mockVote });
    component.onPublish();
    expect(mockTopicService.patch).toHaveBeenCalledWith(expect.objectContaining({ status: 'voting' }));
  });
});
