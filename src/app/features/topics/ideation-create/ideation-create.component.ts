import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TopicService } from '../../../core/services/topic.service';
import { TopicIdeationService } from '../../../core/services/topic-ideation.service';
import { UploadService } from '../../../core/services/upload.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Topic } from '../../../core/interfaces/topic';
import { Ideation } from '../../../core/interfaces/ideation';
import { StepConfig } from '../../../shared/components/step-navigator/step-navigator.component';
import { CreateWizardShellComponent } from '../../../shared/components/create-wizard-shell/create-wizard-shell.component';
import { StepTopicInfoComponent } from '../topic-create/components/step-topic-info/step-topic-info.component';
import { StepTopicSettingsComponent } from '../topic-create/components/step-topic-settings/step-topic-settings.component';
import { StepIdeationSettingsComponent } from './components/step-ideation-settings/step-ideation-settings.component';
import { StepTopicPreviewComponent } from '../topic-create/components/step-topic-preview/step-topic-preview.component';
import { switchMap, take } from 'rxjs';

@Component({
  selector: 'cos-ideation-create',
  standalone: true,
  imports: [
    TranslateModule,
    CreateWizardShellComponent,
    StepTopicInfoComponent,
    StepTopicSettingsComponent,
    StepIdeationSettingsComponent,
    StepTopicPreviewComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ideation-create.component.html',
  styleUrl: './ideation-create.component.scss'
})
export class IdeationCreateComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private topicService = inject(TopicService);
  private ideationService = inject(TopicIdeationService);
  private uploadService = inject(UploadService);
  private notification = inject(NotificationService);

  readonly steps: StepConfig[] = [
    { key: 'info', label: 'VIEWS.IDEATION_CREATE.CREATE_TAB_1', icon: 'edit' },
    { key: 'settings', label: 'VIEWS.IDEATION_CREATE.CREATE_TAB_2', icon: 'settings' },
    { key: 'ideation', label: 'VIEWS.IDEATION_CREATE.CREATE_TAB_3', icon: 'activity' },
    { key: 'preview', label: 'VIEWS.IDEATION_CREATE.CREATE_TAB_4', icon: 'eye' }
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

  ideation = signal<Partial<Ideation>>({
    question: '',
    allowAnonymous: false,
    disableReplies: false
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
        if (topic.ideationId) {
          this.ideationService.get({ topicId: topic.id, ideationId: topic.ideationId }).subscribe({
            next: (ideation) => this.ideation.set(ideation),
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
        const ideationData = { ...this.ideation(), topicId: savedTopic.id || '', question: ' ' };
        return this.ideationService.save(ideationData);
      })
    ).subscribe({
      next: (savedIdeation) => {
        this.ideation.set(savedIdeation);
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
      case 'settings': this.currentStep.set('ideation'); break;
      case 'ideation': this.currentStep.set('preview'); break;
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

  onIdeationUpdate(updates: Partial<Ideation>) {
    this.ideation.update(i => ({ ...i, ...updates }));
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
        if (this.ideation().id) {
          this.ideationService.update({ ...this.ideation(), topicId: t.id || '' }).pipe(take(1)).subscribe();
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
    this.topicService.patch({ ...t, status: 'ideation' }).subscribe({
      next: () => {
        this.ideationService.update({ ...this.ideation(), topicId: t.id || '' }).pipe(take(1)).subscribe({
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
