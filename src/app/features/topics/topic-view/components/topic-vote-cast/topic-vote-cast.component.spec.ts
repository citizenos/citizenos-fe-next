import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, ComponentRef } from '@angular/core';
import { of, Subject } from 'rxjs';
import { TopicVoteCastComponent } from './topic-vote-cast.component';
import { TopicService } from '../../../../../core/services/topic.service';
import { TopicVoteService } from '../../../../../core/services/topic-vote.service';
import { VoteDelegationService } from '../../../../../core/services/vote-delegation.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { DialogService } from '../../../../../shared/dialog/dialog.service';
import { TopicIdeationService } from '../../../../../core/services/topic-ideation.service';
import { Topic, TopicVote } from '../../../../../core/interfaces/topic';
import { By } from '@angular/platform-browser';

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

const mockTopicIdeationService = {
  getIdea: vi.fn(() => of({})),
  get: vi.fn(() => of({}))
};

const mockVoteDelegationService = { delete: vi.fn(() => of({})) };
const mockNotification = { success: vi.fn(), error: vi.fn() };
const mockDialogAfterClosed = new Subject<boolean | undefined>();
const mockDialogService = {
  open: vi.fn(() => ({ afterClosed: () => mockDialogAfterClosed.asObservable() }))
};

const mockVote: TopicVote = {
  id: 'v1',
  topicId: 't1',
  authType: 'soft',
  maxChoices: 1,
  minChoices: 1,
  votersCount: 3,
  endsAt: null,
  reminderTime: null,
  reminderSent: null,
  description: 'Test vote',
  downloads: {},
  type: 'regular',
  options: {
    rows: [
      { id: 'o1', value: 'Yes', selected: false },
      { id: 'o2', value: 'No', selected: false }
    ]
  }
};

const mockTopic: Topic = {
  id: 't1',
  voteId: 'v1',
  status: 'voting',
  visibility: 'public',
  title: 'Test topic',
  description: 'Test desc',
  members: { users: { count: 5 } }
} as Topic;

import { TranslateModule } from '@ngx-translate/core';

describe('TopicVoteCastComponent', () => {
  let component: TopicVoteCastComponent;
  let componentRef: ComponentRef<TopicVoteCastComponent>;
  let fixture: ComponentFixture<TopicVoteCastComponent>;

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [TopicVoteCastComponent, TranslateModule.forRoot()],
      providers: [
        { provide: TopicService, useValue: mockTopicService },
        { provide: TopicVoteService, useValue: mockTopicVoteService },
        { provide: VoteDelegationService, useValue: mockVoteDelegationService },
        { provide: NotificationService, useValue: mockNotification },
        { provide: DialogService, useValue: mockDialogService },
        { provide: TopicIdeationService, useValue: mockTopicIdeationService }
      ],
    }).overrideComponent(TopicVoteCastComponent, {
      set: { schemas: [NO_ERRORS_SCHEMA] }
    }).compileComponents();

    fixture = TestBed.createComponent(TopicVoteCastComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    
    componentRef.setInput('vote', JSON.parse(JSON.stringify(mockVote)));
    componentRef.setInput('topic', JSON.parse(JSON.stringify(mockTopic)));
    fixture.detectChanges();
  });

  it('should create and render without errors', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.vote_wrap')).toBeTruthy();
  });

  it('userHasVoted should be false when no option selected and no delegation', () => {
    expect(component.userHasVoted()).toBe(false);
  });

  it('userHasVoted should be true when an option is selected', () => {
    const vote = JSON.parse(JSON.stringify(mockVote));
    vote.options.rows[0].selected = true;
    componentRef.setInput('vote', vote);
    fixture.detectChanges();
    loadVote$.next();
    expect(component.userHasVoted()).toBe(true);
  });

  it('canSubmit should return true when one option selected (maxChoices=1)', () => {
    const vote = JSON.parse(JSON.stringify(mockVote));
    vote.options.rows[0].selected = true;
    componentRef.setInput('vote', vote);
    fixture.detectChanges();
    expect(component.canSubmit()).toBe(true);
  });

  it('canSubmit should return false when no options selected', () => {
    expect(component.canSubmit()).toBe(false);
  });

  it('selectOption should select an unselected option', () => {
    const vote = JSON.parse(JSON.stringify(mockVote));
    componentRef.setInput('vote', vote);
    fixture.detectChanges();
    component.selectOption(vote.options.rows[0]);
    expect(vote.options.rows[0].selected).toBe(true);
  });

  it('selectOption should deselect an already-selected option', () => {
    const vote = JSON.parse(JSON.stringify(mockVote));
    vote.options.rows[0].selected = true;
    componentRef.setInput('vote', vote);
    fixture.detectChanges();
    component.selectOption(vote.options.rows[0]);
    expect(vote.options.rows[0].selected).toBeFalsy();
  });

  it('doVote should call topicVoteService.cast for soft auth', () => {
    const vote = JSON.parse(JSON.stringify(mockVote));
    vote.options.rows[0].selected = true;
    componentRef.setInput('vote', vote);
    fixture.detectChanges();
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
    componentRef.setInput('vote', vote);
    fixture.detectChanges();
    component.doVote();
    expect(mockDialogService.open).toHaveBeenCalled();
    expect(mockTopicVoteService.cast).not.toHaveBeenCalled();
  });

  it('should render interactive elements and trigger closeVoting', () => {
    // Open dropdown first to reveal closeVoting option
    // It's a bit hard to test cosDropdown click directly, so we can just call it
    const closeSpy = vi.spyOn(component, 'closeVoting');
    // But testing that template bindings work:
    const actionsBtn = fixture.debugElement.query(By.css('.setting_button'));
    expect(actionsBtn).toBeTruthy();
    
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
    componentRef.setInput('vote', vote);
    fixture.detectChanges();
    component.delegate();
    expect(mockDialogService.open).toHaveBeenCalled();
  });

  it('delegate should not open dialog when delegation already exists', () => {
    const vote = { ...JSON.parse(JSON.stringify(mockVote)), delegation: { id: 'u2', name: 'Bob' } };
    componentRef.setInput('vote', vote);
    fixture.detectChanges();
    component.delegate();
    expect(mockDialogService.open).not.toHaveBeenCalled();
  });

  it('doRevokeDelegation should open confirm dialog', () => {
    component.doRevokeDelegation();
    expect(mockDialogService.open).toHaveBeenCalled();
  });

  it('triggerFinalDownload should open dialog when no final download url', () => {
    component.triggerFinalDownload('bdoc', false);
    expect(mockDialogService.open).toHaveBeenCalled();
  });
  
  it('should fetch ideation and idea when viewIdea is called', () => {
    const topicWithIdeation = { ...mockTopic, ideationId: 'id1' };
    componentRef.setInput('topic', topicWithIdeation);
    fixture.detectChanges();
    component.viewIdea({ ideaId: 'idea1' });
    expect(mockTopicIdeationService.getIdea).toHaveBeenCalled();
    expect(mockTopicIdeationService.get).toHaveBeenCalled();
    expect(mockDialogService.open).toHaveBeenCalled();
  });
});
