import { Component, OnInit, signal, inject, ChangeDetectionStrategy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TopicService } from '../../../core/services/topic.service';
import { TopicIdeationService } from '../../../core/services/topic-ideation.service';
import { UploadService } from '../../../core/services/upload.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Topic } from '../../../core/interfaces/topic';
import { Ideation } from '../../../core/interfaces/ideation';
import { StepNavigatorComponent, StepConfig } from '../../../shared/components/step-navigator/step-navigator.component';
import { StepTopicInfoComponent } from '../topic-create/components/step-topic-info/step-topic-info.component';
import { StepTopicSettingsComponent } from '../topic-create/components/step-topic-settings/step-topic-settings.component';
import { StepIdeationSettingsComponent } from './components/step-ideation-settings/step-ideation-settings.component';
import { StepTopicPreviewComponent } from '../topic-create/components/step-topic-preview/step-topic-preview.component';

@Component({
  selector: 'cos-ideation-create',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    StepNavigatorComponent,
    StepTopicInfoComponent,
    StepTopicSettingsComponent,
    StepIdeationSettingsComponent,
    StepTopicPreviewComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="wizard-container">
      <div class="create-header">
        <h1 class="create_heading">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="40" height="40" rx="20" fill="#E4B722" />
            <path
              d="M20 10C16.14 10 13 13.14 13 17C13 19.38 14.19 21.47 16 22.72V26C16 26.55 16.45 27 17 27H23C23.55 27 24 26.55 24 26V22.72C25.81 21.47 27 19.38 27 17C27 13.14 23.86 10 20 10ZM17.5 30C17.5 30.55 17.95 31 18.5 31H21.5C22.05 31 22.5 30.55 22.5 30V29H17.5V30Z"
              fill="white" />
          </svg>
          <span class="small_heading" translate="VIEWS.IDEATION_CREATE.HEADING"></span>
        </h1>
        <cos-step-navigator
          [steps]="steps"
          [currentStep]="currentStep()"
          (stepChange)="onStepChange($event)"
        >
          <div actions>
            <button class="btn-save-draft" (click)="saveAsDraft()" translate="VIEWS.TOPIC_CREATE.BTN_SAVE_DRAFT"></button>
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
              (next)="onStepChange('ideation')"
              (previous)="onStepChange('info')"
            ></cos-step-topic-settings>
          }
          @case ('ideation') {
            <cos-step-ideation-settings
              [ideation]="$any(ideation())"
              (ideationUpdate)="onIdeationUpdate($event)"
              (next)="onStepChange('preview')"
              (previous)="onStepChange('settings')"
            ></cos-step-ideation-settings>
          }
          @case ('preview') {
            <cos-step-topic-preview
              [topic]="$any(topic())"
              (previous)="onStepChange('ideation')"
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
  `]
})
export class IdeationCreateComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private topicService = inject(TopicService);
  private ideationService = inject(TopicIdeationService);
  private uploadService = inject(UploadService);
  private notification = inject(NotificationService);

  steps: StepConfig[] = [
    { key: 'info', label: 'VIEWS.IDEATION_CREATE.CREATE_TAB_1', icon: 'info' },
    { key: 'settings', label: 'VIEWS.IDEATION_CREATE.CREATE_TAB_2', icon: 'settings' },
    { key: 'ideation', label: 'VIEWS.IDEATION_CREATE.CREATE_TAB_3', icon: 'activity' },
    { key: 'preview', label: 'VIEWS.IDEATION_CREATE.CREATE_TAB_4', icon: 'eye' }
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
  ideation = signal<Partial<Ideation>>({
    question: '',
    allowAnonymous: false,
    disableReplies: false
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
      if (topic.ideationId) {
        this.ideationService.get({ topicId: topic.id, ideationId: topic.ideationId }).subscribe(ideation => {
          this.ideation.set(ideation);
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

  onIdeationUpdate(updates: Partial<Ideation>) {
    this.ideation.update(i => ({ ...i, ...updates }));
  }

  onInfoNext() {
    if (!this.topic().id) {
      this.topicService.save(this.topic()).subscribe(topic => {
        this.topic.set(topic);
        this.createIdeationObject(topic.id);
      });
    } else {
      this.onStepChange('settings');
    }
  }

  private createIdeationObject(topicId: string) {
    const data = { ...this.ideation(), topicId, question: ' ' };
    this.ideationService.save(data).subscribe(ideation => {
      this.ideation.set(ideation);
      this.onStepChange('settings');
    });
  }

  saveAsDraft() {
    this.topicService.patch(this.topic()).subscribe(() => {
      if (this.ideation().id) {
        this.ideationService.update({ ...this.ideation(), topicId: this.topic().id }).subscribe();
      }
      this.notification.success('VIEWS.TOPIC_EDIT.NOTIFICATION_SUCCESS_MESSAGE');
      this.router.navigate(['/topics', this.topic().id]);
    });
  }

  onPublish() {
    const topicData = { ...this.topic(), status: 'ideation' };
    this.topicService.patch(topicData).subscribe(() => {
      this.ideationService.update({ ...this.ideation(), topicId: this.topic().id }).subscribe(() => {
        this.notification.success('VIEWS.TOPIC_CREATE.NOTIFICATION_SUCCESS_MESSAGE');
        this.router.navigate(['/topics', this.topic().id]);
      });
    });
  }
}
