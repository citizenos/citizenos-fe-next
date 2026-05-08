import { Component, input, output, inject, signal, computed, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription, interval, take, lastValueFrom, takeWhile } from 'rxjs';
import { CommonModule } from '@angular/common';

import { TopicIdeationService, IdeaStatus } from '../../../../../core/services/topic-ideation.service';
import { IdeaAttachmentService } from '../../../../../core/services/idea-attachment.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { UploadService } from '../../../../../core/services/upload.service';
import { Topic } from '../../../../../core/interfaces/topic';
import { Ideation } from '../../../../../core/interfaces/ideation';
import { Idea } from '../../../../../core/interfaces/idea';
import { Attachment } from '../../../../../core/interfaces/attachment';
import { CosIconComponent } from '../../../../../shared/components/icon/icon.component';

const AUTOSAVE_INTERVAL = 15000;
const AUTOSAVE_HIDE_DELAY = 2000;
const STATEMENT_MAXLENGTH = 1024;
const IMAGE_LIMIT = 10;

@Component({
  selector: 'app-edit-idea',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, CosIconComponent],
  templateUrl: './edit-idea.component.html',
  styleUrls: ['./edit-idea.component.scss'],
})
export class EditIdeaComponent implements OnInit, OnDestroy {
  topic = input.required<Topic>();
  ideation = input.required<Ideation>();
  idea = input.required<Idea>();

  ideaUpdated = output<Idea>();
  closed = output<void>();

  private ideationService = inject(TopicIdeationService);
  private attachmentService = inject(IdeaAttachmentService);
  private notificationService = inject(NotificationService);
  private uploadService = inject(UploadService);
  private translate = inject(TranslateService);

  statement = signal('');
  description = signal('');
  images = signal<Attachment[]>([]);
  newImages = signal<any[]>([]);
  errors = signal<Record<string, string>>({});
  isAutosaving = signal(false);
  isPublished = signal(false);

  STATEMENT_MAXLENGTH = STATEMENT_MAXLENGTH;
  IMAGE_LIMIT = IMAGE_LIMIT;

  private autosaveSubscription?: Subscription;

  ngOnInit() {
    const idea = this.idea();
    this.statement.set(idea.statement);
    this.description.set(idea.description);
    this.isPublished.set(idea.status === IdeaStatus.published);

    this.attachmentService.getItems({
        topicId: this.topic().id,
        ideationId: idea.ideationId,
        ideaId: idea.id,
        limit: 100,
        page: 1,
        offset: 0
    }).pipe(take(1)).subscribe((res: any) => {
        this.images.set(res.rows);
    });
  }

  ngOnDestroy() {
    this.autosaveSubscription?.unsubscribe();
  }

  onStatementChange(value: string) {
    this.statement.set(value);
    this.errors.update(e => ({ ...e, statement: '' }));
    this.maybeStartAutosave();
  }

  onDescriptionChange(value: string) {
    this.description.set(value);
    this.errors.update(e => ({ ...e, description: '' }));
    this.maybeStartAutosave();
  }

  private maybeStartAutosave() {
    if (this.isPublished() || this.autosaveSubscription && !this.autosaveSubscription.closed) return;
    this.autosaveSubscription = interval(AUTOSAVE_INTERVAL).subscribe(() => {
      this.saveIdea(this.idea().status, true);
    });
  }

  validate(): boolean {
    const errs: Record<string, string> = {};
    if (!this.statement().trim()) errs['statement'] = 'VIEWS.IDEATION_CREATE.ERROR_STATEMENT_REQUIRED';
    if (!this.description().trim()) errs['description'] = 'VIEWS.IDEATION_CREATE.ERROR_DESCRIPTION_REQUIRED';
    this.errors.set(errs);
    return Object.keys(errs).length === 0;
  }

  publish() {
    if (!this.validate()) return;
    this.saveIdea(IdeaStatus.published);
  }

  saveDraft() {
    this.saveIdea(IdeaStatus.draft);
  }

  close() {
    this.autosaveSubscription?.unsubscribe();
    this.closed.emit();
  }

  private saveIdea(status: IdeaStatus, isAutosave = false) {
    const topicId = this.topic().id;
    const ideationId = this.ideation().id;
    const ideaId = this.idea().id;
    let statement = this.statement();
    let description = this.description();

    if (status === IdeaStatus.draft) {
      if (!statement) statement = '';
      if (!description) description = '';
    }

    if (isAutosave) this.isAutosaving.set(true);

    this.ideationService.updateIdea({
        topicId,
        ideationId,
        ideaId,
        statement,
        description,
        status,
        demographics: this.getDemographicValues()
    }).pipe(take(1)).subscribe({
      next: (idea) => {
        if (isAutosave) {
          setTimeout(() => this.isAutosaving.set(false), AUTOSAVE_HIDE_DELAY);
        } else {
          this.doSaveAttachments(idea.id);
          this.ideaUpdated.emit(idea);
          this.close();
        }
      },
      error: (err) => {
        if (isAutosave) {
          setTimeout(() => this.isAutosaving.set(false), AUTOSAVE_HIDE_DELAY);
        } else {
          this.errors.set(err?.errors ?? {});
        }
      },
    });
  }

  getDemographicValues() {
    // Porting legacy logic for demographics
    const config = this.ideation().demographicsConfig;
    if (!config) return null;

    const values: Record<string, string> = {};
    Object.keys(config).forEach(key => {
        values[key] = config[key].value || '';
    });
    return values;
  }

  fileUpload(event: any) {
    const files = event.target.files;
    const allowedTypes = ['image/gif', 'image/jpeg', 'image/png', 'image/svg+xml'];

    if (this.images().length + this.newImages().length >= IMAGE_LIMIT) {
      this.notificationService.addError(this.translate.instant('MSG_ERROR_IDEA_IMAGE_LIMIT', { limit: IMAGE_LIMIT }));
      return;
    }

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (allowedTypes.indexOf(file.type) < 0) {
            this.notificationService.addError(this.translate.instant('MSG_ERROR_FILE_TYPE_NOT_ALLOWED', { allowedFileTypes: allowedTypes.toString() }));
        } else if (file.size > 5000000) {
            this.notificationService.addError(this.translate.instant('MSG_ERROR_FILE_TOO_LARGE', { allowedFileSize: '5MB' }));
        } else if (this.images().length + this.newImages().length < IMAGE_LIMIT) {
            const reader = new FileReader();
            reader.onload = () => {
                this.newImages.update(imgs => [...imgs, { file, link: reader.result, name: file.name }]);
            };
            reader.readAsDataURL(file);
        }
    }
  }

  removeNewImage(index: number) {
    this.newImages.update(imgs => imgs.filter((_, i) => i !== index));
  }

  removeImage(image: Attachment, index: number) {
    this.attachmentService.delete({
        topicId: this.topic().id,
        ideationId: this.ideation().id,
        ideaId: this.idea().id,
        attachmentId: image.id
    }).pipe(take(1)).subscribe(() => {
        this.images.update(imgs => imgs.filter((_, i) => i !== index));
    });
  }

  async doSaveAttachments(ideaId: string) {
    const uploadedImages = [];
    for (const img of this.newImages()) {
        const upload$ = this.uploadService.uploadIdeaImage(
            { topicId: this.topic().id, ideationId: this.ideation().id, ideaId },
            img.file,
            { name: img.name }
        ).pipe(takeWhile((e) => !e.link, true));

        try {
            const uploaded = await lastValueFrom(upload$);
            uploadedImages.push(uploaded);
        } catch (e) {
            console.error(e);
        }
    }
    this.newImages.set([]);
    // Update images list
    this.attachmentService.getItems({
        topicId: this.topic().id,
        ideationId: this.ideation().id,
        ideaId: ideaId,
        limit: 100,
        page: 1,
        offset: 0
    }).pipe(take(1)).subscribe((res: any) => {
        this.images.set(res.rows);
    });
  }
}
