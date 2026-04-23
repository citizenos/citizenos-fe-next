import { Component, OnInit, signal, inject, ChangeDetectionStrategy, effect } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TopicService } from '../../../core/services/topic.service';
import { TopicIdeationService } from '../../../core/services/topic-ideation.service';
import { UploadService } from '../../../core/services/upload.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Topic } from '../../../core/interfaces/topic';
import { Ideation } from '../../../core/interfaces/ideation';
import { StepNavigatorComponent, StepConfig } from '../../../shared/components/step-navigator/step-navigator.component';
import { DomainIconComponent } from '../../../shared/components/domain-icon/domain-icon.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { StepTopicInfoComponent } from '../topic-create/components/step-topic-info/step-topic-info.component';
import { StepTopicSettingsComponent } from '../topic-create/components/step-topic-settings/step-topic-settings.component';
import { StepIdeationSettingsComponent } from './components/step-ideation-settings/step-ideation-settings.component';
import { StepTopicPreviewComponent } from '../topic-create/components/step-topic-preview/step-topic-preview.component';

@Component({
  selector: 'cos-ideation-create',
  standalone: true,
  imports: [
    TranslateModule,
    StepNavigatorComponent,
    DomainIconComponent,
    ButtonComponent,
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
          <cos-domain-icon type="ideation"></cos-domain-icon>
          <span class="small_heading" translate="VIEWS.IDEATION_CREATE.HEADING"></span>
        </h1>
        <cos-step-navigator
          [steps]="steps"
          [currentStep]="currentStep()"
          (stepChange)="onStepChange($event)"
        >
          <div actions>
            <cos-button variant="secondary" (clicked)="saveAsDraft()">
              {{ 'VIEWS.TOPIC_CREATE.BTN_SAVE_DRAFT' | translate }}
            </cos-button>
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
