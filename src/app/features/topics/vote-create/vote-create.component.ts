import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TopicService } from '../../../core/services/topic.service';
import { TopicVoteService } from '../../../core/services/topic-vote.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Topic } from '../../../core/interfaces/topic';
import { Vote } from '../../../core/interfaces/vote';
import { StepNavigatorComponent, StepConfig } from '../../../shared/components/step-navigator/step-navigator.component';
import { StepTopicInfoComponent } from '../topic-create/components/step-topic-info/step-topic-info.component';
import { StepTopicSettingsComponent } from '../topic-create/components/step-topic-settings/step-topic-settings.component';
import { StepVoteSettingsComponent } from './components/step-vote-settings/step-vote-settings.component';
import { StepTopicPreviewComponent } from '../topic-create/components/step-topic-preview/step-topic-preview.component';

@Component({
  selector: 'cos-vote-create',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    StepNavigatorComponent,
    StepTopicInfoComponent,
    StepTopicSettingsComponent,
    StepVoteSettingsComponent,
    StepTopicPreviewComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="wizard-container">
      <div class="create-header">
        <h1 class="create_heading">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="40" height="40" rx="20" fill="#5AB467" />
            <path fill-rule="evenodd" clip-rule="evenodd"
              d="M20 10C14.48 10 10 14.48 10 20C10 25.52 14.48 30 20 30C25.52 30 30 25.52 30 20C30 14.48 25.52 10 20 10ZM18.0556 25L25.8333 17.2807L24.375 15.8333L18.0556 22.1053L15.625 19.693L14.1667 21.1404L18.0556 25Z"
              fill="white" />
          </svg>
          <span class="small_heading" translate="VIEWS.VOTE_CREATE.HEADING"></span>
        </h1>
        <cos-step-navigator
          [steps]="steps"
          [currentStep]="currentStep()"
          (stepChange)="onStepChange($event)"
        >
          <div actions>
            <ng-content select="[actions]"></ng-content>
          </div>
        </cos-step-navigator>
      </div>

      <div class="wizard-content">
        @switch (currentStep()) {
          @case ('info') {
            <cos-step-topic-info
              [topic]="$any(topic())"
              (topicUpdate)="onTopicUpdate($event)"
              (next)="onInfoNext()"
            ></cos-step-topic-info>
          }
          @case ('settings') {
            <cos-step-topic-settings
              [topic]="$any(topic())"
              (topicUpdate)="onTopicUpdate($event)"
              (next)="onStepChange('voting')"
              (previous)="onStepChange('info')"
            ></cos-step-topic-settings>
          }
          @case ('voting') {
            <cos-step-vote-settings
              [vote]="$any(vote())"
              (voteUpdate)="onVoteUpdate($event)"
              (next)="onStepChange('preview')"
              (previous)="onStepChange('settings')"
            ></cos-step-vote-settings>
          }
          @case ('preview') {
            <cos-step-topic-preview
              [topic]="$any(topic())"
              [vote]="vote()"
              (previous)="onStepChange('voting')"
              (save)="onPublish()"
            ></cos-step-topic-preview>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .wizard-container { display: flex; flex-direction: column; height: 100%; background: var(--color-background); }
    .create-header {
      padding: 40px 40px 0;
      max-width: 800px;
      margin: 0 auto;
      width: 100%;
      .create_heading {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 24px;

        .small_heading {
          font-size: 18px;
          font-weight: 700;
          color: var(--color-text);
        }
      }
    }
    .wizard-content { flex: 1; padding: 40px; overflow-y: auto; max-width: 800px; margin: 0 auto; width: 100%; }
    .btn-save-draft { background: none; border: 1px solid var(--color-border); padding: 8px 16px; border-radius: var(--radius-sm); cursor: pointer; }
    .placeholder-step { padding: 20px; border: 1px dashed var(--color-border); border-radius: var(--radius-md); text-align: center; }
  `]
})
export class VoteCreateComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private topicService = inject(TopicService);
  private voteService = inject(TopicVoteService);
  private notification = inject(NotificationService);

  steps: StepConfig[] = [
    { key: 'info', label: 'VIEWS.VOTE_CREATE.CREATE_TAB_1', icon: 'info' },
    { key: 'settings', label: 'VIEWS.VOTE_CREATE.CREATE_TAB_2', icon: 'settings' },
    { key: 'voting', label: 'VIEWS.VOTE_CREATE.CREATE_TAB_3', icon: 'check' },
    { key: 'preview', label: 'VIEWS.VOTE_CREATE.CREATE_TAB_4', icon: 'eye' }
  ];

  currentStep = signal('info');
  topic = signal<Partial<Topic>>({
    title: '',
    intro: '',
    description: '<html><head></head><body></body></html>',
    visibility: 'private',
    categories: [],
    status: 'draft'
  });
  vote = signal<Partial<Vote>>({
    question: '',
    type: 'regular',
    authType: 'soft',
    options: [{ value: 'Yes' }, { value: 'No' }],
    delegationIsAllowed: false,
    autoClose: [{ value: 'allMembersVoted', enabled: false }],
    endsAt: null
  });

  isEdit = signal(false);

  ngOnInit() {
    const topicId = this.route.snapshot.params['topicId'];
    if (topicId) {
      this.isEdit.set(true);
      this.loadTopic(topicId);
    }
  }

  private loadTopic(id: string) {
    this.topicService.loadTopic(id).subscribe(topic => {
      this.topic.set(topic);
      if (topic.voteId) {
        this.voteService.get({ topicId: topic.id, voteId: topic.voteId }).subscribe(vote => {
          this.vote.set({ ...vote, question: vote.description });
        });
      }
    });
  }

  onStepChange(step: string) {
    this.currentStep.set(step);
  }

  onTopicUpdate(updates: Partial<Topic>) {
    this.topic.update(t => ({ ...t, ...updates }));
  }

  onVoteUpdate(updates: Partial<Vote>) {
    this.vote.update(v => ({ ...v, ...updates }));
  }

  onInfoNext() {
    if (!this.topic().id) {
      this.topicService.save(this.topic()).subscribe(topic => {
        this.topic.set(topic);
        this.createVoteObject(topic.id);
      });
    } else {
      this.onStepChange('settings');
    }
  }

  private createVoteObject(topicId: string) {
    const data = { ...this.vote(), topicId, description: this.vote().question || ' ' };
    this.voteService.save(data).subscribe(vote => {
      this.vote.set({ ...vote, question: vote.description });
      this.onStepChange('settings');
    });
  }

  saveAsDraft() {
    this.topicService.patch(this.topic()).subscribe(() => {
      if (this.vote().id) {
         const voteData = { ...this.vote(), topicId: this.topic().id, description: this.vote().question };
         this.voteService.update(voteData).subscribe();
      }
      this.notification.success('VIEWS.TOPIC_EDIT.NOTIFICATION_SUCCESS_MESSAGE');
      this.router.navigate(['/topics', this.topic().id]);
    });
  }

  onPublish() {
    const topicData = { ...this.topic(), status: 'voting' };
    this.topicService.patch(topicData).subscribe(() => {
      const voteData = { ...this.vote(), topicId: this.topic().id, description: this.vote().question };
      this.voteService.update(voteData).subscribe(() => {
        this.notification.success('VIEWS.TOPIC_CREATE.NOTIFICATION_SUCCESS_MESSAGE');
        this.router.navigate(['/topics', this.topic().id]);
      });
    });
  }
}
