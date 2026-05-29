import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { Component, ChangeDetectionStrategy, input, inject, signal, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UpperCasePipe } from '@angular/common';
import { take } from 'rxjs';

import { Topic } from '../../../../../core/interfaces/topic';
import { TopicService } from '../../../../../core/services/topic.service';
import { TopicMemberUserService, TopicMemberUser } from '../../../../../core/services/topic-member-user.service';
import { UserStore } from '../../../../../core/state/user.store';
import { DialogService } from '../../../../../shared/dialog/dialog.service';
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { InitialsComponent } from '../../../../../shared/components/initials/initials.component';
import { CosDropdownDirective } from '../../../../../shared/directives/cos-dropdown.directive';

@Component({
  selector: 'app-topic-member-user',
  standalone: true,
  imports: [
    RouterModule,
    TranslateModule,
    UpperCasePipe,
    InitialsComponent,
    CosDropdownDirective, IconComponent,],
  templateUrl: './topic-member-user.component.html',
  styleUrls: ['./topic-member-user.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicMemberUserComponent implements OnInit {
  topic = input.required<Topic>();
  member = input.required<TopicMemberUser>();
  fields = input<string[]>();
  withEmail = input<boolean>(true);

  readonly topicService = inject(TopicService);
  private topicMemberUserService = inject(TopicMemberUserService);
  private userStore = inject(UserStore);
  private dialogService = inject(DialogService);
  private router = inject(Router);
  private translate = inject(TranslateService);

  readonly userLevels = Object.values(this.topicService.LEVELS);

  readonly memberLevel = signal<string>('');

  ngOnInit() {
    this.memberLevel.set(this.member().level);
  }

  doUpdateMemberUser(level: string): void {
    if (level === this.memberLevel()) return;
    this.memberLevel.set(level);
    this.topicMemberUserService
      .update(this.topic().id, this.member().userId || this.member().id, level)
      .pipe(take(1))
      .subscribe();
  }

  doDeleteMemberUser(): void {
    if (this.member().id === this.userStore.user()?.id) {
      this.doLeaveTopic();
      return;
    }
    this.dialogService
      .open(ConfirmDialogComponent, {
        data: {
          level: 'delete',
          heading: 'MODALS.TOPIC_MEMBER_USER_DELETE_CONFIRM_HEADING',
          description: 'MODALS.TOPIC_MEMBER_USER_DELETE_CONFIRM_TXT_ARE_YOU_SURE',
          confirmBtn: 'MODALS.TOPIC_MEMBER_USER_DELETE_CONFIRM_YES',
          closeBtn: 'MODALS.TOPIC_MEMBER_USER_DELETE_CONFIRM_NO',
        },
      })
      .afterClosed()
      .pipe(take(1))
      .subscribe((result) => {
        if (result === true) {
          this.topicMemberUserService
            .delete(this.topic().id, this.member().userId || this.member().id)
            .pipe(take(1))
            .subscribe();
        }
      });
  }

  doLeaveTopic(): void {
    this.dialogService
      .open(ConfirmDialogComponent, {
        data: {
          level: 'delete',
          heading: 'MODALS.TOPIC_MEMBER_USER_LEAVE_CONFIRM_HEADING',
          description: 'MODALS.TOPIC_MEMBER_USER_LEAVE_CONFIRM_TXT_ARE_YOU_SURE',
          points: ['MODALS.TOPIC_MEMBER_USER_LEAVE_CONFIRM_TXT_LEAVING_TOPIC_DESC'],
          confirmBtn: 'MODALS.TOPIC_MEMBER_USER_LEAVE_CONFIRM_BTN_YES',
          closeBtn: 'MODALS.TOPIC_MEMBER_USER_LEAVE_CONFIRM_BTN_NO',
        },
      })
      .afterClosed()
      .pipe(take(1))
      .subscribe((result) => {
        if (result === true) {
          const user = this.userStore.user();
          if (user) {
            this.topicMemberUserService
              .delete(this.topic().id, user.id)
              .pipe(take(1))
              .subscribe(() => {
                this.router.navigate([this.translate.currentLang, 'my', 'topics']);
              });
          }
        }
      });
  }
}
