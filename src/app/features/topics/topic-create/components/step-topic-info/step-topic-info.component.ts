import { Component, input, output, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Topic } from '../../../../../core/interfaces/topic';
import { ImageUploadComponent } from '../../../../../shared/components/image-upload/image-upload.component';
@Component({
  selector: 'cos-step-topic-info',
  standalone: true,
  imports: [FormsModule, TranslateModule, ImageUploadComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="step-container">
      <div class="form-section">
        <label translate="VIEWS.TOPIC_CREATE.TITLE_HEADING"></label>
        <input
          type="text"
          [ngModel]="topic().title"
          (ngModelChange)="onUpdate({title: $event})"
          [placeholder]="'VIEWS.TOPIC_CREATE.TITLE_HEADING' | translate"
          class="title-input"
          id="topic_title"
        />
      </div>

      <div class="form-section">
        <label translate="VIEWS.TOPIC_CREATE.TITLE_INTRO"></label>
        <textarea
          [ngModel]="topic().intro"
          (ngModelChange)="onUpdate({intro: $event})"
          [placeholder]="'VIEWS.TOPIC_CREATE.TITLE_INTRO_TEXT' | translate"
          class="intro-input"
          rows="3"
        ></textarea>
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
        <button
          class="btn-primary"
          [disabled]="!topic().title"
          (click)="next.emit()"
          translate="VIEWS.TOPIC_CREATE.FOOTER_BTN_CONTINUE"
        ></button>
      </div>
    </div>
  `,
  styles: [`
    .step-container {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .form-section {
      display: flex;
      flex-direction: column;
      gap: 8px;

      label {
        font-weight: 600;
        font-size: 14px;
      }
    }

    .title-input {
      font-size: 20px;
      font-weight: 500;
      padding: 12px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      &:focus { border-color: var(--color-primary); outline: none; }
    }

    .intro-input {
      font-size: 16px;
      padding: 12px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      resize: vertical;
      &:focus { border-color: var(--color-primary); outline: none; }
    }

    .char-count {
      align-self: flex-end;
      font-size: 12px;
      color: var(--color-text-muted);
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
    }

    .btn-primary {
      padding: 12px 32px;
      background: var(--color-primary);
      color: white;
      border: none;
      border-radius: var(--radius-md);
      font-weight: 600;
      cursor: pointer;
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }
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
