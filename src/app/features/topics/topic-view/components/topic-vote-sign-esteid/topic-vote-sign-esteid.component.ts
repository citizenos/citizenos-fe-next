import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { Component, inject, signal, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { interval, switchMap, takeWhile, take, map, catchError, of } from 'rxjs';
import { UpperCasePipe } from '@angular/common';
import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';
import { DialogCloseDirective, DialogRef } from '../../../../../shared/dialog/dialog-ref';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { TopicVoteService } from '../../../../../core/services/topic-vote.service';
import { TopicService } from '../../../../../core/services/topic.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { Topic, TopicVoteCast } from '../../../../../core/interfaces/topic';
import { NotificationComponent } from '../../../../../shared/components/notification/notification.component';

declare let hwcrypto: {
  getCertificate: (options: Record<string, unknown>) => Promise<{ hex: string }>;
  sign: (certificate: { hex: string }, data: { hex: string; type: string }, options: Record<string, unknown>) => Promise<{ hex: string }>;
  NO_CERTIFICATES: string;
  USER_CANCEL: string;
  NO_IMPLEMENTATION: string;
  INVALID_ARGUMENT: string;
  NOT_ALLOWED: string;
  TECHNICAL_ERROR: string;
};

@Component({
  selector: 'app-topic-vote-sign-esteid',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, ReactiveFormsModule, InputComponent, DialogCloseDirective, UpperCasePipe, NotificationComponent, IconComponent],
  templateUrl: './topic-vote-sign-esteid.component.html'
})
export class TopicVoteSignEsteidComponent {
  data = inject<{ topic: Topic; options: TopicVoteCast['options'] }>(DIALOG_DATA);
  protected dialogRef = inject(DialogRef);
  private topicVoteService = inject(TopicVoteService);
  private topicService = inject(TopicService);
  private notification = inject(NotificationService);
  private translate = inject(TranslateService);

  mobiilIdForm = new FormGroup({
    pid: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]{11}$/)]),
    phoneNumber: new FormControl('', [Validators.required, Validators.pattern(/^\+?[0-9\s-]{7,}$/)])
  });

  isLoading = signal(false);
  isLoadingIdCard = signal(false);
  challengeID = signal<string | null>(null);
  wWidth = signal(window.innerWidth);

  @HostListener('window:resize')
  onResize() {
    this.wWidth.set(window.innerWidth);
  }

  doSignWithMobile() {
    if (this.mobiilIdForm.invalid) return;
    this.isLoading.set(true);
    let phone = this.mobiilIdForm.value.phoneNumber || '';
    if (!phone.startsWith('+')) phone = '+' + phone;
    const userVote = {
      voteId: this.data.topic.voteId || undefined,
      topicId: this.data.topic.id,
      options: this.data.options,
      pid: this.mobiilIdForm.value.pid,
      phoneNumber: phone,
      certificate: null
    };
    this.topicVoteService.cast(userVote).pipe(take(1), catchError(_err => {
      this.isLoading.set(false);
      return of(null);
    })).subscribe((result: { challengeID?: string; token?: string } | null) => {
      this.isLoading.set(false);
      if (!result) return;
      if (result.challengeID && result.token) {
        this.challengeID.set(result.challengeID);
        this.pollMobileStatus(result.token);
      }
    });
  }

  doSignWithCard() {
    this.isLoadingIdCard.set(true);
    hwcrypto.getCertificate({}).then((certificate: { hex: string }) => {
      const userVote = {
        voteId: this.data.topic.voteId || undefined,
        topicId: this.data.topic.id,
        options: this.data.options,
        certificate: certificate.hex
      };
      this.topicVoteService.cast(userVote).pipe(take(1)).subscribe(async (voteResponse: { signedInfoDigest?: string; token?: string; signedInfoHashType?: string }) => {
        if (voteResponse?.signedInfoDigest && voteResponse?.token && voteResponse?.signedInfoHashType) {
          try {
            const signature = await hwcrypto.sign(certificate, { hex: voteResponse.signedInfoDigest, type: voteResponse.signedInfoHashType }, {});
            this.topicVoteService.sign({
              id: this.data.topic.voteId || undefined,
              topicId: this.data.topic.id,
              signatureValue: signature.hex,
              token: voteResponse.token
            }).pipe(take(1)).subscribe({
              next: () => {
                this.isLoadingIdCard.set(false);
                this.notification.success('VIEWS.TOPICS_TOPICID.MSG_VOTE_REGISTERED');
                this.dialogRef.close(true);
              },
              error: () => this.isLoadingIdCard.set(false)
            });
          } catch (err: any) {
            this.isLoadingIdCard.set(false);
            this.notification.error(this.hwCryptoErrorToTranslationKey(err));
          }
        }
      });
    }, (err: Error | { status?: { message?: string } }) => {
      this.isLoading.set(false);
      this.isLoadingIdCard.set(false);
      this.challengeID.set(null);
      let msg = 'MSG_ERROR_DEFAULT';
      if (err instanceof Error) {
        msg = this.hwCryptoErrorToTranslationKey(err);
      } else if (err?.status?.message) {
        msg = err.status.message;
      }
      this.notification.error(msg);
    });
  }

  private pollMobileStatus(token: string) {
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

  private hwCryptoErrorToTranslationKey(err: any) {
    const errorKeyPrefix = 'MSG_ERROR_HWCRYPTO_';
    switch (err.message) {
      case hwcrypto.NO_CERTIFICATES:
      case hwcrypto.USER_CANCEL:
      case hwcrypto.NO_IMPLEMENTATION:
        return errorKeyPrefix + err.message.toUpperCase();
      case hwcrypto.INVALID_ARGUMENT:
      case hwcrypto.NOT_ALLOWED:
      case hwcrypto.TECHNICAL_ERROR:
        console.error(err.message, 'Technical error from HWCrypto library', err);
        return errorKeyPrefix + 'TECHNICAL_ERROR';
      default:
        console.error(err.message, 'Unknown error from HWCrypto library', err);
        return errorKeyPrefix + 'TECHNICAL_ERROR';
    }
  }

  getOptionValueText(option: string): string {
    const key = `VIEWS.TOPICS_TOPICID.VOTE_LBL_OPTION_${option}`.toUpperCase();
    const val = this.translate.instant(key);
    return val.indexOf('VIEWS.TOPICS_TOPICID.VOTE_LBL_OPTION_') === -1 ? val : option;
  }
}
