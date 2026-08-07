import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of, take, map } from 'rxjs';
import { rxResource } from '@angular/core/rxjs-interop';
import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';
import { DialogCloseDirective, DialogRef } from '../../../../../shared/dialog/dialog-ref';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { TopicMemberUserService, TopicMemberUser } from '../../../../../core/services/topic-member-user.service';
import { VoteDelegationService } from '../../../../../core/services/vote-delegation.service';
import { TopicService } from '../../../../../core/services/topic.service';
import { Topic } from '../../../../../core/interfaces/topic';
import { UserStore } from '../../../../../core/state/user.store';
import { NotificationService } from '../../../../../core/services/notification.service';

@Component({
  selector: 'app-topic-vote-delegate',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, FormsModule, DialogCloseDirective, IconComponent],
  templateUrl: './topic-vote-delegate.component.html'
})
export class TopicVoteDelegateComponent {
  data = inject<{ topic: Topic }>(DIALOG_DATA);
  protected dialogRef = inject(DialogRef);
  private memberUserService = inject(TopicMemberUserService);
  private voteDelegationService = inject(VoteDelegationService);
  private topicService = inject(TopicService);
  private userStore = inject(UserStore);
  private notification = inject(NotificationService);
  private translate = inject(TranslateService);

  searchStr = signal('');
  delegateUser = signal<TopicMemberUser | null>(null);

  private searchResultsResource = rxResource({
    params: () => this.searchStr(),
    stream: ({ params: str }) => {
      if (!str || str.length < 2) return of([]);
      return this.memberUserService.query({ topicId: this.data.topic.id, search: str }).pipe(
        map(res => {
          const me = this.userStore.user();
          return (res.rows || []).filter((u: TopicMemberUser) => u.id !== me?.id);
        })
      );
    }
  });

  searchResults = computed(() => this.searchResultsResource.value() || []);

  onSearch(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.searchStr.set(val);
  }

  selectUser(user: TopicMemberUser) {
    this.delegateUser.set(user);
    this.searchStr.set('');
  }

  removeDelegate() {
    this.delegateUser.set(null);
  }

  save() {
    const user = this.delegateUser();
    if (!user?.id) return;
    this.voteDelegationService.save({
      topicId: this.data.topic.id,
      voteId: (this.data.topic.voteId || this.data.topic.vote?.id) as string,
      userId: user.id
    }).pipe(take(1)).subscribe({
      next: () => {
        this.notification.success(this.translate.instant('MODALS.TOPIC_VOTE_DELEGATE_SUCCESS', { userName: user.name }));
        this.topicService.reloadTopic();
        this.dialogRef.close(true);
      },
      error: () => this.notification.error('MSG_ERROR_POST_API_USERS_TOPICS_VOTES_DELEGATIONS_40002')
    });
  }
}
