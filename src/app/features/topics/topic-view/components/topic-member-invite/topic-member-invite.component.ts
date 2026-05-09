import { Component, ChangeDetectionStrategy, input, output, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { take } from 'rxjs';

import { Topic } from '../../../../../core/interfaces/topic';
import { TopicInviteUserService, TopicInvite } from '../../../../../core/services/topic-invite-user.service';
import { DialogService } from '../../../../../shared/dialog/dialog.service';
import { InitialsComponent } from '../../../../../shared/components/initials/initials.component';
import { CosDropdownDirective } from '../../../../../shared/directives/cos-dropdown.directive';
import { TopicMemberInviteDeleteComponent } from '../topic-member-invite-delete/topic-member-invite-delete.component';

@Component({
  selector: 'app-topic-member-invite',
  standalone: true,
  imports: [
    TranslateModule,
    DatePipe,
    UpperCasePipe,
    InitialsComponent,
    CosDropdownDirective,
  ],
  templateUrl: './topic-member-invite.component.html',
  styleUrls: ['./topic-member-invite.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicMemberInviteComponent {
  topic = input.required<Topic>();
  invite = input.required<TopicInvite>();
  fields = input<string[]>();

  deleteAllInvitesForUser = output<string>();

  private topicInviteUserService = inject(TopicInviteUserService);
  private dialogService = inject(DialogService);

  now(): Date {
    return new Date();
  }

  isExpired(expiresAt: string): boolean {
    return new Date(expiresAt) < new Date();
  }

  doDeleteInviteUser(): void {
    this.dialogService
      .open(TopicMemberInviteDeleteComponent, {
        data: { user: this.invite().user },
      })
      .afterClosed()
      .pipe(take(1))
      .subscribe((result) => {
        if (result === 'all') {
          this.deleteAllInvitesForUser.emit(this.invite().user.id);
        } else if (result === '1') {
          this.topicInviteUserService
            .delete(this.topic().id, this.invite().id)
            .pipe(take(1))
            .subscribe();
        }
      });
  }
}
