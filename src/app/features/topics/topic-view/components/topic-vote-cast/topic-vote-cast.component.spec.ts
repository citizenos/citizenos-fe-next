import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { TopicVoteCastComponent } from './topic-vote-cast.component';
import { TopicService } from '../../../../../core/services/topic.service';
import { TopicVoteService } from '../../../../../core/services/topic-vote.service';
import { VoteDelegationService } from '../../../../../core/services/vote-delegation.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { DialogService } from '../../../../../shared/dialog/dialog.service';

const loadVote$ = new Subject<void>();

const mockTopicService = {
  STATUSES: { voting: 'voting', followUp: 'follow_up' },
  canUpdate: vi.fn(() => true),
  canDelete: vi.fn(() => true),
  reloadTopic: vi.fn(),
  patch: vi.fn(() => of({}))
};

const mockTopicVoteService = {
  loadVote$,
  VOTE_AUTH_TYPES: { hard: 'hard', soft: 'soft' },
  canVote: vi.fn(() => true),
  canDelegate: vi.fn(() => true),
  hasVoteEndedExpired: vi.fn(() => false),
  cast: vi.fn(() => of({})),
  update: vi.fn(() => of({})),
  get: vi.fn(() => of({ downloads: { bdocFinal: '/dl/bdoc', zipFinal: '/dl/zip' } })),
  reloadVote: vi.fn()
};

const mockVoteDelegationService = { delete: vi.fn(() => of({})) };
const mockNotification = { success: vi.fn(), error: vi.fn() };
const mockDialogAfterClosed = new Subject<any>();
const mockDialogService = {
  open: vi.fn(() => ({ afterClosed: () => mockDialogAfterClosed.asObservable() }))
};

const mockVote = {
  id: 'v1',
  authType: 'soft',
  maxChoices: 1,
  minChoices: 1,
  votersCount: 3,
  endsAt: null,
  reminderSent: false,
  downloads: {},
  options: {
    rows: [
      { id: 'o1', value: 'Yes', selected: false },
      { id: 'o2', value: 'No', selected: false }
    ]
  }
};

const mockTopic = {
  id: 't1',
  voteId: 'v1',
  status: 'voting',
  members: { users: { count: 5 } }
};

function buildComponent() {
  const comp = TestBed.runInInjectionContext(() => new TopicVoteCastComponent());
  (comp as unknown as { vote: any }).vote = vi.fn().mockReturnValue(JSON.parse(JSON.stringify(mockVote)));
  (comp as unknown as { topic: any }).topic = vi.fn().mockReturnValue({ ...mockTopic });
  comp.ngOnInit();
  return comp;
}

describe('TopicVoteCastComponent', () => {
  let component: TopicVoteCastComponent;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        { provide: TopicService, useValue: mockTopicService },
        { provide: TopicVoteService, useValue: mockTopicVoteService },
        { provide: VoteDelegationService, useValue: mockVoteDelegationService },
        { provide: NotificationService, useValue: mockNotification },
        { provide: DialogService, useValue: mockDialogService }
      ]
    });
    component = buildComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('userHasVoted should be false when no option selected and no delegation', () => {
    expect(component.userHasVoted()).toBe(false);
  });

  it('userHasVoted should be true when an option is selected', () => {
    const vote = JSON.parse(JSON.stringify(mockVote));
    vote.options.rows[0].selected = true;
    (component as unknown as { vote: any }).vote = vi.fn().mockReturnValue(vote);
    (component as unknown as { checkUserVotingStatus: () => void }).checkUserVotingStatus();
    expect(component.userHasVoted()).toBe(true);
  });

  it('canSubmit should return true when one option selected (maxChoices=1)', () => {
    const vote = JSON.parse(JSON.stringify(mockVote));
    vote.options.rows[0].selected = true;
    (component as unknown as { vote: any }).vote = vi.fn().mockReturnValue(vote);
    expect(component.canSubmit()).toBe(true);
  });

  it('canSubmit should return false when no options selected', () => {
    expect(component.canSubmit()).toBe(false);
  });

  it('selectOption should select an unselected option', () => {
    const vote = JSON.parse(JSON.stringify(mockVote));
    (component as unknown as { vote: any }).vote = vi.fn().mockReturnValue(vote);
    component.selectOption(vote.options.rows[0]);
    expect(vote.options.rows[0].selected).toBe(true);
  });

  it('selectOption should deselect an already-selected option', () => {
    const vote = JSON.parse(JSON.stringify(mockVote));
    vote.options.rows[0].selected = true;
    (component as unknown as { vote: any }).vote = vi.fn().mockReturnValue(vote);
    component.selectOption(vote.options.rows[0]);
    expect(vote.options.rows[0].selected).toBeUndefined();
  });

  it('doVote should call topicVoteService.cast for soft auth', () => {
    const vote = JSON.parse(JSON.stringify(mockVote));
    vote.options.rows[0].selected = true;
    (component as unknown as { vote: any }).vote = vi.fn().mockReturnValue(vote);
    component.doVote();
    expect(mockTopicVoteService.cast).toHaveBeenCalledWith(expect.objectContaining({
      voteId: 'v1',
      topicId: 't1'
    }));
  });

  it('doVote should open sign dialog for hard auth', () => {
    const vote = JSON.parse(JSON.stringify(mockVote));
    vote.authType = 'hard';
    vote.options.rows[0].selected = true;
    (component as unknown as { vote: any }).vote = vi.fn().mockReturnValue(vote);
    component.doVote();
    expect(mockDialogService.open).toHaveBeenCalled();
    expect(mockTopicVoteService.cast).not.toHaveBeenCalled();
  });

  it('closeVoting should open dialog', () => {
    component.closeVoting();
    expect(mockDialogService.open).toHaveBeenCalled();
  });

  it('sendVoteReminder should open dialog', () => {
    component.sendVoteReminder();
    expect(mockDialogService.open).toHaveBeenCalled();
  });

  it('editDeadline should open dialog', () => {
    component.editDeadline();
    expect(mockDialogService.open).toHaveBeenCalled();
  });

  it('delegate should open dialog when vote has no delegation', () => {
    const vote = JSON.parse(JSON.stringify(mockVote));
    (component as unknown as { vote: any }).vote = vi.fn().mockReturnValue(vote);
    component.delegate();
    expect(mockDialogService.open).toHaveBeenCalled();
  });

  it('delegate should not open dialog when delegation already exists', () => {
    const vote = { ...JSON.parse(JSON.stringify(mockVote)), delegation: { id: 'u2', name: 'Bob' } };
    (component as unknown as { vote: any }).vote = vi.fn().mockReturnValue(vote);
    component.delegate();
    expect(mockDialogService.open).not.toHaveBeenCalled();
  });

  it('doRevokeDelegation should open confirm dialog', () => {
    component.doRevokeDelegation();
    expect(mockDialogService.open).toHaveBeenCalled();
  });

  it('triggerFinalDownload should redirect when bdocFinal url is available', () => {
    const _locationSpy = vi.spyOn(window, 'location', 'get').mockReturnValue({
      ...window.location,
      href: ''
    } as any);
    let href = '';
    Object.defineProperty(window, 'location', {
      value: { ...window.location, set href(val: string) { href = val; } },
      writable: true
    });
    const vote = { ...JSON.parse(JSON.stringify(mockVote)), downloads: { bdocFinal: '/dl/bdoc' } };
    (component as unknown as { vote: any }).vote = vi.fn().mockReturnValue(vote);
    component.triggerFinalDownload('bdoc', false);
    expect(href).toBe('/dl/bdoc');
  });

  it('triggerFinalDownload should open dialog when no final download url', () => {
    component.triggerFinalDownload('bdoc', false);
    expect(mockDialogService.open).toHaveBeenCalled();
  });
});
