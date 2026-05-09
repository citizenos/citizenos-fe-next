import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TopicService } from '../../../core/services/topic.service';
import { TopicVoteService } from '../../../core/services/topic-vote.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Topic } from '../../../core/interfaces/topic';
import { Vote } from '../../../core/interfaces/vote';
import { StepConfig } from '../../../shared/components/step-navigator/step-navigator.component';
import { CreateWizardShellComponent } from '../../../shared/components/create-wizard-shell/create-wizard-shell.component';
import { StepTopicInfoComponent } from '../topic-create/components/step-topic-info/step-topic-info.component';
import { StepTopicSettingsComponent } from '../topic-create/components/step-topic-settings/step-topic-settings.component';
import { StepVoteSettingsComponent } from './components/step-vote-settings/step-vote-settings.component';
import { StepTopicPreviewComponent } from '../topic-create/components/step-topic-preview/step-topic-preview.component';
import { switchMap, take } from 'rxjs';

@Component({
  selector: 'cos-vote-create',
  standalone: true,
  imports: [
    TranslateModule,
    CreateWizardShellComponent,
    StepTopicInfoComponent,
    StepTopicSettingsComponent,
    StepVoteSettingsComponent,
    StepTopicPreviewComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './vote-create.component.html',
  styleUrl: './vote-create.component.scss'
})
export class VoteCreateComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private topicService = inject(TopicService);
  private voteService = inject(TopicVoteService);
  private notification = inject(NotificationService);

  readonly steps: StepConfig[] = [
    { key: 'info', label: 'VIEWS.VOTE_CREATE.CREATE_TAB_1', icon: 'edit' },
    { key: 'settings', label: 'VIEWS.VOTE_CREATE.CREATE_TAB_2', icon: 'settings' },
    { key: 'voting', label: 'VIEWS.VOTE_CREATE.CREATE_TAB_3', icon: 'check' },
    { key: 'preview', label: 'VIEWS.VOTE_CREATE.CREATE_TAB_4', icon: 'eye' }
  ];

  currentStep = signal('info');
  isLoading = signal(false);

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

  ngOnInit() {
    const topicId = this.route.snapshot.params['topicId'];
    if (topicId) {
      this.loadExistingTopic(topicId);
    } else {
      this.createEagerly();
    }
  }

  private loadExistingTopic(topicId: string) {
    this.isLoading.set(true);
    this.topicService.get(topicId).subscribe({
      next: (topic) => {
        this.topic.set(topic);
        if (topic.voteId) {
          this.voteService.get({ topicId: topic.id, voteId: topic.voteId }).subscribe({
            next: (vote) => this.vote.set({ ...vote, question: vote.description ?? undefined }),
            error: () => { /* intentionally empty */ }
          });
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.notification.showRaw('error', 'VIEWS.TOPIC_CREATE.ERROR_LOAD_FAILED');
      }
    });
  }

  private createEagerly() {
    this.isLoading.set(true);
    const initialPayload = {
      description: '<html><head></head><body></body></html>',
      status: 'draft',
      visibility: 'private'
    };
    this.topicService.save(initialPayload).pipe(
      take(1),
      switchMap((savedTopic) => {
        this.topic.set(savedTopic);
        const voteData = {
          ...this.vote(),
          topicId: savedTopic.id,
          description: this.vote().question || ' '
        };
        return this.voteService.save(voteData);
      })
    ).subscribe({
      next: (savedVote) => {
        this.vote.set({ ...savedVote, question: savedVote.description ?? undefined });
        this.isLoading.set(false);
        this.router.navigate([this.topic().id], {
          relativeTo: this.route,
          replaceUrl: true
        });
      },
      error: () => {
        this.isLoading.set(false);
        this.notification.showRaw('error', 'VIEWS.TOPIC_CREATE.ERROR_SAVE_FAILED');
      }
    });
  }

  onStepChange(step: string) {
    this.currentStep.set(step);
  }

  isFooterNextDisabled(): boolean {
    return this.currentStep() === 'info' && !this.topic().title;
  }

  handleFooterContinue() {
    switch (this.currentStep()) {
      case 'info': this.saveToSettings(); break;
      case 'settings': this.currentStep.set('voting'); break;
      case 'voting': this.currentStep.set('preview'); break;
      case 'preview': this.onPublish(); break;
    }
  }

  handleFooterBack() {
    const order = this.steps.map(s => s.key);
    const idx = order.indexOf(this.currentStep());
    if (idx > 0) this.currentStep.set(order[idx - 1]);
  }

  onTopicUpdate(updates: Partial<Topic>) {
    this.topic.update(t => ({ ...t, ...updates }));
  }

  onVoteUpdate(updates: Partial<Vote>) {
    this.vote.update(v => ({ ...v, ...updates }));
  }

  saveToSettings() {
    const t = this.topic();
    if (!t.id) {
      this.createEagerly();
      return;
    }
    this.isLoading.set(true);
    this.topicService.patch(t).subscribe({
      next: (updated) => {
        this.topic.set(updated);
        this.isLoading.set(false);
        this.onStepChange('settings');
      },
      error: () => {
        this.isLoading.set(false);
        this.notification.showRaw('error', 'VIEWS.TOPIC_CREATE.ERROR_SAVE_FAILED');
      }
    });
  }

  saveAsDraft() {
    const t = this.topic();
    if (!t.id) return;
    this.isLoading.set(true);
    this.topicService.patch(t).subscribe({
      next: () => {
        if (this.vote().id && t.id) {
          const voteData = { ...this.vote(), topicId: t.id, description: this.vote().question };
          this.voteService.update(voteData).pipe(take(1)).subscribe();
        }
        this.isLoading.set(false);
        this.notification.showRaw('success', 'VIEWS.TOPIC_EDIT.NOTIFICATION_SUCCESS_MESSAGE');
        this.router.navigate(['/topics', t.id]);
      },
      error: () => {
        this.isLoading.set(false);
        this.notification.showRaw('error', 'VIEWS.TOPIC_CREATE.ERROR_SAVE_FAILED');
      }
    });
  }

  onPublish() {
    const t = this.topic();
    if (!t.id) return;
    this.isLoading.set(true);
    this.topicService.patch({ ...t, status: 'voting' }).subscribe({
      next: () => {
        if (!t.id) return;
        const voteData = { ...this.vote(), topicId: t.id, description: this.vote().question };
        this.voteService.update(voteData).pipe(take(1)).subscribe({
          next: () => {
            this.isLoading.set(false);
            this.notification.showRaw('success', 'VIEWS.TOPIC_CREATE.NOTIFICATION_SUCCESS_MESSAGE');
            this.router.navigate(['/topics', t.id]);
          },
          error: () => {
            this.isLoading.set(false);
            this.notification.showRaw('error', 'VIEWS.TOPIC_CREATE.ERROR_PUBLISH_FAILED');
          }
        });
      },
      error: () => {
        this.isLoading.set(false);
        this.notification.showRaw('error', 'VIEWS.TOPIC_CREATE.ERROR_PUBLISH_FAILED');
      }
    });
  }
}
