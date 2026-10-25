import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, inject, signal } from '@angular/core';
import { DatePipe, NgClass, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { take } from 'rxjs';

import { DIALOG_DATA, DialogRef, DialogCloseDirective } from '../../../shared/dialog';
import { TopicVoteService } from '../../../core/services/topic-vote.service';
import { TopicIdeationService } from '../../../core/services/topic-ideation.service';
import { NotificationService } from '../../../core/services/notification.service';
import { TopicService } from '../../../core/services/topic.service';

import { Topic } from '../../../core/interfaces/topic';
import { Idea } from '../../../core/interfaces/idea';
import { IdeationFolder } from '../../../core/interfaces/ideation';

import { InputComponent } from '../../../shared/components/input/input.component';
import { NotificationComponent } from '../../../shared/components/notification/notification.component';
import { CosCalenderComponent } from '../../../shared/components/cos-calender/cos-calender.component';
import { CosDropdownDirective } from '../../../shared/directives/cos-dropdown.directive';

export interface VoteOptionItem {
  value: string;
  ideaId?: string;
}

export interface ReminderOption {
  value: number;
  unit: 'days' | 'weeks' | 'month';
}

export interface VoteFormModel {
  description: string;
  topicId: string;
  options: VoteOptionItem[];
  delegationIsAllowed: boolean;
  type: 'regular' | 'multiple' | 'ideation';
  authType: 'soft' | 'hard';
  maxChoices: number;
  minChoices: number;
  reminderTime: Date | null;
  autoClose: { value: string; enabled: boolean }[];
  endsAt: Date | null;
}

@Component({
  selector: 'cos-vote-create-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    NgClass,
    UpperCasePipe,
    FormsModule,
    TranslateModule,
    DialogCloseDirective,
    DragDropModule,
    InputComponent,
    NotificationComponent,
    CosCalenderComponent,
    CosDropdownDirective,
  ],
  templateUrl: './vote-create-dialog.component.html',
  styleUrls: ['./vote-create-dialog.component.scss'],
})
export class VoteCreateDialogComponent implements OnInit {
  private data = inject<{ topic: Topic }>(DIALOG_DATA);
  protected dialogRef = inject(DialogRef);
  private voteService = inject(TopicVoteService);
  private topicIdeationService = inject(TopicIdeationService, { optional: true });
  public TopicService = inject(TopicService);
  private notification = inject(NotificationService);
  private router = inject(Router);
  private translate = inject(TranslateService);
  private cdr = inject(ChangeDetectorRef);

  topic: Topic = this.data.topic;
  topicId = '';

  readonly VOTE_TYPES = {
    ideation: 'ideation' as const,
    regular: 'regular' as const,
    multiple: 'multiple' as const,
  };

  readonly VOTE_AUTH_TYPES = {
    soft: 'soft' as const,
    hard: 'hard' as const,
  };

  HCount = 23;
  datePickerMin = new Date();
  readonly CONF = {
    autoClose: [
      {
        value: 'allMembersVoted',
        enabled: false,
      },
    ],
    optionsMax: 10,
    optionsMin: 2,
  };

  tabs = [0, 1, 2, 3];
  tabActive = signal<number>(1);

  vote: VoteFormModel = {
    description: '',
    topicId: '',
    options: [],
    delegationIsAllowed: false,
    type: 'regular',
    authType: 'soft',
    maxChoices: 1,
    minChoices: 1,
    reminderTime: null,
    autoClose: [
      {
        value: 'allMembersVoted',
        enabled: false,
      },
    ],
    endsAt: null,
  };

  deadline: Date | null = null;
  numberOfDaysLeft = 0;
  endsAt: {
    date: Date | undefined;
    min: number | string;
    h: number | string;
    timeFormat: number | string;
  } = {
    date: undefined,
    min: 0,
    h: 0,
    timeFormat: 24,
  };

  errors: Record<string, string> | null = null;

  extraOptions = {
    neutral: {
      value: 'Neutral',
      enabled: false,
    },
    veto: {
      value: 'Veto',
      enabled: false,
    },
  };

  predefinedOptions = {
    yes: {
      value: 'Yes',
      enabled: true,
    },
    no: {
      value: 'No',
      enabled: true,
    },
  };

  customOptions: VoteOptionItem[] = [{ value: '' }, { value: '' }, { value: '' }];
  optionIdeas: Idea[] = [];
  reminder = false;
  reminderOptionsList: ReminderOption[] = [
    { value: 1, unit: 'days' },
    { value: 2, unit: 'days' },
    { value: 3, unit: 'days' },
    { value: 1, unit: 'weeks' },
    { value: 2, unit: 'weeks' },
    { value: 1, unit: 'month' },
  ];
  reminderOptions: ReminderOption[] = [];

  ideasList: Idea[] = [];
  ideaOrder: 'asc' | 'desc' = 'desc';
  ideasCount = 0;
  folderList: IdeationFolder[] = [];
  folderCount = 0;
  folderIdeasShown: string[] = [];

  ngOnInit(): void {
    this.topic = this.data.topic;
    this.topicId = this.topic?.id || '';
    this.vote.topicId = this.topicId;

    if (this.topic?.voteId) {
      const lang = this.translate.currentLang || 'en';
      this.router.navigate(['/', lang, 'topics', this.topic.id, 'votes', this.topic.voteId]);
    }

    if (this.topic?.ideationId && this.topicIdeationService) {
      this.topicIdeationService
        .getIdeas({
          topicId: this.topicId,
          ideationId: this.topic.ideationId,
        })
        .pipe(take(1))
        .subscribe({
          next: (res) => {
            if (res?.rows) {
              this.ideasList = res.rows.map((idea) => ({
                ...idea,
                statement: idea.statement ? idea.statement.substring(0, 200) : '',
              }));
              this.ideasCount = this.ideasList.length;
              this.cdr.markForCheck();
            }
          },
        });

      this.topicIdeationService
        .getFolders({
          topicId: this.topicId,
          ideationId: this.topic.ideationId,
        })
        .pipe(take(1))
        .subscribe({
          next: (res) => {
            if (res?.rows) {
              this.folderList = res.rows.map((folder) => ({
                ...folder,
                ideas: folder.ideas || { count: 0, rows: [] },
              }));
              this.folderCount = this.folderList.length;
              this.folderList.forEach((folder) => {
                this.topicIdeationService
                  ?.getIdeas({
                    topicId: this.topicId,
                    ideationId: this.topic.ideationId!,
                    folderId: folder.id,
                  })
                  .pipe(take(1))
                  .subscribe({
                    next: (folderIdeas) => {
                      if (folderIdeas) {
                        folder.ideas = {
                          count: folderIdeas.count,
                          rows: (folderIdeas.rows || []).map((idea) => ({
                            ...idea,
                            statement: idea.statement ? idea.statement.substring(0, 200) : '',
                          })),
                        };
                        this.cdr.markForCheck();
                      }
                    },
                  });
              });
              this.cdr.markForCheck();
            }
          },
        });
    }

    this.filterOptions();

    if (this.vote.reminderTime) {
      this.reminder = true;
      this.setReminderOptions();
    }
  }

  canEditDescription(): boolean {
    if (typeof this.TopicService.canEditDescription === 'function') {
      return this.TopicService.canEditDescription(this.topic);
    }
    return true;
  }

  setTab(tab: number): void {
    this.tabActive.set(tab);
    this.cdr.markForCheck();
  }

  toggleOption(option: string): void {
    switch (option.toLowerCase()) {
      case 'yes':
        if (!this.canEditDescription()) return;
        this.predefinedOptions.yes.enabled = !this.predefinedOptions.yes.enabled;
        break;
      case 'no':
        if (!this.canEditDescription()) return;
        this.predefinedOptions.no.enabled = !this.predefinedOptions.no.enabled;
        break;
      case 'neutral':
        this.extraOptions.neutral.enabled = !this.extraOptions.neutral.enabled;
        break;
      case 'veto':
        this.extraOptions.veto.enabled = !this.extraOptions.veto.enabled;
        break;
    }
    this.filterOptions();
    this.cdr.markForCheck();
  }

  setVoteType(voteType: 'regular' | 'multiple' | 'ideation'): void {
    if (!this.canEditDescription()) return;
    if (voteType === this.VOTE_TYPES.multiple || voteType === this.VOTE_TYPES.ideation) {
      this.vote.type = voteType;
      if (!this.vote.options.length) {
        this.vote.maxChoices = 1;
      }
    } else {
      this.vote.type = this.VOTE_TYPES.regular;
      this.vote.maxChoices = 1;
      this.vote.minChoices = 1;
    }
    this.filterOptions();
    this.cdr.markForCheck();
  }

  addOption(): void {
    this.customOptions.push({ value: '' });
    this.cdr.markForCheck();
  }

  removeOption(key: number): void {
    this.customOptions.splice(key, 1);
    this.filterOptions();
    this.cdr.markForCheck();
  }

  optionsCountUp(type?: string): void {
    const options = this.vote.options.filter((option) => !!option.value);
    let count = options.length;
    if (this.extraOptions.neutral.enabled) count = count - 1;
    if (this.extraOptions.veto.enabled) count = count - 1;
    if (type === 'min' && this.vote.minChoices < count) {
      this.vote.minChoices++;
      if (this.vote.minChoices > this.vote.maxChoices) {
        this.vote.maxChoices = this.vote.minChoices;
      }
    } else if (type !== 'min' && this.vote.maxChoices < count) {
      this.vote.maxChoices++;
    }
    this.cdr.markForCheck();
  }

  optionsCountDown(type?: string): void {
    if (type === 'min' && this.vote.minChoices > 1) {
      this.vote.minChoices--;
    } else if (type !== 'min' && this.vote.maxChoices > 1) {
      this.vote.maxChoices--;
      if (this.vote.minChoices > this.vote.maxChoices) {
        this.vote.minChoices = this.vote.maxChoices;
      }
    }
    this.cdr.markForCheck();
  }

  getOptionsLimit(): number {
    let count = this.vote.options.length;
    if (this.extraOptions.neutral.enabled) count = count - 1;
    if (this.extraOptions.veto.enabled) count = count - 1;

    if (this.vote.maxChoices > count && count > 0) this.vote.maxChoices = count;
    if (this.vote.minChoices > count && count > 0) this.vote.minChoices = count;
    return count;
  }

  toggleDeadline(): void {
    if (!this.deadline) {
      this.endsAt.h = new Date().getHours();
      this.endsAt.min = Math.ceil(new Date().getMinutes() / 5) * 5;
      this.setEndsAtTime();
    } else {
      this.deadline = null;
      this.vote.endsAt = null;
    }
    this.cdr.markForCheck();
  }

  minHours(): number {
    if (this.endsAt.date && new Date(this.endsAt.date).getDate() === new Date().getDate()) {
      return new Date().getHours();
    }
    return 1;
  }

  minMinutes(): number {
    if (this.endsAt.date && new Date(this.endsAt.date).getDate() === new Date().getDate()) {
      return Math.ceil(new Date().getMinutes() / 5) * 5;
    }
    return 0;
  }

  setEndsAtTime(): void {
    this.endsAt.date = this.endsAt.date || new Date();
    this.deadline = new Date(this.endsAt.date);
    if (Number(this.endsAt.h) === 0 && Number(this.endsAt.min) === 0) {
      this.deadline = new Date(this.deadline.setDate(this.deadline.getDate() + 1));
    }

    let hour = Number(this.endsAt.h);
    if (this.endsAt.timeFormat === 'PM') {
      hour += 12;
    }
    this.deadline.setHours(hour);
    this.deadline.setMinutes(Number(this.endsAt.min));
    this.vote.endsAt = this.deadline;
    this.daysToVoteEnd();
    this.setReminderOptions();
    this.cdr.markForCheck();
  }

  daysToVoteEnd(): number {
    if (this.deadline) {
      this.numberOfDaysLeft = Math.ceil(
        (new Date(this.deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
      );
    }
    return this.numberOfDaysLeft;
  }

  formatTime(val: number | string): number | string {
    if (parseInt(val.toString(), 10) < 10) {
      val = '0' + parseInt(val.toString(), 10);
    }
    return val;
  }

  timeFormatDisabled(): boolean {
    if (!this.deadline) return false;
    const now = new Date();
    const d = new Date(this.deadline);
    if (
      new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() ===
      new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    ) {
      if (d.getHours() > 12) {
        return true;
      }
    }
    return false;
  }

  setTimeFormat(): void {
    this.HCount = 23;
    if (this.endsAt.timeFormat !== 24) {
      this.HCount = 12;
      if (Number(this.endsAt.h) > 12) {
        this.endsAt.h = Number(this.endsAt.h) - 12;
      }
    }
    this.setEndsAtTime();
  }

  setReminderOptions(): void {
    this.reminderOptions = [];
    if (!this.deadline) return;
    const now = new Date();
    this.reminderOptionsList.forEach((item) => {
      const timeItem = new Date(this.deadline!);
      switch (item.unit) {
        case 'weeks':
          timeItem.setDate(timeItem.getDate() + 1 - item.value * 7);
          break;
        case 'month':
          timeItem.setMonth(timeItem.getMonth() - item.value);
          break;
        default:
          timeItem.setDate(timeItem.getDate() + 1 - item.value);
      }
      if (
        timeItem > now &&
        (timeItem.getDate() !== now.getDate() ||
          (timeItem.getDate() === now.getDate() &&
            (timeItem.getFullYear() !== now.getFullYear() || timeItem.getMonth() !== now.getMonth())))
      ) {
        this.reminderOptions.push(item);
      }
    });
  }

  selectedReminderOption(): string {
    if (!this.deadline) return '';
    const voteDeadline = new Date(this.deadline);
    const rem = new Date(this.vote.reminderTime || '');
    const diffTime = voteDeadline.getTime() - rem.getTime();
    const days = Math.ceil(diffTime / (1000 * 3600 * 24));
    const weeks = Math.ceil(diffTime / (1000 * 3600 * 24 * 7));
    const months =
      voteDeadline.getMonth() - rem.getMonth() + 12 * (voteDeadline.getFullYear() - rem.getFullYear());

    let item = this.reminderOptions.find((opt) => {
      if (opt.value === days && opt.unit === 'days') return true;
      if (opt.value === weeks && opt.unit === 'weeks') return true;
      if (opt.value === months && opt.unit === 'month') return true;
      return false;
    });

    if (!item && this.reminderOptions.length) {
      item = this.reminderOptions[0];
      this.setVoteReminder(item);
    }
    if (item) {
      return this.translate.instant('OPTION_' + item.value + '_' + item.unit.toUpperCase());
    }
    return '';
  }

  setVoteReminder(time: ReminderOption): void {
    if (!this.deadline) return;
    const reminderTime = new Date(this.deadline);
    switch (time.unit) {
      case 'weeks':
        reminderTime.setDate(reminderTime.getDate() - time.value * 7);
        break;
      case 'month':
        reminderTime.setMonth(reminderTime.getMonth() - time.value);
        break;
      default:
        reminderTime.setDate(reminderTime.getDate() - time.value);
    }
    this.vote.reminderTime = reminderTime;
    this.cdr.markForCheck();
  }

  filterOptions(): void {
    const options: VoteOptionItem[] = [];
    if (this.vote.type === this.VOTE_TYPES.regular) {
      this.vote.options = [];
      for (const key of ['yes', 'no'] as const) {
        const option = this.predefinedOptions[key];
        if (option.enabled) {
          options.push({ value: option.value });
        }
      }
    } else if (this.vote.type === this.VOTE_TYPES.ideation) {
      this.optionIdeas.forEach((idea) => {
        if (idea.statement) {
          options.push({ value: idea.statement, ideaId: idea.id });
        }
      });
    } else {
      for (const opt of this.customOptions) {
        if (opt.value && opt.value.trim()) {
          options.push({ value: opt.value.trim() });
        }
      }
    }
    for (const key of ['neutral', 'veto'] as const) {
      const option = this.extraOptions[key];
      if (option.enabled) {
        options.push({ value: option.value });
      }
    }
    this.vote.options = [...options];
  }

  displayOptInput(option: VoteOptionItem): boolean {
    return Object.keys(this.extraOptions).indexOf(option.value?.toLowerCase()) === -1;
  }

  toggleDelegation($event?: Event): void {
    if ($event && ($event.target as HTMLElement)?.nodeName === 'INPUT') {
      return;
    }
    if (!this.canEditDescription() || this.vote.authType === this.VOTE_AUTH_TYPES.hard) {
      return;
    }
    this.vote.delegationIsAllowed = !this.vote.delegationIsAllowed;
    this.cdr.markForCheck();
  }

  drop(event: CdkDragDrop<VoteOptionItem[]>): void {
    moveItemInArray(this.customOptions, event.previousIndex, event.currentIndex);
    this.filterOptions();
    this.cdr.markForCheck();
  }

  toggleFolderIdeas(folder: IdeationFolder): void {
    const folderIndex = this.folderIdeasShown.indexOf(folder.id);
    if (folderIndex > -1) {
      this.folderIdeasShown.splice(folderIndex, 1);
    } else {
      this.folderIdeasShown.push(folder.id);
    }
    this.cdr.markForCheck();
  }

  isShowFolderIdeas(folder: IdeationFolder): boolean {
    return this.folderIdeasShown.indexOf(folder.id) > -1;
  }

  orderIdeas(): void {
    this.ideaOrder = this.ideaOrder === 'desc' ? 'asc' : 'desc';
    this.ideasList = [...this.ideasList].reverse();
    this.cdr.markForCheck();
  }

  ideaSelected(idea: Idea): boolean {
    return this.optionIdeas.some((item) => item.id === idea.id);
  }

  toggleFolder(folder: IdeationFolder, _event?: Event): void {
    if (folder.ideas?.rows) {
      folder.ideas.rows.forEach((idea: Idea) => {
        const index = this.optionIdeas.findIndex((item) => item.id === idea.id);
        if (index === -1) {
          this.optionIdeas.push(idea);
        } else {
          this.optionIdeas.splice(index, 1);
        }
      });
      this.filterOptions();
      this.cdr.markForCheck();
    }
  }

  folderSelected(folder: IdeationFolder): boolean {
    if (!folder.ideas?.rows?.length) return false;
    return folder.ideas.rows.every((idea) => this.optionIdeas.some((item) => item.id === idea.id));
  }

  toggleIdea(idea: Idea, $event?: Event): void {
    $event?.stopPropagation();
    const index = this.optionIdeas.findIndex((item) => item.id === idea.id);
    if (index === -1) {
      this.optionIdeas.push(idea);
    } else {
      this.optionIdeas.splice(index, 1);
    }
    this.filterOptions();
    this.cdr.markForCheck();
  }

  toggleAllIdeas(ideas: Idea[]): void {
    const allChecked = this.optionIdeas.length === ideas.length;
    if (!allChecked) {
      ideas.forEach((idea) => {
        const index = this.optionIdeas.findIndex((item) => item.id === idea.id);
        if (index === -1) this.optionIdeas.push(idea);
      });
    } else {
      this.optionIdeas = [];
    }
    this.filterOptions();
    this.cdr.markForCheck();
  }

  allChecked(): boolean {
    return this.ideasCount > 0 && this.optionIdeas.length === this.ideasCount;
  }

  isNextDisabled(): boolean {
    const active = this.tabActive();
    if (active === 2 && (!this.vote.type || !this.vote.description?.trim())) return true;
    if (active === 3 && (!this.vote.authType || this.vote.options.length < 2)) return true;
    return false;
  }

  tabNext(): void {
    const active = this.tabActive();
    if (active === 2 && (!this.vote.type || !this.vote.description?.trim())) return;
    if (active >= 3) this.filterOptions();
    if (active < 4) {
      if (this.isNextDisabled()) return;
      this.tabActive.set(active + 1);
      this.cdr.markForCheck();
    } else {
      this.createVote();
    }
  }

  createVote(): void {
    this.filterOptions();
    this.notification.clear();

    if (!this.reminder) {
      this.vote.reminderTime = null;
    }

    if (this.deadline) {
      this.vote.endsAt = this.deadline;
    }

    const saveVote = {
      ...this.vote,
      topicId: this.topicId || this.topic.id,
      autoClose: this.CONF.autoClose,
      type: this.vote.type === this.VOTE_TYPES.ideation ? this.VOTE_TYPES.multiple : this.vote.type,
    };

    if (!saveVote.description?.trim()) {
      this.notification.error('VIEWS.VOTE_CREATE.ERROR_MISSING_QUESTION');
      return;
    }

    this.voteService
      .save(saveVote)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.TopicService.reloadTopic();
          const lang = this.translate.currentLang || 'en';
          this.router.navigate(['/', lang, 'topics', this.topic.id], { fragment: 'voting' });
          this.notification.success('VIEWS.VOTE_CREATE.SUCCESS_VOTE_STARTED');
          this.dialogRef.close(true);
        },
        error: (res: unknown) => {
          const errObj = res as {
            errors?: Record<string, string>;
            error?: { errors?: Record<string, string>; status?: { message?: string } };
            status?: { message?: string };
            message?: string;
          };
          const errs = errObj?.errors || errObj?.error?.errors;
          if (errs && typeof errs === 'object' && Object.keys(errs).length > 0) {
            this.errors = errs;
            Object.values(errs).forEach((message) => {
              if (typeof message === 'string') {
                this.notification.showRaw('error', message);
              }
            });
          } else {
            const msg = errObj?.error?.status?.message || errObj?.status?.message || errObj?.message;
            if (typeof msg === 'string' && msg.trim().length > 0) {
              this.notification.showRaw('error', msg);
            } else {
              this.notification.error('MSG_ERROR_HTTP_500');
            }
          }
          this.cdr.markForCheck();
        },
      });
  }
}
