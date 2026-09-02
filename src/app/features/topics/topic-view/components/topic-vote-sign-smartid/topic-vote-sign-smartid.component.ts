import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { Component, ChangeDetectionStrategy, inject, HostListener, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, UpperCasePipe } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { interval, switchMap, takeWhile, take, map } from 'rxjs';
import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';
import { DialogCloseDirective, DialogRef } from '../../../../../shared/dialog/dialog-ref';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { TopicVoteService } from '../../../../../core/services/topic-vote.service';
import { TopicService } from '../../../../../core/services/topic.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { Topic, TopicVoteCast } from '../../../../../core/interfaces/topic';
import { NotificationComponent } from '../../../../../shared/components/notification/notification.component';

@Component({
  selector: 'app-topic-vote-sign-smartid',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, ReactiveFormsModule, InputComponent, DialogCloseDirective, UpperCasePipe, NotificationComponent, IconComponent],
  templateUrl: './topic-vote-sign-smartid.component.html',
  styleUrls: ['./topic-vote-sign-smartid.component.scss']
})
export class TopicVoteSignSmartidComponent {
  data = inject<{ topic: Topic; options: TopicVoteCast['options'] }>(DIALOG_DATA);
  protected dialogRef = inject(DialogRef);
  private topicVoteService = inject(TopicVoteService);
  private platformId = inject(PLATFORM_ID);
  private topicService = inject(TopicService);
  private notification = inject(NotificationService);
  private translate = inject(TranslateService);

  signForm = new FormGroup({
    pid: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]{11}$/)]),
    countryCode: new FormControl('EE', [Validators.required, Validators.pattern(/^[A-Z]{2}$/)])
  });

  isLoading = signal(false);
  challengeID = signal<string | null>(null);
  wWidth = signal(isPlatformBrowser(this.platformId) ? window.innerWidth : 1280);

  @HostListener('window:resize')
  onResize() {
    if (isPlatformBrowser(this.platformId)) {
      this.wWidth.set(window.innerWidth);
    }
  }

  doSignWithSmartId() {
    if (this.signForm.invalid) return;
    this.isLoading.set(true);
    const userVote = {
      voteId: this.data.topic.voteId || undefined,
      topicId: this.data.topic.id,
      options: this.data.options,
      pid: this.signForm.value.pid,
      countryCode: this.signForm.value.countryCode
    };
    this.topicVoteService.cast(userVote).pipe(take(1)).subscribe({
      next: (result: { challengeID?: string; token?: string }) => {
        this.isLoading.set(false);
        if (result.challengeID && result.token) {
          this.challengeID.set(result.challengeID);
          this.pollSmartIdStatus(result.token);
        }
      },
      error: () => this.isLoading.set(false)
    });
  }

  private pollSmartIdStatus(token: string) {
    interval(10000).pipe(
      switchMap(() => this.topicVoteService.status({ topicId: this.data.topic.id, voteId: this.data.topic.voteId!, token })),
      takeWhile((res) => res?.status?.code === 20001, true),
      map((res) => res?.data || {})
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
