import { Component, ChangeDetectionStrategy, inject, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { Topic } from '../../../../../core/interfaces/topic';
import { TopicService } from '../../../../../core/services/topic.service';
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
  members = input.required<any[]>();

  readonly topicService = inject(TopicService);
  private dialogService = inject(DialogService);

  manageParticipants(): void {
    // ilmar-249: open TopicParticipantsComponent dialog once migrated
  }

  inviteMembers(): void {
    this.dialogService.open(TopicInviteDialogComponent, {
      data: { topic: this.topic() }
    });
  }
}
