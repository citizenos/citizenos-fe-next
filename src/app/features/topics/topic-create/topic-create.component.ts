import { Component, signal, inject, computed, ChangeDetectionStrategy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TopicService } from '../../../core/services/topic.service';
import { UploadService } from '../../../core/services/upload.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Topic } from '../../../core/interfaces/topic';
import { StepNavigatorComponent, StepConfig } from '../../../shared/components/step-navigator/step-navigator.component';
import { StepTopicInfoComponent } from './components/step-topic-info/step-topic-info.component';
import { StepTopicSettingsComponent } from './components/step-topic-settings/step-topic-settings.component';
import { StepTopicDiscussionComponent } from './components/step-topic-discussion/step-topic-discussion.component';
import { StepTopicPreviewComponent } from './components/step-topic-preview/step-topic-preview.component';
import { switchMap, tap, of, catchError } from 'rxjs';
import { AnyPipe } from '../../../shared/pipes/any.pipe';

@Component({
  selector: 'cos-topic-create',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    StepNavigatorComponent,
    StepTopicInfoComponent,
    StepTopicSettingsComponent,
    StepTopicDiscussionComponent,
    StepTopicPreviewComponent,
    AnyPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="topic-create-container">
      <div class="create-header">
        <h1 class="create_heading">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="40" height="40" rx="20" fill="#1168A8" />
            <path
              d="M11 20C11 14.4772 15.4772 10 21 10C26.5228 10 31 14.4772 31 20C31 25.5228 26.5228 30 21 30C19.7891 30 18.6315 29.7844 17.5619 29.3888L13 31V26.4381C11.7709 24.6983 11 22.502 11 20Z"
              fill="white" />
          </svg>
          <span class="small_heading" translate="VIEWS.TOPIC_CREATE.HEADING"></span>
        </h1>
        <cos-step-navigator
          [steps]="steps"
          [currentStep]="currentStep()"
          (stepChange)="onStepChange($event)"
        ></cos-step-navigator>
      </div>

      <div class="create-content">
        @if (isLoading()) {
          <div class="loading-overlay">
            <div class="loader"></div>
          </div>
        }

        @if (currentStep() === 'info') {
          <cos-step-topic-info
            [topic]="topic() | any"
            (topicUpdate)="onTopicUpdate($any($event))"
            (imageFileUpdate)="onImageFileUpdate($any($event))"
            (next)="transitionToSettings()"
          ></cos-step-topic-info>
        }

        @if (currentStep() === 'settings') {
          <cos-step-topic-settings
            [topic]="topic() | any"
            (topicUpdate)="onTopicUpdate($any($event))"
            (next)="currentStep.set('discussion')"
            (previous)="currentStep.set('info')"
          ></cos-step-topic-settings>
        }

        @if (currentStep() === 'discussion') {
          <cos-step-topic-discussion
            [topic]="topic() | any"
            (topicUpdate)="onTopicUpdate($any($event))"
            (next)="currentStep.set('preview')"
            (previous)="currentStep.set('settings')"
          ></cos-step-topic-discussion>
        }

        @if (currentStep() === 'preview') {
          <cos-step-topic-preview
            [topic]="topic() | any"
            (previous)="currentStep.set('discussion')"
            (save)="publishTopic()"
          ></cos-step-topic-preview>
        }

      </div>
    </div>
  `,
  styles: [`
    .topic-create-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 40px 20px;
    }

    .create-header {
      margin-bottom: 40px;
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

    .create-content {
      position: relative;
      background: var(--color-surfaces);
      border-radius: var(--radius-lg);
      padding: 32px;
      box-shadow: var(--shadow-sm);
      min-height: 400px;
    }

    .loading-overlay {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(255,255,255,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
      border-radius: var(--radius-lg);
    }
  `]
})
export class TopicCreateComponent {
  private topicService = inject(TopicService);
  private uploadService = inject(UploadService);
  private notification = inject(NotificationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  topic = signal<Partial<Topic>>({
    title: '',
    intro: '',
    description: '<html><head></head><body></body></html>',
    visibility: 'private',
    categories: [],
    status: 'draft'
  });

  imageFile = signal<File | null>(null);
  isLoading = signal(false);
  currentStep = signal('info');

  steps: StepConfig[] = [
    { key: 'info', label: 'VIEWS.TOPIC_CREATE.CREATE_TAB_1', icon: 'edit' },
    { key: 'settings', label: 'VIEWS.TOPIC_CREATE.CREATE_TAB_2', icon: 'settings' },
    { key: 'discussion', label: 'VIEWS.TOPIC_CREATE.CREATE_TAB_3', icon: 'comment' },
    { key: 'preview', label: 'VIEWS.TOPIC_CREATE.CREATE_TAB_4', icon: 'eye' }
  ];

  onStepChange(step: string) {
    if (this.canNavigateTo(step)) {
      this.currentStep.set(step);
    }
  }

  canNavigateTo(step: string): boolean {
    if (step === 'info') return true;
    return !!this.topic().title;
  }

  onTopicUpdate(updates: Partial<Topic>) {
    this.topic.update(t => ({ ...t, ...updates }));
  }

  onImageFileUpdate(file: File | null) {
    this.imageFile.set(file);
  }

  transitionToSettings() {
    if (this.topic().id) {
      this.currentStep.set('settings');
      return;
    }

    this.isLoading.set(true);
    this.topicService.save(this.topic()).pipe(
      switchMap((newTopic: Topic) => {
        this.topic.set(newTopic);
        if (this.imageFile()) {
          const path = `/api/users/self/topics/${newTopic.id}/image`;
          return this.uploadService.upload(path, this.imageFile()!);
        }
        return of(null);
      }),
      catchError(err => {
        this.notification.showRaw('error', 'VIEWS.TOPIC_CREATE.ERROR_SAVE_FAILED');
        throw err;
      })
    ).subscribe(() => {
      this.isLoading.set(false);
      this.currentStep.set('settings');
    });
  }

  publishTopic() {
    this.isLoading.set(true);
    const data = { ...this.topic(), status: 'inProgress' };
    this.topicService.save(data).subscribe({
      next: (savedTopic) => {
        this.isLoading.set(false);
        this.notification.showRaw('success', 'VIEWS.TOPIC_CREATE.NOTIFICATION_SUCCESS_MESSAGE');
        this.router.navigate(['/topics', savedTopic.id]);
      },
      error: () => {
        this.isLoading.set(false);
        this.notification.showRaw('error', 'VIEWS.TOPIC_CREATE.ERROR_PUBLISH_FAILED');
      }
    });
  }
}

