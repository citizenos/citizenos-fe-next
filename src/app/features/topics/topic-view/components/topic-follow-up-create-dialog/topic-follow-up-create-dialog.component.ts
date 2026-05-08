import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';
import { DialogCloseDirective, DialogRef } from '../../../../../shared/dialog/dialog-ref';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { NotificationComponent } from '../../../../../shared/components/notification/notification.component';
import { TopicService } from '../../../../../core/services/topic.service';
import { Topic } from '../../../../../core/interfaces/topic';

@Component({
  selector: 'app-topic-follow-up-create-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, DialogCloseDirective, NotificationComponent, IconComponent],
  templateUrl: './topic-follow-up-create-dialog.component.html',
  styleUrl: './topic-follow-up-create-dialog.component.scss',
})
export class TopicFollowUpCreateDialogComponent {
  private topicService = inject(TopicService);
  private data = inject<{ topic: Topic }>(DIALOG_DATA);

  topic = this.data.topic;
  dialogRef = inject(DialogRef);

  startFollowUp() {
    return this.topicService.changeState(this.topic, 'followUp');
  }
}
