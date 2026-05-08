import { Component, input, output, inject, signal, computed, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription, interval, take, lastValueFrom, takeWhile } from 'rxjs';
import { CommonModule } from '@angular/common';

import { TopicIdeationService, IdeaStatus } from '../../../../../core/services/topic-ideation.service';
import { IdeaAttachmentService } from '../../../../../core/services/idea-attachment.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { UploadService } from '../../../../../core/services/upload.service';
import { UserStore } from '../../../../../core/state/user.store';
import { ConfigStore } from '../../../../../core/state/config.store';
import { DialogService } from '../../../../../shared/dialog/dialog.service';
import { Topic } from '../../../../../core/interfaces/topic';
import { Ideation } from '../../../../../core/interfaces/ideation';
import { Idea } from '../../../../../core/interfaces/idea';
import { Attachment } from '../../../../../core/interfaces/attachment';
import { MarkdownDirective } from '../../../../../shared/directives/markdown.directive';
import { CosDropdownDirective } from '../../../../../shared/directives/cos-dropdown.directive';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { AnonymousDialogComponent } from '../anonymous-dialog/anonymous-dialog.component';
import { CloseWithoutSavingDialogComponent } from '../close-without-saving-dialog/close-without-saving-dialog.component';

const AUTOSAVE_INTERVAL = 15000;
const AUTOSAVE_HIDE_DELAY = 2000;
const STATEMENT_MAXLENGTH = 1024;
const IMAGE_LIMIT = 10;
const AGE_LIMIT = 110;

const municipalities: { name: string }[] = [
  { name: 'Alutaguse vald' }, { name: 'Anija vald' }, { name: 'Antsla vald' },
  { name: 'Elva vald' }, { name: 'Haapsalu linn' }, { name: 'Haljala vald' },
  { name: 'Harku vald' }, { name: 'Hiiumaa vald' }, { name: 'Häädemeeste vald' },
  { name: 'Jõelähtme vald' }, { name: 'Jõgeva vald' }, { name: 'Jõhvi vald' },
  { name: 'Järva vald' }, { name: 'Kadrina vald' }, { name: 'Kambja vald' },
  { name: 'Kanepi vald' }, { name: 'Kastre vald' }, { name: 'Kehtna vald' },
  { name: 'Keila linn' }, { name: 'Kihnu vald' }, { name: 'Kiili vald' },
  { name: 'Kohila vald' }, { name: 'Kohtla-Järve linn' }, { name: 'Kose vald' },
  { name: 'Kuusalu vald' }, { name: 'Lääne-Harju vald' }, { name: 'Lääne-Nigula vald' },
  { name: 'Lääneranna vald' }, { name: 'Lüganuse vald' }, { name: 'Luunja vald' },
  { name: 'Märjamaa vald' }, { name: 'Mulgi vald' }, { name: 'Muhu vald' },
  { name: 'Mustamäe linnaosa' }, { name: 'Nõmme linnaosa' }, { name: 'Narva linn' },
  { name: 'Narva-Jõesuu linn' }, { name: 'Otepää vald' }, { name: 'Paide linn' },
  { name: 'Peipsiääre vald' }, { name: 'Piirissaare vald' }, { name: 'Põhja-Pärnumaa vald' },
  { name: 'Põhja-Sakala vald' }, { name: 'Põltsamaa vald' }, { name: 'Põlva vald' },
  { name: 'Pärnu linn' }, { name: 'Raasiku vald' }, { name: 'Rae vald' },
  { name: 'Rapla vald' }, { name: 'Ruhnu vald' }, { name: 'Saarde vald' },
  { name: 'Saaremaa vald' }, { name: 'Setomaa vald' }, { name: 'Sillamäe linn' },
  { name: 'Tallinn' }, { name: 'Tapa vald' }, { name: 'Tartu linn' },
  { name: 'Tartu vald' }, { name: 'Toila vald' }, { name: 'Tori vald' },
  { name: 'Tõrva vald' }, { name: 'Türi vald' }, { name: 'Valga vald' },
  { name: 'Viimsi vald' }, { name: 'Viljandi linn' }, { name: 'Viljandi vald' },
  { name: 'Vinni vald' }, { name: 'Viru-Nigula vald' }, { name: 'Vormsi vald' },
  { name: 'Väike-Maarja vald' }, { name: 'Võru linn' }, { name: 'Võru vald' },
];

@Component({
  selector: 'app-edit-idea',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, MarkdownDirective, CosDropdownDirective, InputComponent],
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
  private userStore = inject(UserStore);
  private configStore = inject(ConfigStore);
  private dialog = inject(DialogService);
  private translate = inject(TranslateService);

  @ViewChild('imageUpload') fileInput?: ElementRef;

  statement = signal('');
  description = signal('');
  images = signal<Attachment[]>([]);
  newImages = signal<any[]>([]);
  errors = signal<Record<string, string>>({});
  isAutosaving = signal(false);
  isPublished = signal(false);

  residenceValue = signal('');
  residenceError = signal(false);
  genderValue = signal('');
  genderError = signal(false);

  readonly STATEMENT_MAXLENGTH = STATEMENT_MAXLENGTH;
  readonly IMAGE_LIMIT = IMAGE_LIMIT;
  readonly AGE_LIMIT = AGE_LIMIT;

  readonly residenceItems = municipalities.map(m => ({ title: m.name, value: m.name }));
  readonly genderItems = ['female', 'male', 'other'].map(v => ({
    title: `VIEWS.IDEATION_CREATE.DEMOGRAPHICS_DATA_GENDER_${v.toUpperCase()}`,
    value: v,
  }));

  isCountryEstonia = computed(() => this.topic().country === 'Estonia');

  demographicValues = signal<Record<string, string>>({});

  private autosaveSubscription?: Subscription;

  ngOnInit() {
    const idea = this.idea();
    this.statement.set(idea.statement);
    this.description.set(idea.description);
    this.isPublished.set(idea.status === IdeaStatus.published);

    const config = this.ideation().demographicsConfig;
    if (config && idea.demographics) {
      const vals: Record<string, string> = {};
      Object.keys(config).forEach(key => {
        const val = (idea.demographics as any)?.[key] || '';
        vals[key] = val;
        if (key === 'residence') {
          const isOther = val.startsWith('other: ');
          this.residenceValue.set(isOther ? 'other' : val);
        }
        if (key === 'gender') {
          const isOther = val.startsWith('other: ');
          this.genderValue.set(isOther ? 'other' : val);
        }
      });
      this.demographicValues.set(vals);
    }

    this.attachmentService.getItems({
      topicId: this.topic().id,
      ideationId: idea.ideationId,
      ideaId: idea.id,
      limit: 100,
      page: 1,
      offset: 0
    }).pipe(take(1)).subscribe((res: any) => {
      this.images.set(res.rows ?? []);
    });
  }

  ngOnDestroy() {
    this.autosaveSubscription?.unsubscribe();
  }

  getDemographicKeys(): string[] {
    return Object.keys(this.ideation().demographicsConfig || {});
  }

  setDemographicValue(key: string, value: string) {
    this.demographicValues.update(v => ({ ...v, [key]: value }));
    if (this.isPublished() || this.autosaveSubscription && !this.autosaveSubscription.closed) return;
    this.maybeStartAutosave();
  }

  setResidenceValue(value: string) {
    this.residenceValue.set(value);
    this.residenceError.set(false);
    this.setDemographicValue('residence', value === 'other' ? '' : value);
  }

  setGenderValue(value: string) {
    this.genderValue.set(value);
    this.genderError.set(false);
    this.setDemographicValue('gender', value === 'other' ? '' : value);
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

  onAgeChange(value: string) {
    let num = parseInt(value, 10);
    if (!isNaN(num)) {
      if (num > AGE_LIMIT) num = AGE_LIMIT;
      if (num < 0) num = 0;
      this.setDemographicValue('age', String(num));
    }
  }

  numberOnly(event: KeyboardEvent): boolean {
    const charCode = event.which || event.keyCode;
    return charCode <= 31 || (charCode >= 48 && charCode <= 57);
  }

  private maybeStartAutosave() {
    if (this.isPublished() || (this.autosaveSubscription && !this.autosaveSubscription.closed)) return;
    this.autosaveSubscription = interval(AUTOSAVE_INTERVAL).subscribe(() => {
      this.saveIdea(this.idea().status, true);
    });
  }

  private validateForPublish(): boolean {
    const errs: Record<string, string> = {};
    if (!this.statement().trim()) errs['statement'] = 'COMPONENTS.ADD_IDEA.FIELD_IS_MANDATORY';
    if (!this.description().trim()) errs['description'] = 'COMPONENTS.ADD_IDEA.FIELD_IS_MANDATORY';

    const config = this.ideation().demographicsConfig;
    if (config) {
      if ('residence' in config && !this.residenceValue()) {
        this.residenceError.set(true);
        errs['residence'] = 'COMPONENTS.ADD_IDEA.FIELD_IS_MANDATORY';
      }
      if ('gender' in config && !this.genderValue()) {
        this.genderError.set(true);
        errs['gender'] = 'COMPONENTS.ADD_IDEA.FIELD_IS_MANDATORY';
      }
    }

    this.errors.set(errs);
    return Object.keys(errs).length === 0;
  }

  private buildDemographics(): Record<string, string> | null {
    const config = this.ideation().demographicsConfig;
    if (!config) return null;

    const prefix = 'other: ';
    const result: Record<string, string> = {};
    Object.keys(config).forEach(key => {
      if (key === 'residence') {
        const selected = this.residenceValue();
        const freeText = this.demographicValues()[key] || '';
        result[key] = selected === 'other' ? prefix + freeText : selected;
      } else if (key === 'gender') {
        const selected = this.genderValue();
        const freeText = this.demographicValues()[key] || '';
        result[key] = selected === 'other' ? prefix + freeText : selected;
      } else {
        result[key] = this.demographicValues()[key] || '';
      }
    });
    return result;
  }

  publish() {
    if (!this.validateForPublish()) return;
    if (this.ideation().allowAnonymous) {
      const dlg = this.dialog.open(AnonymousDialogComponent);
      dlg.afterClosed().subscribe(res => {
        if (res) this.saveIdea(IdeaStatus.published);
      });
    } else {
      this.saveIdea(IdeaStatus.published);
    }
  }

  saveDraft() {
    this.saveIdea(IdeaStatus.draft);
  }

  deleteDraft() {
    this.ideationService.deleteIdea({
      topicId: this.topic().id,
      ideationId: this.ideation().id,
      ideaId: this.idea().id,
    }).pipe(take(1)).subscribe(() => {
      this.closed.emit();
    });
  }

  close() {
    if (this.autosaveSubscription && !this.autosaveSubscription.closed) {
      const dlg = this.dialog.open(CloseWithoutSavingDialogComponent);
      dlg.afterClosed().subscribe(res => {
        if (!res) {
          this.saveIdea(IdeaStatus.draft);
          this.autosaveSubscription?.unsubscribe();
          this.closed.emit();
        }
      });
    } else {
      this.autosaveSubscription?.unsubscribe();
      this.closed.emit();
    }
  }

  isDraft(): boolean {
    return this.idea().status === IdeaStatus.draft;
  }

  loggedIn(): boolean {
    return this.userStore.isAuthenticated();
  }

  uploadImage() {
    this.fileInput?.nativeElement.click();
  }

  fileUpload(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (!files) return;
    const allowedTypes = ['image/gif', 'image/jpeg', 'image/png', 'image/svg+xml'];

    if (this.images().length + this.newImages().length >= IMAGE_LIMIT) {
      this.notificationService.error(
        this.translate.instant('MSG_ERROR_IDEA_IMAGE_LIMIT', { limit: IMAGE_LIMIT })
      );
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (allowedTypes.indexOf(file.type) < 0) {
        this.notificationService.error(
          this.translate.instant('MSG_ERROR_FILE_TYPE_NOT_ALLOWED', { allowedFileTypes: allowedTypes.toString() })
        );
      } else if (file.size > 5000000) {
        this.notificationService.error(
          this.translate.instant('MSG_ERROR_FILE_TOO_LARGE', { allowedFileSize: '5MB' })
        );
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
      demographics: this.buildDemographics(),
    }).pipe(take(1)).subscribe({
      next: (idea) => {
        if (isAutosave) {
          setTimeout(() => this.isAutosaving.set(false), AUTOSAVE_HIDE_DELAY);
        } else {
          this.autosaveSubscription?.unsubscribe();
          this.ideaUpdated.emit(idea);
          this.doSaveAttachments(idea.id);
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

  private async doSaveAttachments(ideaId: string) {
    const topicId = this.topic().id;
    const ideationId = this.ideation().id;
    let errorsCounter = 0;

    for (const img of this.newImages()) {
      const uploadUrl = `${this.configStore.api.baseUrl()}/api/users/self/topics/${topicId}/ideations/${ideationId}/ideas/${ideaId}/image/upload`;
      const upload$ = this.uploadService.upload(uploadUrl, img.file, { name: img.name })
        .pipe(takeWhile((e: any) => !e.link, true));
      try {
        await lastValueFrom(upload$);
      } catch {
        errorsCounter++;
      }
    }

    if (errorsCounter > 0) {
      this.notificationService.error(
        this.translate.instant('MSG_ERROR_POST_API_USERS_TOPICS_IDEATIONS_IDEAS_IMAGE_UPLOAD_500')
      );
    }

    this.newImages.set([]);
    this.attachmentService.getItems({
      topicId,
      ideationId,
      ideaId,
      limit: 100,
      page: 1,
      offset: 0
    }).pipe(take(1)).subscribe((res: any) => {
      this.images.set(res.rows ?? []);
    });
  }
}
