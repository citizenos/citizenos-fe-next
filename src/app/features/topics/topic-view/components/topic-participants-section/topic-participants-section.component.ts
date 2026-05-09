import { Component, ChangeDetectionStrategy, inject, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { Topic } from '../../../../../core/interfaces/topic';
import { TopicService } from '../../../../../core/services/topic.service';
import { TopicMemberUser } from '../../../../../core/services/topic-member-user.service';
import { DialogService } from '../../../../../shared/dialog/dialog.service';
import { TopicInviteDialogComponent } from '../topic-invite-dialog/topic-invite-dialog.component';
import { InitialsComponent } from '../../../../../shared/components/initials/initials.component';

@Component({
  selector: 'app-topic-participants-section',
  standalone: true,
  imports: [TranslateModule, InitialsComponent],
  templateUrl: './topic-participants-section.component.html',
  styleUrls: ['./topic-participants-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopicParticipantsSectionComponent {
  topic = input.required<Topic>();
  members = input.required<TopicMemberUser[]>();

  readonly topicService = inject(TopicService);
  private dialogService = inject(DialogService);

  manageParticipants(): void {
    import('../topic-participants/topic-participants.component').then(m => {
      this.dialogService.open(m.TopicParticipantsComponent, { data: { topic: this.topic() } });
    });
  }

  inviteMembers(): void {
    this.dialogService.open(TopicInviteDialogComponent, {
      data: { topic: this.topic() }
    });
  }
}
