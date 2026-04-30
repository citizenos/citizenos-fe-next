import { Component, inject, ChangeDetectionStrategy, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';
import { DialogCloseDirective } from '../../../../../shared/dialog/dialog-ref';
import { UserStore } from '../../../../../core/state/user.store';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-topic-vote-reminder-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, DatePipe, DialogCloseDirective, IconComponent],
  templateUrl: './topic-vote-reminder-dialog.component.html'
})
export class TopicVoteReminderDialogComponent {
  data = inject<{ topic: any; vote: any }>(DIALOG_DATA);
  private userStore = inject(UserStore);

  user = computed(() => this.userStore.user());
  today = new Date();

  daysLeft = computed(() => {
    if (!this.data.vote.endsAt) return null;
    const diff = new Date(this.data.vote.endsAt).getTime() - this.today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  });
}
