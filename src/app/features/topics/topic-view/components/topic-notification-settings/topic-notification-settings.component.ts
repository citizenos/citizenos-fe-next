import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { map, take, catchError, EMPTY } from 'rxjs';
import { A11yModule } from '@angular/cdk/a11y';

import { TopicNotificationService } from '../../../../../core/services/topic-notification.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { TopicService } from '../../../../../core/services/topic.service';
import { DialogService } from '../../../../../shared/dialog/dialog.service';
import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { ToggleComponent } from '../../../../../shared/components/toggle/toggle.component';
import { NotificationPreferences } from '../../../../../core/interfaces/notification-preferences';
import { Topic } from '../../../../../core/interfaces/topic';

@Component({
  selector: 'app-topic-notification-settings',
  standalone: true,
  imports: [CommonModule, TranslateModule, IconComponent, ToggleComponent, A11yModule],
  templateUrl: './topic-notification-settings.component.html',
  styleUrls: ['./topic-notification-settings.component.scss']
})
export class TopicNotificationSettingsComponent implements OnInit {
  private topicNotificationService = inject(TopicNotificationService);
  private notificationService = inject(NotificationService);
  private topicService = inject(TopicService);
  private dialogService = inject(DialogService);
  public data = inject<{ topicId: string }>(DIALOG_DATA);

  topic = signal<Topic | null>(null);
  allowNotifications = signal(false);
  
  private static readonly DEFAULT_PREFERENCES: NotificationPreferences = {
    Topic: false,
    Discussion: false,
    DiscussionComment: false,
    TopicDiscussion: false,
    CommentVote: false,
    TopicReport: false,
    TopicVoteList: false,
    TopicEvent: false,
    Ideation: false,
    Idea: false,
    IdeaVote: false,
    TopicIdeation: false,
    IdeaComment: false,
    IdeaReport: false,
    CommentReport: false
  };

  preferences = signal<NotificationPreferences>({ ...TopicNotificationSettingsComponent.DEFAULT_PREFERENCES });

  allChecked = computed(() => {
    const prefs = this.preferences();
    return Object.values(prefs).every(v => v === true);
  });

  ngOnInit(): void {
    if (this.data.topicId) {
      this.topicService.get(this.data.topicId).pipe(take(1)).subscribe(topic => {
        this.topic.set(topic);
      });

      this.topicNotificationService.get(this.data.topicId).pipe(take(1)).subscribe({
        next: (settings: any) => {
          this.allowNotifications.set(settings.allowNotifications);
          this.preferences.set({ ...TopicNotificationSettingsComponent.DEFAULT_PREFERENCES, ...settings.preferences });
        },
        error: (err) => {
          console.error('Error loading notification settings', err);
        }
      });
    }
  }

  toggleAllNotifications() {
    const currentState = this.allChecked();
    const newState = !currentState;
    
    const newPrefs = { ...this.preferences() };
    Object.keys(newPrefs).forEach((key) => {
      newPrefs[key as keyof NotificationPreferences] = newState;
    });
    
    this.preferences.set(newPrefs);
    if (newState) {
      this.allowNotifications.set(true);
    }
  }

  selectOption(options: string | string[]) {
    const optionList = Array.isArray(options) ? options : [options];
    const newPrefs = { ...this.preferences() };
    
    optionList.forEach((option) => {
      newPrefs[option as keyof NotificationPreferences] = !newPrefs[option as keyof NotificationPreferences];
      if (newPrefs[option as keyof NotificationPreferences]) {
        this.allowNotifications.set(true);
      }
    });
    
    this.preferences.set(newPrefs);
  }

  doSaveSettings() {
    const topicId = this.data.topicId;
    const request$ = !this.allowNotifications()
      ? this.topicNotificationService.delete(topicId)
      : this.topicNotificationService.update(topicId, {
          allowNotifications: this.allowNotifications(),
          preferences: this.preferences()
        });

    request$.pipe(
      take(1),
      catchError(error => {
        console.error('Error saving notification settings', error);
        this.notificationService.error('MODALS.TOPIC_NOTIFICATION_SETTINGS_ERROR_SAVE');
        return EMPTY;
      })
    ).subscribe(() => {
      this.dialogService.closeAll();
    });
  }
}
