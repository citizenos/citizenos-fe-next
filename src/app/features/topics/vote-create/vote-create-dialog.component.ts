import { Component, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs';
import { DIALOG_DATA } from '../../../shared/dialog/dialog-tokens';
import { DialogRef } from '../../../shared/dialog/dialog-ref';
import { DialogCloseDirective } from '../../../shared/dialog';
import { Topic } from '../../../core/interfaces/topic';
import { Vote } from '../../../core/interfaces/vote';
import { TopicVoteService } from '../../../core/services/topic-vote.service';
import { NotificationService } from '../../../core/services/notification.service';
import { StepVoteSettingsComponent } from './components/step-vote-settings/step-vote-settings.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DomainIconComponent } from '../../../shared/components/domain-icon/domain-icon.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'cos-vote-create-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslateModule,
    DialogCloseDirective,
    StepVoteSettingsComponent,
    ButtonComponent,
    DomainIconComponent,
    IconComponent,
  ],
  template: `
    <div class="dialog-overlay">
      <div class="dialog">
        <div class="dialog-header">
          <div class="dialog-title">
            <cos-domain-icon type="vote"></cos-domain-icon>
            <h4 translate="COMPONENTS.TOPIC_VOTE_CREATE.DIALOG_HEADING"></h4>
          </div>
          <button class="btn-close" dialogClose aria-label="Close">
            <cos-icon name="close"></cos-icon>
          </button>
        </div>

        <div class="dialog-tabs">
          @for (tab of TABS; track tab.key) {
            <button
              class="dialog-tab"
              [class.active]="currentStep() === tab.key"
              (click)="goToStep(tab.key)"
              [disabled]="tab.key === 'settings' && currentStep() === 'intro'"
            >
              {{ tab.label | translate }}
            </button>
          }
        </div>

        <div class="dialog-content">
          @if (currentStep() === 'intro') {
            <div class="intro-wrap">
              <p class="intro-heading" translate="COMPONENTS.TOPIC_VOTE_CREATE.DIALOG_TAB_INTRODUCTION_ARE_YOU_SURE"></p>
              <p class="intro-subheading" translate="COMPONENTS.TOPIC_VOTE_CREATE.DIALOG_TAB_INTRODUCTION_KEEP_IN_MIND"></p>

              <div class="info-list">
                <div class="info-row warning">
                  <cos-icon name="close" class="icon-error"></cos-icon>
                  <span translate="COMPONENTS.TOPIC_VOTE_CREATE.DIALOG_TAB_INTRODUCTION_ITEM_1"></span>
                </div>
                @if (topic.ideationId) {
                  <div class="info-row warning">
                    <cos-icon name="close" class="icon-error"></cos-icon>
                    <span translate="COMPONENTS.TOPIC_VOTE_CREATE.DIALOG_TAB_INTRODUCTION_ITEM_7"></span>
                  </div>
                }
                @if (topic.ideationId && !topic.discussionId) {
                  <div class="info-row warning">
                    <cos-icon name="close" class="icon-error"></cos-icon>
                    <span translate="COMPONENTS.TOPIC_VOTE_CREATE.DIALOG_TAB_INTRODUCTION_ITEM_9"></span>
                  </div>
                }
                <div class="info-row neutral">
                  <cos-icon name="close"></cos-icon>
                  <span translate="COMPONENTS.TOPIC_VOTE_CREATE.DIALOG_TAB_INTRODUCTION_ITEM_5"></span>
                </div>
                <div class="info-row neutral">
                  <cos-icon name="close"></cos-icon>
                  <span translate="COMPONENTS.TOPIC_VOTE_CREATE.DIALOG_TAB_INTRODUCTION_ITEM_6"></span>
                </div>
                <div class="info-row ok">
                  <cos-icon name="check"></cos-icon>
                  <span translate="COMPONENTS.TOPIC_VOTE_CREATE.DIALOG_TAB_INTRODUCTION_ITEM_2"></span>
                </div>
                <div class="info-row ok">
                  <cos-icon name="check"></cos-icon>
                  <span translate="COMPONENTS.TOPIC_VOTE_CREATE.DIALOG_TAB_INTRODUCTION_ITEM_3"></span>
                </div>
              </div>

              <div class="intro-info-box">
                <cos-icon name="info"></cos-icon>
                <span translate="COMPONENTS.TOPIC_VOTE_CREATE.DIALOG_TAB_INTRODUCTION_INFO"></span>
              </div>

              <div class="intro-actions">
                <cos-button variant="primary" (clicked)="goToStep('settings')">
                  {{ 'COMPONENTS.TOPIC_VOTE_CREATE.BTN_CONTINUE' | translate }}
                </cos-button>
              </div>
            </div>
          }

          @if (currentStep() === 'settings') {
            <cos-step-vote-settings
              [vote]="vote()"
              (voteUpdate)="onVoteUpdate($event)"
              (next)="onSubmit()"
              (previous)="goToStep('intro')"
            ></cos-step-vote-settings>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dialog-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,.5);
      display: flex; align-items: center; justify-content: center; z-index: 1000;
    }
    .dialog {
      background: var(--color-background);
      border-radius: var(--radius-lg);
      width: min(680px, 95vw);
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .dialog-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 24px 24px 0;
    }
    .dialog-title {
      display: flex; align-items: center; gap: 12px;
      h4 { margin: 0; font-size: 18px; font-weight: 700; }
    }
    .btn-close {
      background: none; border: none; cursor: pointer; padding: 4px;
      display: flex; align-items: center; justify-content: center;
    }
    .dialog-tabs {
      display: flex; gap: 0; padding: 16px 24px 0; border-bottom: 1px solid var(--color-border);
    }
    .dialog-tab {
      background: none; border: none; border-bottom: 2px solid transparent;
      padding: 8px 16px; cursor: pointer; font-size: 14px; font-weight: 500;
      color: var(--color-text-muted); transition: color .2s, border-color .2s;
      &.active { color: var(--color-primary); border-bottom-color: var(--color-primary); }
      &:disabled { opacity: .5; cursor: not-allowed; }
    }
    .dialog-content { padding: 24px; overflow-y: auto; flex: 1; }
    .intro-wrap { display: flex; flex-direction: column; gap: 16px; }
    .intro-heading { font-size: 16px; font-weight: 700; margin: 0; }
    .intro-subheading { font-size: 14px; color: var(--color-text-muted); margin: 0; }
    .info-list { display: flex; flex-direction: column; gap: 10px; }
    .info-row {
      display: flex; align-items: flex-start; gap: 12px; font-size: 14px;
      &.warning cos-icon { color: var(--color-error, #EF4025); }
      &.ok cos-icon { color: var(--color-success, #5AB467); }
      &.neutral cos-icon { color: var(--color-text-muted); }
    }
    .intro-info-box {
      display: flex; align-items: flex-start; gap: 10px;
      background: var(--color-secondary); border-radius: var(--radius-md);
      padding: 12px 16px; font-size: 13px;
    }
    .intro-actions { display: flex; justify-content: flex-end; padding-top: 8px; }
  `]
})
export class VoteCreateDialogComponent {
  private data = inject<{ topic: Topic }>(DIALOG_DATA);
  private dialogRef = inject(DialogRef);
  private voteService = inject(TopicVoteService);
  private notification = inject(NotificationService);
  private router = inject(Router);
  private translate = inject(TranslateService);

  topic = this.data.topic;

  TABS: { key: 'intro' | 'settings', label: string }[] = [
    { key: 'intro', label: 'COMPONENTS.TOPIC_VOTE_CREATE.DIALOG_TAB_1' },
    { key: 'settings', label: 'COMPONENTS.TOPIC_VOTE_CREATE.DIALOG_TAB_2' },
  ];

  currentStep = signal<'intro' | 'settings'>('intro');

  vote = signal<Partial<Vote>>({
    question: '',
    type: 'regular',
    authType: 'soft',
    options: [{ value: 'Yes' }, { value: 'No' }],
    delegationIsAllowed: false,
    autoClose: [{ value: 'allMembersVoted', enabled: false }],
    endsAt: null,
  });

  goToStep(step: 'intro' | 'settings') {
    this.currentStep.set(step);
  }

  onVoteUpdate(updates: Partial<Vote>) {
    this.vote.update(v => ({ ...v, ...updates }));
  }

  onSubmit() {
    const voteData = {
      ...this.vote(),
      topicId: this.topic.id,
      description: this.vote().question || '',
    };

    this.voteService.save(voteData).pipe(take(1)).subscribe({
      next: () => {
        this.notification.success('VIEWS.VOTE_CREATE.SUCCESS_VOTE_STARTED');
        this.dialogRef.close(true);
        this.router.navigate(['/', this.translate.currentLang, 'topics', this.topic.id]);
      },
      error: () => {
        this.notification.showRaw('error', 'VIEWS.VOTE_CREATE.ERROR_MISSING_QUESTION');
      }
    });
  }
}
