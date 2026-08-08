import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { Component, input, signal, inject, ChangeDetectionStrategy, OnInit, computed, PLATFORM_ID } from '@angular/core';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { take, combineLatest } from 'rxjs';
import { Topic, TopicVote } from '../../../../../core/interfaces/topic';
import { VoteWithOptions } from '../../../../../core/interfaces/vote';
import { TopicService } from '../../../../../core/services/topic.service';
import { TopicVoteService } from '../../../../../core/services/topic-vote.service';
import { VoteDelegationService } from '../../../../../core/services/vote-delegation.service';
import { TopicIdeationService } from '../../../../../core/services/topic-ideation.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { DialogService } from '../../../../../shared/dialog/dialog.service';
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { TopicVoteSignComponent } from '../topic-vote-sign/topic-vote-sign.component';
import { TopicVoteDeadlineComponent } from '../topic-vote-deadline/topic-vote-deadline.component';
import { TopicVoteDelegateComponent } from '../topic-vote-delegate/topic-vote-delegate.component';
import { TopicVoteReminderDialogComponent } from '../topic-vote-reminder-dialog/topic-vote-reminder-dialog.component';
import { DownloadVoteResultsComponent } from '../download-vote-results/download-vote-results.component';
import { CloseVotingComponent } from '../close-voting/close-voting.component';
import { BigGraphComponent } from '../big-graph/big-graph.component';
import { InitialsComponent } from '../../../../../shared/components/initials/initials.component';
import { IdeaDialogComponent } from '../idea-dialog/idea-dialog.component';
import { CosDropdownDirective } from '../../../../../shared/directives/cos-dropdown.directive';
import { TooltipComponent } from '../../../../../shared/components/tooltip/tooltip.component';
import { VoteOptionsComponent } from '../../../../../shared/components/vote-options/vote-options.component';

@Component({
  selector: 'app-topic-vote-cast',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, DatePipe, BigGraphComponent, InitialsComponent, CosDropdownDirective, TooltipComponent, IconComponent, VoteOptionsComponent],
  templateUrl: './topic-vote-cast.component.html',
  styleUrls: ['./topic-vote-cast.component.scss']
})
export class TopicVoteCastComponent implements OnInit {
  vote = input.required<TopicVote>();
  topic = input.required<Topic>();

  normalizedVote = computed(() => {
    const v = this.vote();
    return {
      ...v,
      options: Array.isArray(v.options) ? v.options : (v.options?.rows || [])
    };
  });

  selectedOptions = computed(() => this.normalizedVote().options.filter(o => o.selected));
  unselectedOptions = computed(() => this.normalizedVote().options.filter(o => !o.selected));
  selectedOptionValues = computed(() => this.selectedOptions().map(o => o.value));

  private platformId = inject(PLATFORM_ID);
  private topicService = inject(TopicService);
  private topicVoteService = inject(TopicVoteService);
  private voteDelegationService = inject(VoteDelegationService);
  private notification = inject(NotificationService);
  private ideationService = inject(TopicIdeationService);
  private dialogService = inject(DialogService);

  readonly VOTE_AUTH_TYPES = this.topicVoteService.VOTE_AUTH_TYPES;

  userHasVoted = signal(false);
  editVote = signal(false);

  constructor() {
    this.topicVoteService.loadVote$.subscribe(() => this.checkUserVotingStatus());
  }

  ngOnInit() {
    this.checkUserVotingStatus();
  }

  private checkUserVotingStatus() {
    const v = this.vote();
    const options = Array.isArray(v?.options) ? v.options : v?.options?.rows;
    const hasVoted = !!(options?.some((o: { selected?: boolean }) => o.selected) || v?.delegation);
    this.userHasVoted.set(hasVoted);
    this.editVote.set(false);
  }

  canUpdate() {
    return this.topicService.canUpdate(this.topic());
  }

  canDelete() {
    return this.topicService.canDelete(this.topic());
  }

  canVote() {
    const t = this.topic();
    t.vote = this.vote();
    return this.topicVoteService.canVote(t);
  }

  canDelegate() {
    return this.topicVoteService.canDelegate(this.topic());
  }

  canSubmit() {
    const v = this.vote();
    const rows = Array.isArray(v?.options) ? v.options : v?.options?.rows;
    if (!rows) return false;
    const selected = rows.filter((o: { selected?: boolean }) => o.selected);
    if (selected.length === 1 && ((selected[0] as { value?: string }).value === 'Neutral' || (selected[0] as { value?: string }).value === 'Veto')) return true;
    return selected.length <= (v.maxChoices || 0) && selected.length >= (v.minChoices || 0);
  }

  canEditDeadline() {
    return this.topic().status === this.topicService.STATUSES.voting;
  }

  hasVoteEndedExpired() {
    return this.topicVoteService.hasVoteEndedExpired(this.topic(), this.vote());
  }

  selectOption(option: { id?: string; value?: string; selected?: boolean; optionId?: string }) {
    if (!this.canVote()) return;
    const v = this.vote();
    if (option.selected) {
      delete option.selected;
      return;
    }
    const rows = Array.isArray(v?.options) ? v.options : v?.options?.rows;
    rows?.forEach((opt: { value?: string; selected?: boolean }) => {
      if (option.value === 'Neutral' || option.value === 'Veto' || v.maxChoices === 1) {
        opt.selected = false;
      } else if (opt.value === 'Neutral' || opt.value === 'Veto') {
        opt.selected = false;
      }
    });
    option.optionId = option.id;
    const selected = rows?.filter((o: { selected?: boolean }) => o.selected) || [];
    const alreadySelected = selected.find((i: { id?: string }) => i.id === option.id);
    if (selected.length >= (v.maxChoices || 0) && !alreadySelected) return;
    option.selected = !option.selected;
  }

  doVote() {
    const v = this.vote();
    const rows = Array.isArray(v?.options) ? v.options : v?.options?.rows;
    const options = (rows || []).filter((o: { id?: string; selected?: boolean; optionId?: string; value?: string }) => {
      o.optionId = o.id;
      return !!o.selected;
    });
    if (options.length > (v.maxChoices || 0) || (options.length < (v.minChoices || 0) && options[0]?.value !== 'Neutral' && options[0]?.value !== 'Veto')) {
      this.notification.error('MSG_ERROR_SELECTED_OPTIONS_COUNT_DOES_NOT_MATCH_VOTE_SETTINGS');
      return;
    }
    if (v.authType === this.VOTE_AUTH_TYPES.hard) {
      this.dialogService.open(TopicVoteSignComponent, { data: { topic: this.topic(), options } });
      return;
    }
    options.forEach((o: { id?: string; optionId?: string }) => { o.optionId = o.id; });
    this.topicVoteService.cast({ voteId: v.id, topicId: this.topic().id, options })
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.notification.success('VIEWS.TOPICS_TOPICID.MSG_VOTE_REGISTERED');
          this.editVote.set(false);
          this.userHasVoted.set(true);
        }
      });
  }

  private saveVote(voteData?: Partial<TopicVote>) {
    const v = Object.assign(voteData || this.vote(), { topicId: this.topic().id });
    this.topicVoteService.update(v as Partial<VoteWithOptions> & { topicId: string }).pipe(take(1)).subscribe({
      next: () => this.topicService.reloadTopic()
    });
  }

  closeVoting() {
    this.dialogService.open(CloseVotingComponent, { data: { topic: this.topic() } })
      .afterClosed().subscribe(value => {
        if (value) {
          const v = this.vote();
          v.endsAt = new Date();
          this.saveVote(v);
          const t = this.topic();
          t.status = this.topicService.STATUSES.followUp;
          this.topicService.patch(t).pipe(take(1)).subscribe(() => this.topicService.reloadTopic());
        }
      });
  }

  sendVoteReminder() {
    this.dialogService.open(TopicVoteReminderDialogComponent, { data: { topic: this.topic(), vote: this.vote() } })
      .afterClosed().subscribe(send => {
        if (send === true) {
          const v = this.vote();
          v.reminderTime = new Date();
          this.saveVote(v);
          this.topicVoteService.reloadVote();
          this.notification.success('COMPONENTS.TOPIC_VOTE_CAST.MSG_VOTE_REMINDER_SENT');
        }
      });
  }

  editDeadline() {
    this.dialogService.open(TopicVoteDeadlineComponent, { data: { vote: this.vote(), topic: this.topic() } });
  }

  delegate() {
    if (!this.vote().delegation) {
      this.dialogService.open(TopicVoteDelegateComponent, { data: { topic: this.topic() } });
    }
  }

  doRevokeDelegation() {
    this.dialogService.open(ConfirmDialogComponent, {
      data: {
        level: 'voting' as const,
        heading: 'MODALS.TOPIC_VOTE_REVOKE_DELEGATION_CONFIRM_HEADING',
        description: 'MODALS.TOPIC_VOTE_REVOKE_DELEGATION_CONFIRM_TXT_ARE_YOU_SURE',
        confirmBtn: 'MODALS.TOPIC_VOTE_REVOKE_DELEGATION_CONFIRM_YES',
        closeBtn: 'MODALS.TOPIC_VOTE_REVOKE_DELEGATION_CONFIRM_NO',
        svg: `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M26.3432 15.9229L27.0634 10L21.1505 10.7214L23.1001 12.6743L15.7221 20.0647L17.1292 21.4742L24.5072 14.0838L26.3432 15.9229Z" fill="#5AB467"/>
          <path d="M17.9282 29L28 18.9113L26.5929 17.5018L17.9352 26.174L13.4071 21.6524L12 23.0618L17.9282 29Z" fill="#5AB467"/>
          <path d="M27 27L32 32" stroke="#5AB467" stroke-width="4" stroke-linecap="square"/>
          <path d="M8 8L13 13" stroke="#5AB467" stroke-width="4" stroke-linecap="square"/>
          <rect x="2" y="2" width="36" height="36" rx="18" stroke="#5AB467" stroke-width="4"/>
          </svg>`
      }
    }).afterClosed().subscribe(result => {
      if (result === true) {
        const v = this.vote();
        this.voteDelegationService.delete({ topicId: this.topic().id, voteId: v.id })
          .pipe(take(1)).subscribe({
            next: () => {
              this.topicService.reloadTopic();
              this.userHasVoted.set(false);
            }
          });
      }
    });
  }

  triggerFinalDownload(type: string, includeCSV?: boolean) {
    const v = this.vote();
    if (v.downloads?.bdocFinal || v.downloads?.zipFinal) {
      let url = type === 'zip' ? (v.downloads?.zipFinal || '') : (v.downloads?.bdocFinal || '');
      if (!url) return;
      if (includeCSV) url += '&include[]=csv';
      if (isPlatformBrowser(this.platformId)) window.location.href = url;
      return;
    }
    this.dialogService.open(DownloadVoteResultsComponent)
      .afterClosed().subscribe(allow => {
        if (allow === 'deadline') {
          this.editDeadline();
        } else if (allow === true) {
          const t = this.topic();
          t.status = this.topicService.STATUSES.followUp;
          this.topicService.patch(t).pipe(take(1)).subscribe(() => {
            this.topicService.reloadTopic();
            this.topicVoteService.get({ topicId: t.id, voteId: t.voteId || undefined }).pipe(take(1)).subscribe(vote => {
              let url = type === 'zip' ? (vote.downloads?.zipFinal || '') : (vote.downloads?.bdocFinal || '');
              if (!url) return;
              if (includeCSV) url += '&include[]=csv';
              if (isPlatformBrowser(this.platformId)) window.location.href = url;
            });
          });
        }
      });
  }

  viewIdea(option: { ideaId?: string }) {
    const t = this.topic();
    if (!t.ideationId || !option.ideaId) return;

    combineLatest([
      this.ideationService.getIdea({ topicId: t.id, ideationId: t.ideationId, ideaId: option.ideaId }),
      this.ideationService.get({ topicId: t.id, ideationId: t.ideationId })
    ])
    .pipe(take(1))
    .subscribe(([idea, ideation]) => {
      this.dialogService.open(IdeaDialogComponent, {
        data: {
          idea,
          topic: t,
          ideation,
        },
      });
    });
  }

  voteGraphDasharray() {
    return `${2 * Math.PI * 20}px`;
  }

  voteGraphDashOffset(percentage: number) {
    return `${(2 * Math.PI * 20) * ((100 - percentage) / 100)}px`;
  }
}
