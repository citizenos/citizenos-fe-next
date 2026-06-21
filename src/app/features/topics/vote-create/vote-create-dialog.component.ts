import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { take } from 'rxjs';

import { DIALOG_DATA, DialogRef, DialogCloseDirective } from '../../../shared/dialog';
import { TopicVoteService } from '../../../core/services/topic-vote.service';
import { NotificationService } from '../../../core/services/notification.service';
import { TopicService } from '../../../core/services/topic.service';

import { Topic } from '../../../core/interfaces/topic';
import { VoteWithOptions } from '../../../core/interfaces/vote';

import { IconComponent } from '../../../shared/components/icon/icon.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { NotificationComponent } from '../../../shared/components/notification/notification.component';
import { DeadlinePickerComponent } from '../../../shared/components/deadline-picker/deadline-picker.component';

@Component({
  selector: 'cos-vote-create-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslateModule,
    DialogCloseDirective,
    IconComponent,
    InputComponent,
    ButtonComponent,
    NotificationComponent,
    UpperCasePipe,
    DragDropModule,
    DeadlinePickerComponent
  ],
  templateUrl: './vote-create-dialog.component.html',
  styleUrls: ['./vote-create-dialog.component.scss'],
})
export class VoteCreateDialogComponent {
  private data = inject<{ topic: Topic }>(DIALOG_DATA);
  private dialogRef = inject(DialogRef);
  private voteService = inject(TopicVoteService);
  private topicService = inject(TopicService);
  private notification = inject(NotificationService);
  private router = inject(Router);
  private translate = inject(TranslateService);

  topic = this.data.topic;

  VOTE_TYPES = {
    regular: 'regular' as const,
    multiple: 'multiple' as const,
    ideation: 'ideation' as const
  };

  VOTE_AUTH_TYPES = {
    soft: 'soft' as const,
    hard: 'hard' as const
  };

  tabs = [0, 1, 2, 3];
  tabActive = signal<number>(1);

  vote = signal<Partial<VoteWithOptions>>({
    description: '',
    type: 'regular',
    authType: 'soft',
    options: [],
    minChoices: 1,
    maxChoices: 1,
    delegationIsAllowed: false,
    autoClose: [{ value: 'allMembersVoted', enabled: false }],
    endsAt: null,
  });

  predefinedOptions = signal({
    yes: { value: 'Yes', enabled: true },
    no: { value: 'No', enabled: true }
  });

  extraOptions = signal({
    neutral: { value: 'Neutral', enabled: false },
    veto: { value: 'Veto', enabled: false }
  });

  customOptions = signal<{value: string}[]>([
    { value: '' },
    { value: '' },
    { value: '' }
  ]);

  deadline = signal<Date | null>(null);

  compiledOptions = computed(() => {
    const opts: {value: string}[] = [];
    const v = this.vote();
    if (v.type === this.VOTE_TYPES.regular) {
      if (this.predefinedOptions().yes.enabled) opts.push({ value: 'Yes' });
      if (this.predefinedOptions().no.enabled) opts.push({ value: 'No' });
    } else {
      this.customOptions().forEach(o => {
        if (o.value.trim()) opts.push({ value: o.value.trim() });
      });
    }
    
    if (this.extraOptions().neutral.enabled) opts.push({ value: 'Neutral' });
    if (this.extraOptions().veto.enabled) opts.push({ value: 'Veto' });
    
    return opts;
  });

  getOptionsLimit() {
    let count = 0;
    if (this.vote().type === this.VOTE_TYPES.regular) {
      if (this.predefinedOptions().yes.enabled) count++;
      if (this.predefinedOptions().no.enabled) count++;
    } else {
      count = this.customOptions().filter(o => o.value.trim().length > 0).length;
    }
    
    if (this.extraOptions().neutral.enabled) count++;
    if (this.extraOptions().veto.enabled) count++;
    return count || 1;
  }

  updateVote<K extends keyof VoteWithOptions>(key: K, value: VoteWithOptions[K]) {
    this.vote.update(v => ({ ...v, [key]: value }));
  }

  setVoteType(type: string) {
    this.updateVote('type', type);
    if (type === this.VOTE_TYPES.regular) {
      this.updateVote('minChoices', 1);
      this.updateVote('maxChoices', 1);
    }
  }

  toggleOption(key: 'yes' | 'no') {
    this.predefinedOptions.update(opts => ({
      ...opts,
      [key]: { ...opts[key], enabled: !opts[key].enabled }
    }));
  }

  toggleExtraOption(key: 'neutral' | 'veto') {
    this.extraOptions.update(opts => ({
      ...opts,
      [key]: { ...opts[key], enabled: !opts[key].enabled }
    }));
  }

  updateCustomOption(index: number, value: string) {
    this.customOptions.update(opts => {
      const newOpts = [...opts];
      newOpts[index].value = value;
      return newOpts;
    });
  }

  addOption() {
    this.customOptions.update(opts => [...opts, { value: '' }]);
  }

  removeOption(index: number) {
    this.customOptions.update(opts => {
      const newOpts = [...opts];
      newOpts.splice(index, 1);
      return newOpts;
    });
  }

  drop(event: CdkDragDrop<{value: string}[]>) {
    this.customOptions.update(opts => {
      const newOpts = [...opts];
      moveItemInArray(newOpts, event.previousIndex, event.currentIndex);
      return newOpts;
    });
  }

  optionsCountUp(type: 'min' | 'max') {
    const limit = this.getOptionsLimit();
    if (type === 'min' && this.vote().minChoices! < limit) {
      const newVal = this.vote().minChoices! + 1;
      this.updateVote('minChoices', newVal);
      if (newVal > this.vote().maxChoices!) {
        this.updateVote('maxChoices', newVal);
      }
    } else if (type === 'max' && this.vote().maxChoices! < limit) {
      this.updateVote('maxChoices', this.vote().maxChoices! + 1);
    }
  }

  optionsCountDown(type: 'min' | 'max') {
    if (type === 'min' && this.vote().minChoices! > 1) {
      this.updateVote('minChoices', this.vote().minChoices! - 1);
    } else if (type === 'max' && this.vote().maxChoices! > 1) {
      const newVal = this.vote().maxChoices! - 1;
      this.updateVote('maxChoices', newVal);
      if (this.vote().minChoices! > newVal) {
        this.updateVote('minChoices', newVal);
      }
    }
  }

  onDeadlineChange(val: Date | null) {
    this.deadline.set(val);
  }

  getInputValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  getInputValueAsNumber(event: Event): number {
    return (event.target as HTMLInputElement).valueAsNumber;
  }

  isNextDisabled() {
    if (this.tabActive() === 2 && (!this.vote().type || !this.vote().description?.trim())) return true;
    if (this.tabActive() === 3 && (!this.vote().authType || this.compiledOptions().length < 2)) return true;
    return false;
  }

  tabNext() {
    if (this.isNextDisabled()) return;
    
    if (this.tabActive() < 4) {
      this.tabActive.set(this.tabActive() + 1);
    } else {
      this.createVote();
    }
  }

  createVote() {
    this.notification.clear();

    const saveVote = {
      ...this.vote(),
      topicId: this.topic.id,
      options: this.compiledOptions(),
      endsAt: this.deadline(),
    };

    if (saveVote.type === this.VOTE_TYPES.ideation) saveVote.type = this.VOTE_TYPES.multiple;
    
    if (!saveVote.description?.trim()) {
      this.notification.error('VIEWS.VOTE_CREATE.ERROR_MISSING_QUESTION');
      return;
    }

    this.voteService.save(saveVote)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.topicService.reloadTopic();
          this.router.navigate(['/', this.translate.currentLang, 'topics', this.topic.id], { fragment: 'voting' });
          this.notification.success('VIEWS.VOTE_CREATE.SUCCESS_VOTE_STARTED');
          this.dialogRef.close(true);
        },
        error: (res: { errors?: Record<string, unknown> }) => {
          if (res.errors) {
            Object.values(res.errors).forEach((message) => {
              if (typeof message === 'string') {
                this.notification.showRaw('error', message);
              }
            });
          }
        }
      });
  }
}
