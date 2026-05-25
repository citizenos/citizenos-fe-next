import { Component, input, output, signal, inject, ChangeDetectionStrategy, ElementRef, ViewChild } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'cos-image-upload',
  standalone: true,
  imports: [TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="image-upload">
      @if (!hasImage()) {
        <div
          class="upload-area"
          (dragover)="onDragOver($event)"
          (drop)="onDrop($event)"
        >
          <div class="upload-info">
            <div class="upload-title">{{ 'VIEWS.TOPIC_CREATE.HEADER_IMAGE_UPLOAD_DESC' | translate }}</div>
            <div class="upload-desc">{{ 'VIEWS.TOPIC_CREATE.HEADER_IMAGE_UPLOAD_DESC_TEXT' | translate }}</div>
          </div>
          <input
            #imageUpload
            id="image_upload_input"
            type="file"
            accept="image/gif,image/jpeg,image/png,image/svg+xml"
            (change)="onFileSelect()"
          />
          <button
            type="button"
            id="image_upload_button"
            class="btn_medium_secondary"
            (click)="triggerUpload()"
          >{{ 'VIEWS.TOPIC_CREATE.HEADER_IMAGE_UPLOAD_BTN' | translate }}</button>
        </div>
      } @else {
        <div class="image-preview">
          <img [src]="previewUrl() || imageUrl()" alt="" />
        </div>
      }

      @if (error()) {
        <div class="upload-error">{{ error() }}</div>
      }
    </div>
  `,
  styles: [`
    .image-upload {
      width: 100%;
    }

    .upload-area {
      border: 2px dashed var(--color-border);
      border-radius: var(--radius-md);
      padding: 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      text-align: center;
      transition: border-color 0.2s;

      &:hover {
        border-color: var(--color-primary);
      }
    }

    .upload-title {
      font-weight: 600;
      font-size: 14px;
    }

    .upload-desc {
      font-size: 13px;
      color: var(--color-text-muted);
    }

    #image_upload_input {
      display: none;
    }

    .image-preview {
      position: relative;

      img {
        width: 100%;
        max-height: 300px;
        object-fit: cover;
        border-radius: var(--radius-md);
      }
    }

    .remove-btn {
      position: absolute;
      top: 8px;
      right: 8px;
      display: flex;
      align-items: center;
      gap: 4px;
      background: var(--color-surfaces);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: 6px 12px;
      cursor: pointer;
      font-size: 13px;
      color: var(--color-primary);

      &:hover {
        background: var(--color-secondary);
      }
    }

    .upload-error {
      margin-top: 8px;
      padding: 8px 12px;
      background: #fef2f2;
      border: 1px solid var(--color-danger);
      border-radius: var(--radius-md);
      color: var(--color-danger);
      font-size: 13px;
    }
  `]
})
export class ImageUploadComponent {
  private translate = inject(TranslateService);
  private notification = inject(NotificationService);

  @ViewChild('imageUpload') fileInput?: ElementRef<HTMLInputElement>;

  imageUrl = input<string | null>(null);
  imageFileChange = output<File | null>();
  imageRemoved = output<void>();

  previewUrl = signal<string | null>(null);
  error = signal<string>('');

  private readonly allowedTypes = ['image/gif', 'image/jpeg', 'image/png', 'image/svg+xml'];
  private readonly maxSize = 5_000_000;

  hasImage() {
    return !!(this.previewUrl() || this.imageUrl());
  }

  triggerUpload() {
    this.fileInput?.nativeElement.click();
  }

  onFileSelect() {
    const files = this.fileInput?.nativeElement.files;
    if (files?.length) {
      this.processFile(files[0]);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer?.files;
    if (files?.length) {
      this.processFile(files[0]);
    }
  }

  removeImage() {
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
    this.previewUrl.set(null);
    this.error.set('');
    this.imageFileChange.emit(null);
    this.imageRemoved.emit();
  }

  private processFile(file: File) {
    this.error.set('');

    if (!this.allowedTypes.includes(file.type)) {
      const msg = this.translate.instant('MSG_ERROR_FILE_TYPE_NOT_ALLOWED', {
        allowedFileTypes: this.allowedTypes.join(', ')
      });
      this.error.set(msg);
      this.notification.showRaw('error', msg);
      return;
    }

    if (file.size > this.maxSize) {
      const msg = this.translate.instant('MSG_ERROR_FILE_TOO_LARGE', {
        allowedFileSize: '5MB'
      });
      this.error.set(msg);
      this.notification.showRaw('error', msg);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      this.previewUrl.set(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    this.imageFileChange.emit(file);
  }
}
