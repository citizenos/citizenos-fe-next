import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged, of, Subject, switchMap, take } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';
import { DialogCloseDirective, DialogRef } from '../../../../../shared/dialog/dialog-ref';
import { TopicMemberUserService } from '../../../../../core/services/topic-member-user.service';
import { VoteDelegationService } from '../../../../../core/services/vote-delegation.service';
import { TopicService } from '../../../../../core/services/topic.service';
import { UserStore } from '../../../../../core/state/user.store';
import { NotificationService } from '../../../../../core/services/notification.service';

@Component({
  selector: 'app-topic-vote-delegate',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, FormsModule, DialogCloseDirective],
  templateUrl: './topic-vote-delegate.component.html'
})
export class TopicVoteDelegateComponent {
  data = inject<{ topic: any }>(DIALOG_DATA);
  private dialogRef = inject(DialogRef);
  private memberUserService = inject(TopicMemberUserService);
  private voteDelegationService = inject(VoteDelegationService);
  private topicService = inject(TopicService);
  private userStore = inject(UserStore);
  private notification = inject(NotificationService);
  private translate = inject(TranslateService);

  searchStr = signal('');
  delegateUser = signal<any>(null);

  private search$ = new Subject<string>();

  searchResults = toSignal(
    this.search$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(str => {
        if (!str || str.length < 2) return of([]);
        return this.memberUserService.query({ topicId: this.data.topic.id, search: str }).pipe(
          switchMap(res => {
            const me = this.userStore.user();
            const filtered = (res.rows || []).filter((u: any) => u.id !== me?.id);
            return of(filtered);
          })
        );
      })
    ),
    { initialValue: [] }
  );

  onSearch(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.search$.next(val);
  }

  selectUser(user: any) {
    this.delegateUser.set(user);
    this.search$.next('');
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
      voteId: this.data.topic.voteId || this.data.topic.vote?.id,
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
