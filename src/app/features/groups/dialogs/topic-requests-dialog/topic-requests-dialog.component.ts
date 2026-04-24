import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DIALOG_DATA } from '../../../../shared/dialog/dialog-tokens';
import { DialogRef } from '../../../../shared/dialog/dialog-ref';
import { DialogCloseDirective } from '../../../../shared/dialog';
import { GroupRequestTopicService } from '../../../../core/services/group-request-topic.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Group } from '../../../../core/interfaces/group';
import { take } from 'rxjs';

@Component({
  selector: 'cos-topic-requests-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, DialogCloseDirective],
  templateUrl: './topic-requests-dialog.component.html',
  styleUrls: ['./topic-requests-dialog.component.scss'],
})
export class TopicRequestsDialogComponent {
  private data = inject<{ group: Group }>(DIALOG_DATA);
  private dialogRef = inject(DialogRef);
  private requestService = inject(GroupRequestTopicService);
  private notification = inject(NotificationService);

  group = this.data.group;
  requests = signal<any[]>([]);

  constructor() {
    this.loadRequests();
  }

  private loadRequests() {
    this.requestService.getRequests(this.group.id).pipe(take(1)).subscribe(res => {
      this.requests.set(res.rows);
    });
  }

  accept(request: any) {
    this.requestService.accept(this.group.id, request.id).pipe(take(1)).subscribe(() => {
      this.notification.success('COMPONENTS.TOPIC_REQUESTS.MSG_ACCEPT_SUCCESS');
      this.requests.update(r => r.filter(x => x.id !== request.id));
    });
  }

  reject(request: any) {
    this.requestService.reject(this.group.id, request.id).pipe(take(1)).subscribe(() => {
      this.notification.success('COMPONENTS.TOPIC_REQUESTS.MSG_REJECT_SUCCESS');
      this.requests.update(r => r.filter(x => x.id !== request.id));
    });
  }
}
