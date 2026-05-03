import { Component, ChangeDetectionStrategy, input, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { UpperCasePipe } from '@angular/common';
import { take } from 'rxjs';

import { Topic } from '../../../../../core/interfaces/topic';
import { TopicService } from '../../../../../core/services/topic.service';
import { TopicMemberGroupService } from '../../../../../core/services/topic-member-group.service';
import { DialogService } from '../../../../../shared/dialog/dialog.service';
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { InitialsComponent } from '../../../../../shared/components/initials/initials.component';
import { CosDropdownDirective } from '../../../../../shared/directives/cos-dropdown.directive';

@Component({
  selector: 'app-topic-member-group',
  standalone: true,
  imports: [
    RouterModule,
    TranslateModule,
    UpperCasePipe,
    InitialsComponent,
    CosDropdownDirective,
  ],
  templateUrl: './topic-member-group.component.html',
  styleUrls: ['./topic-member-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicMemberGroupComponent {
  topic = input.required<Topic>();
  group = input.required<any>();
  canUpdate = input<any>();
  fields = input<any>();

  readonly topicService = inject(TopicService);
  private topicMemberGroupService = inject(TopicMemberGroupService);
  private dialogService = inject(DialogService);

  readonly groupLevels = Object.values(this.topicService.LEVELS);

  readonly groupLevel = signal<string>('');

  ngOnInit() {
    this.groupLevel.set(this.group().level);
  }

  doUpdateMemberGroup(level: string): void {
    if (level === this.groupLevel()) return;
    this.groupLevel.set(level);
    this.topicMemberGroupService
      .update({ topicId: this.topic().id, groupId: this.group().id, level })
      .pipe(take(1))
      .subscribe();
  }

  doDeleteMemberGroup(): void {
    this.dialogService
      .open(ConfirmDialogComponent, {
        data: {
          level: 'delete',
          heading: 'MODALS.TOPIC_MEMBER_GROUP_DELETE_CONFIRM_HEADING',
          description: 'MODALS.TOPIC_MEMBER_GROUP_DELETE_CONFIRM_TXT_ARE_YOU_SURE',
          confirmBtn: 'MODALS.TOPIC_MEMBER_GROUP_DELETE_CONFIRM_BTN_YES',
          closeBtn: 'MODALS.TOPIC_MEMBER_GROUP_DELETE_CONFIRM_BTN_NO',
        },
      })
      .afterClosed()
      .pipe(take(1))
      .subscribe((result) => {
        if (result === true) {
          this.topicMemberGroupService
            .delete({
              topicId: this.topic().id,
              groupId: this.group().userId || this.group().id,
            })
            .pipe(take(1))
            .subscribe();
        }
      });
  }
}
