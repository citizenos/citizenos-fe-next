import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { UpperCasePipe, DatePipe } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { A11yModule } from '@angular/cdk/a11y';
import { FormsModule } from '@angular/forms';
import { take } from 'rxjs';
import { Topic, TopicGroup } from '../../../../../core/interfaces/topic';
import { TopicService } from '../../../../../core/services/topic.service';
import { TopicVoteService } from '../../../../../core/services/topic-vote.service';
import { TopicMemberUserService } from '../../../../../core/services/topic-member-user.service';
import { DialogService, DIALOG_DATA, DialogRef } from '../../../../../shared/dialog';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { ToggleComponent } from '../../../../../shared/components/toggle/toggle.component';
import { DropdownComponent } from '../../../../../shared/components/dropdown/dropdown.component';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { TooltipComponent } from '../../../../../shared/components/tooltip/tooltip.component';
import { TopicVoteDeadlineComponent } from '../topic-vote-deadline/topic-vote-deadline.component';

export interface TopicSettingsData {
  topic: Topic;
}

@Component({
  selector: 'cos-topic-settings',
  standalone: true,
  imports: [
    UpperCasePipe,
    DatePipe,
    TranslateModule,
    FormsModule,
    ButtonComponent,
    ToggleComponent,
    DropdownComponent,
    IconComponent,
    A11yModule,
    TooltipComponent
  ],
  templateUrl: './topic-settings.component.html',
  styleUrls: ['./topic-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopicSettingsComponent implements OnInit {
  private dialogData = inject<TopicSettingsData>(DIALOG_DATA);
  public dialogRef = inject(DialogRef<TopicSettingsComponent>);
  private topicService = inject(TopicService);
  private topicVoteService = inject(TopicVoteService);
  private topicMemberUserService = inject(TopicMemberUserService);
  private translate = inject(TranslateService);
  private dialog = inject(DialogService);

  topic = signal<Topic>({ ...this.dialogData.topic });
  groups = signal<TopicGroup[]>([]);
  tabSelected = signal('settings');
  errors = signal<Record<string, string>>({});
  
  VISIBILITY = this.topicService.VISIBILITY;
  CATEGORIES = Object.keys(this.topicService.CATEGORIES);
  
  reminder = signal(false);
  reminderOptions = [
    { value: 1, unit: 'days' },
    { value: 2, unit: 'days' },
    { value: 3, unit: 'days' },
    { value: 1, unit: 'weeks' },
    { value: 2, unit: 'weeks' },
    { value: 1, unit: 'month' }
  ];

  ngOnInit(): void {
    const t = this.topic();
    if (t.voteId) {
      this.topicVoteService.get({ topicId: t.id, voteId: t.voteId })
        .pipe(take(1))
        .subscribe((vote) => {
          this.topic.update(current => ({ ...current, vote: vote as unknown as Topic['vote'] }));
          if (vote.reminderTime && !vote.reminderSent) {
            this.reminder.set(true);
          }
        });
    }

    this.topicService.loadGroups(t.id).pipe(take(1)).subscribe((groups) => {
      this.groups.set(groups);
    });
  }

  canEdit() {
    return this.topicService.canEdit(this.topic());
  }

  canDelete() {
    return this.topicService.canDelete(this.topic());
  }

  canSendToFollowUp() {
    return this.topicService.canSendToFollowUp(this.topic());
  }

  canLeave() {
    return this.topicService.canLeave();
  }

  selectTab(tab: string) {
    this.tabSelected.set(tab);
  }

  canChangeVisibility() {
    const t = this.topic();
    const hasPublicGroup = this.groups().some(g => g.visibility === 'public');

    return this.canDelete() && (t.visibility === this.VISIBILITY.private || !hasPublicGroup);
  }

  selectedReminderOption = computed(() => {
    const t = this.topic();
    const r = this.reminder();
    if (!r || !t.vote?.endsAt || !t.vote?.reminderTime) return null;

    const voteDeadline = new Date(t.vote.endsAt);
    const reminderDate = new Date(t.vote.reminderTime);
    const diffTime = voteDeadline.getTime() - reminderDate.getTime();
    const dayTime = 1000 * 3600 * 24;
    
    const days = Math.ceil(diffTime / dayTime);
    const weeks = Math.ceil(diffTime / (dayTime * 7));
    const months = (voteDeadline.getFullYear() - reminderDate.getFullYear()) * 12 + (voteDeadline.getMonth() - reminderDate.getMonth());

    const item = this.reminderOptions.find((opt) => {
      if (opt.unit === 'days' && opt.value === days) return true;
      if (opt.unit === 'weeks' && opt.value === weeks) return true;
      if (opt.unit === 'month' && opt.value === months) return true;
      return false;
    });

    if (item) {
      return this.translate.instant('OPTION_' + item.value + '_' + item.unit.toUpperCase());
    }
    return null;
  });

  isVisibleReminderOption(time: { value: number; unit: string }) {
    const t = this.topic();
    if (t.vote?.endsAt) {
      const timeItem = new Date(t.vote.endsAt);
      switch (time.unit) {
        case 'weeks':
          timeItem.setDate(timeItem.getDate() - (time.value * 7));
          break;
        case 'month':
          timeItem.setMonth(timeItem.getMonth() - time.value);
          break;
        default:
          timeItem.setDate(timeItem.getDate() - time.value);
      }
      return timeItem > new Date();
    }
    return false;
  }

  setVoteReminder(time: { value: number; unit: string }) {
    const t = this.topic();
    if (t.vote) {
      const deadline = t.vote.endsAt || new Date();
      const reminderTime = new Date(deadline);
      switch (time.unit) {
        case 'weeks':
          reminderTime.setDate(reminderTime.getDate() - (time.value * 7));
          break;
        case 'month':
          reminderTime.setMonth(reminderTime.getMonth() - time.value);
          break;
        default:
          reminderTime.setDate(reminderTime.getDate() - time.value);
      }
      
      const voteUpdate = { 
        topicId: t.id, 
        voteId: t.voteId!, 
        reminderTime 
      };
      
      this.topicVoteService.update(voteUpdate).pipe(take(1)).subscribe((res) => {
        this.topic.update(current => ({
          ...current,
          vote: { ...current.vote!, reminderTime: res.reminderTime }
        }));
      });
    }
  }

  openSetDeadline() {
    const t = this.topic();
    if (t.vote) {
      this.dialog.open(TopicVoteDeadlineComponent, {
        data: {
          vote: t.vote,
          topic: t
        }
      });
    }
  }

  doLeaveTopic() {
    this.topicMemberUserService.doLeaveTopic(this.topic(), [this.translate.currentLang, 'my', 'topics']);
  }

  doDeleteTopic() {
    this.topicService.doDeleteTopic(this.topic(), [this.translate.currentLang, 'my', 'topics']);
  }

  addTopicCategory(category: string) {
    this.topic.update(t => {
      if (t.categories.indexOf(category) === -1 && t.categories.length < this.topicService.CATEGORIES_COUNT_MAX) {
        return { ...t, categories: [...t.categories, category] };
      }
      return t;
    });
  }

  removeTopicCategory(category: string) {
    this.topic.update(t => ({
      ...t,
      categories: t.categories.filter(c => c !== category)
    }));
  }

  doSaveTopic() {
    this.errors.set({});
    const t = this.topic();
    const topicUpdate: Partial<Topic> & { endsAt?: string | null } = { ...t };
    
    // Cleanup as in legacy
    if (topicUpdate.endsAt) delete topicUpdate.endsAt;

    this.topicService.update(topicUpdate as Topic)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: (errorResponse) => {
          if (errorResponse.errors) {
            this.errors.set(errorResponse.errors);
          }
        }
      });
  }
}
