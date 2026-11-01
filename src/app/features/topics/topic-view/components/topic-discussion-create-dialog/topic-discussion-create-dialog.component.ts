import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { of, switchMap, take } from 'rxjs';
import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';
import { DialogCloseDirective, DialogRef } from '../../../../../shared/dialog/dialog-ref';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { DeadlinePickerComponent } from '../../../../../shared/components/deadline-picker/deadline-picker.component';
import { NotificationComponent } from '../../../../../shared/components/notification/notification.component';
import { CosDropdownDirective } from '../../../../../shared/directives/cos-dropdown.directive';
import { TopicDiscussionService } from '../../../../../core/services/topic-discussion.service';
import { TopicService } from '../../../../../core/services/topic.service';
import { Topic } from '../../../../../core/interfaces/topic';
import { DiscussionData } from '../../../../../core/interfaces/discussion';

export interface TopicDiscussionCreateData {
  topic: Topic;
}

@Component({
  selector: 'cos-topic-discussion-create-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslateModule,
    FormsModule,
    DialogCloseDirective,
    IconComponent,
    InputComponent,
    DeadlinePickerComponent,
    NotificationComponent,
    CosDropdownDirective
  ],
  templateUrl: './topic-discussion-create-dialog.component.html',
  styleUrl: './topic-discussion-create-dialog.component.scss',
})
export class TopicDiscussionCreateDialogComponent {
  private data = inject<TopicDiscussionCreateData>(DIALOG_DATA);
  protected dialogRef = inject(DialogRef);
  private discussionService = inject(TopicDiscussionService);
  private topicService = inject(TopicService);

  topic = this.data.topic;
  tabs = [1, 2];
  activeTab = signal(1);
  question = signal('');
  deadline = signal<Date | null>(null);

  selectTab(tab: number) {
    this.activeTab.set(tab);
  }

  onDeadlineChange(date: Date | null) {
    this.deadline.set(date);
  }

  isNextDisabled(): boolean {
    return this.activeTab() === 2 && !this.question().trim();
  }

  tabNext() {
    if (this.isNextDisabled()) return;
    if (this.activeTab() < this.tabs.length) {
      this.selectTab(this.activeTab() + 1);
    } else {
      this.save();
    }
  }

  save() {
    if (!this.question().trim()) return;
    const t = this.topic;
    const payload: DiscussionData = {
      topicId: t.id,
      question: this.question(),
      deadline: this.deadline()
    };

    const save$ = t.discussionId
      ? this.discussionService.update(t.id, t.discussionId, payload)
      : this.discussionService.create(t.id, payload);

    save$.pipe(
      switchMap(() => {
        if (this.topicService.patch && this.topicService.STATUSES?.inProgress && t.status !== this.topicService.STATUSES.inProgress) {
          return this.topicService.patch({ topicId: t.id, status: this.topicService.STATUSES.inProgress });
        }
        return of(null);
      }),
      take(1)
    ).subscribe({
      next: () => {
        this.topicService.reloadTopic();
        this.dialogRef.close(true);
      }
    });
  }
}
