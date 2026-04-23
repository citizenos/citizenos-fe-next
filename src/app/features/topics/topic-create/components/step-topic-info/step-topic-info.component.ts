import { Component, input, output, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Topic } from '../../../../../core/interfaces/topic';
import { ImageUploadComponent } from '../../../../../shared/components/image-upload/image-upload.component';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';

@Component({
  selector: 'cos-step-topic-info',
  standalone: true,
  imports: [FormsModule, TranslateModule, ImageUploadComponent, InputComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="step-container">
      <div class="form-section">
        <label translate="VIEWS.TOPIC_CREATE.TITLE_HEADING"></label>
        <cos-input [placeholder]="'VIEWS.TOPIC_CREATE.TITLE_HEADING' | translate">
          <input
            type="text"
            [ngModel]="topic().title"
            (ngModelChange)="onUpdate({title: $event})"
            id="topic_title"
          />
        </cos-input>
      </div>

      <div class="form-section">
        <label translate="VIEWS.TOPIC_CREATE.TITLE_INTRO"></label>
        <cos-input [placeholder]="'VIEWS.TOPIC_CREATE.TITLE_INTRO_TEXT' | translate">
          <textarea
            [ngModel]="topic().intro"
            (ngModelChange)="onUpdate({intro: $event})"
            rows="3"
            maxlength="500"
          ></textarea>
        </cos-input>
        <div class="char-count">{{ (topic().intro?.length || 0) }}/500</div>
      </div>

      <div class="form-section">
        <label translate="VIEWS.TOPIC_CREATE.TITLE_HEADER_IMAGE"></label>
        <cos-image-upload
          [imageUrl]="topic().imageUrl || null"
          (imageFileChange)="onImageChange($event)"
          (imageRemoved)="onUpdate({imageUrl: null})"
        ></cos-image-upload>
      </div>

      <div class="actions">
        <cos-button
          variant="primary"
          [isDisabled]="!topic().title"
          (clicked)="next.emit()"
        >
          {{ 'VIEWS.TOPIC_CREATE.FOOTER_BTN_CONTINUE' | translate }}
        </cos-button>
      </div>
    </div>
  `,
  styles: [`
    .step-container { display: flex; flex-direction: column; gap: 24px; }
    .form-section { display: flex; flex-direction: column; gap: 8px; label { font-weight: 600; font-size: 14px; } }
    .char-count { align-self: flex-end; font-size: 12px; color: var(--color-text-muted); }
    .actions { display: flex; justify-content: flex-end; margin-top: 20px; }
  `]
})
export class StepTopicInfoComponent {
  topic = input<Partial<Topic>>({
    title: '',
    intro: '',
    description: '<html><head></head><body></body></html>',
    visibility: 'private',
    categories: [],
    status: 'draft'
  });
  topicUpdate = output<Partial<Topic>>();
  imageFileUpdate = output<File | null>();
  next = output<void>();

  onUpdate(updates: Partial<Topic>) {
    this.topicUpdate.emit(updates);
  }

  onImageChange(file: File | null) {
    this.imageFileUpdate.emit(file);
  }
}
