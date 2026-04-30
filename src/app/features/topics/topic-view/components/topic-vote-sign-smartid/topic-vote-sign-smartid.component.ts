import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { interval, switchMap, takeWhile, take, map, catchError, of } from 'rxjs';
import { UpperCasePipe } from '@angular/common';

import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';
import { DialogCloseDirective, DialogRef } from '../../../../../shared/dialog/dialog-ref';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { TopicVoteService } from '../../../../../core/services/topic-vote.service';
import { TopicService } from '../../../../../core/services/topic.service';
import { NotificationService } from '../../../../../core/services/notification.service';

@Component({
  selector: 'app-topic-vote-sign-smartid',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, ReactiveFormsModule, InputComponent, DialogCloseDirective, UpperCasePipe, IconComponent],
  templateUrl: './topic-vote-sign-smartid.component.html'
})
export class TopicVoteSignSmartidComponent {
  data = inject<{ topic: any; options: any[] }>(DIALOG_DATA);
  private dialogRef = inject(DialogRef);
  private topicVoteService = inject(TopicVoteService);
  private topicService = inject(TopicService);
  private notification = inject(NotificationService);
  private translate = inject(TranslateService);

  signForm = new FormGroup({
    countryCode: new FormControl('EE', [Validators.required, Validators.pattern(/^[A-Z]{2}$/)]),
    pid: new FormControl('', Validators.required)
  });

  isLoading = signal(false);
  challengeID = signal<number | null>(null);

  doSignWithSmartId() {
    if (this.signForm.invalid) return;
    this.isLoading.set(true);
    const userVote = {
      voteId: this.data.topic.voteId,
      topicId: this.data.topic.id,
      options: this.data.options,
      pid: this.signForm.value.pid,
      countryCode: this.signForm.value.countryCode
    };
    this.topicVoteService.cast(userVote).pipe(take(1), catchError(err => {
      this.isLoading.set(false);
      return of(null);
    })).subscribe(result => {
      if (!result) return;
      this.isLoading.set(false);
      if (result.challengeID && result.token) {
        this.challengeID.set(result.challengeID);
        this.pollStatus(result.token);
      }
    });
  }

  private pollStatus(token: string) {
    interval(10000).pipe(
      switchMap(() => this.topicVoteService.status({ topicId: this.data.topic.id, voteId: this.data.topic.voteId, token })),
      takeWhile((res: any) => res?.status?.code === 20001, true),
      map((res: any) => res?.data || {})
    ).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.challengeID.set(null);
        this.topicService.reloadTopic();
        this.notification.success('VIEWS.TOPICS_TOPICID.MSG_VOTE_REGISTERED');
        this.dialogRef.close(true);
      },
      error: () => {
        this.isLoading.set(false);
        this.challengeID.set(null);
      }
    });
  }

  getOptionValueText(option: string): string {
    const key = `VIEWS.TOPICS_TOPICID.VOTE_LBL_OPTION_${option}`.toUpperCase();
    const val = this.translate.instant(key);
    return val.indexOf('VIEWS.TOPICS_TOPICID.VOTE_LBL_OPTION_') === -1 ? val : option;
  }
}
