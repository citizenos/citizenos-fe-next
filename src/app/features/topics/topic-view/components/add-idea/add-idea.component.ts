import { UserStore } from '../../../../../core/state/user.store';
import { AuthDialogService } from '../../../../../core/services/auth-dialog.service';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';

import { Router, ActivatedRoute } from '@angular/router';
import { Component, input, output, signal, inject, ChangeDetectionStrategy, OnInit, OnDestroy, ElementRef, ViewChild, computed, model, effect } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { take, lastValueFrom, Subscription, interval } from 'rxjs';

import { TopicIdeationService } from '../../../../../core/services/topic-ideation.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { UploadService } from '../../../../../core/services/upload.service';

import { Topic } from '../../../../../core/interfaces/topic';
import { Ideation } from '../../../../../core/interfaces/ideation';
import { Idea, IdeaStatus } from '../../../../../core/interfaces/idea';
import { MarkdownDirective } from '../../../../../shared/directives/markdown.directive';
import { CosDropdownDirective } from '../../../../../shared/directives/cos-dropdown.directive';
import { TooltipComponent } from '../../../../../shared/components/tooltip/tooltip.component';
import { municipalities } from '../../../../../core/services/municipality.service';
import { UpperCasePipe, CommonModule } from '@angular/common';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { DialogService } from '../../../../../shared/dialog';
import { AnonymousDialogComponent } from '../anonymous-dialog/anonymous-dialog.component';
import { CloseWithoutSavingDialogComponent } from '../close-without-saving-dialog/close-without-saving-dialog.component';

@Component({
  selector: 'app-add-idea',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MarkdownDirective,
    CosDropdownDirective,
    TooltipComponent,
    UpperCasePipe,
    InputComponent,
    ButtonComponent,
    IconComponent
  ],
  templateUrl: './add-idea.component.html',
  styleUrls: ['./add-idea.component.scss'],
})
export class AddIdeaComponent implements OnInit, OnDestroy {
  topic = input.required<Topic>();
  ideation = input.required<Ideation>();
  isOpen = model(false);

  ideaAdded = output<Idea>();
  notificationChange = output<unknown>();

  private ideationService = inject(TopicIdeationService);
  private notification = inject(NotificationService);
  private translate = inject(TranslateService);
  private uploadService = inject(UploadService);
  private dialog = inject(DialogService);
  
  private userStore = inject(UserStore);
  private authDialog = inject(AuthDialogService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  @ViewChild('imageUpload') imageUploadInput?: ElementRef<HTMLInputElement>;

  idea: Idea | null = null;

  ideaForm: FormGroup = new FormGroup({
    statement: new FormControl('', [Validators.required, Validators.maxLength(1024)]),
    description: new FormControl('', [Validators.required]),
  });

  IDEA_STATEMENT_MAXLENGTH = 1024;
  IMAGE_LIMIT = 3;
  AUTOSAVE_HIDE_DELAY = 1000;
  private readonly AUTOSAVE_TIME = 15000;
  private autosaveSubscription?: Subscription;
  
  toggleExpand = signal(false);
  isAutosaving = signal(false);
  isSubmitting = signal(false);
  errors = signal<unknown>(null);
  images = signal<{ link: string, name: string, file?: File }[]>([]);
  newImages = signal<{ link: string, name: string, file?: File }[]>([]);
  autosavedIdea = signal<Idea | null>(null);

  municipalities = municipalities;
  filtersData = signal<Record<string, { selectedValue: string; items: { title: string; value: string }[]; error: boolean }>>({
    residence: { selectedValue: '', items: municipalities.map(m => ({ title: m.name, value: m.name })), error: false },
    gender: {
      selectedValue: '',
      items: [
        { title: 'VIEWS.IDEATION_CREATE.DEMOGRAPHICS_DATA_GENDER_FEMALE', value: 'female' },
        { title: 'VIEWS.IDEATION_CREATE.DEMOGRAPHICS_DATA_GENDER_MALE', value: 'male' },
        { title: 'VIEWS.IDEATION_CREATE.DEMOGRAPHICS_DATA_GENDER_OTHER', value: 'other' }
      ],
      error: false
    }
  });

  isCountryEstonia = computed(() => {
    const country = this.topic()?.country?.toLowerCase();
    return country === 'ee' || country === 'estonia';
  });
  description = signal('');

  private previousIsOpen = false;

  constructor() {
    effect(() => {
      const open = this.isOpen();
      if (open && !this.previousIsOpen) {
        this.initAddIdeaForm();
      }
      this.previousIsOpen = open;
    });
  }

  ngOnInit() {
    this.initDemographicsControls();
    this.ideaForm.get('statement')?.valueChanges.subscribe((val: string) => {
      if (this.isOpen() && val && val.trim().length > 0) {
        const isNotSubscribed = !this.autosaveSubscription || this.autosaveSubscription.closed;
        if (isNotSubscribed) {
          this.startAutosave();
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.stopAutosave();
  }

  startAutosave(): void {
    if (this.autosaveSubscription && !this.autosaveSubscription.closed) {
      return;
    }
    this.autosaveSubscription = interval(this.AUTOSAVE_TIME).subscribe(() => {
      const statement = this.ideaForm.get('statement')?.value?.trim();
      const description = this.ideaForm.get('description')?.value?.trim();
      if (statement || description) {
        this.saveIdea(IdeaStatus.draft, true);
      }
    });
  }

  stopAutosave(): void {
    if (this.autosaveSubscription && !this.autosaveSubscription.closed) {
      this.autosaveSubscription.unsubscribe();
    }
  }

  hasIdeationEnded(): boolean {
    return this.ideationService.hasIdeationEnded(this.topic(), this.ideation());
  }

  initDemographicsControls() {
    const config = this.ideation()?.demographicsConfig;
    const isAnonymous = !!this.ideation()?.allowAnonymous;

    if (config) {
      Object.keys(config).forEach(key => {
        const isRequired = isAnonymous && !!config[key]?.required;
        const controlName = 'demographics_' + key;
        const validators = isRequired ? [Validators.required] : [];

        if (!this.ideaForm.contains(controlName)) {
          (this.ideaForm as FormGroup).addControl(controlName, new FormControl(config[key]?.value || '', validators));
        } else {
          const ctrl = this.ideaForm.get(controlName);
          ctrl?.setValidators(validators);
          ctrl?.updateValueAndValidity();
        }
      });
    }
  }

  getDemographicKeys() {
    return this.ideation()?.demographicsConfig ? Object.keys(this.ideation().demographicsConfig!) : [];
  }

  setDemographicsValue(key: string, value: string) {
    this.filtersData.update(data => {
      if (data[key]) {
        data[key].selectedValue = value;
        data[key].error = false;
      }
      return { ...data };
    });
    const ctrl = this.ideaForm.get('demographics_' + key);
    if (ctrl) {
      if (value === 'other') {
        ctrl.setValue('');
      } else {
        ctrl.setValue(value);
      }
      ctrl.markAsTouched();
      ctrl.setErrors(null);
    }
  }

  setFilterValue(key: string, value: string) {
    this.setDemographicsValue(key, value);
  }

  ideaMaxLength() {
    return 10000;
  }

  updateText(text: string) {
    const prevValue = this.description();
    this.description.set(text);
    this.ideaForm.patchValue({ description: text }, { emitEvent: false });

    if (this.isOpen()) {
      const isValueChanged = text && prevValue && text !== prevValue;
      const isNotSubscribed = !this.autosaveSubscription || this.autosaveSubscription.closed;
      if (isValueChanged && isNotSubscribed) {
        this.startAutosave();
      }
    }
  }

  uploadImage() {
    this.imageUploadInput?.nativeElement.click();
  }

  fileUpload() {
    const allowedTypes = [
      'image/gif',
      'image/jpeg',
      'image/png',
      'image/svg+xml',
    ];
    const files = this.imageUploadInput?.nativeElement.files;
    if (!files || !files.length) return;

    if (this.images().length + this.newImages().length >= this.IMAGE_LIMIT) {
      this.notification.error(
        this.translate.instant('MSG_ERROR_IDEA_IMAGE_LIMIT', { limit: this.IMAGE_LIMIT })
      );
      return;
    }

    for (let i = 0; i < files.length; i++) {
      if (allowedTypes.indexOf(files[i].type) < 0) {
        this.notification.error(
          this.translate.instant('MSG_ERROR_FILE_TYPE_NOT_ALLOWED', { allowedFileTypes: allowedTypes.join(', ') })
        );
      } else if (files[i].size > 5000000) {
        this.notification.error(
          this.translate.instant('MSG_ERROR_FILE_TOO_LARGE', { allowedFileSize: '5MB' })
        );
      } else if (this.images().length + i < this.IMAGE_LIMIT) {
        const file = files[i];
        const reader = new FileReader();
        reader.onload = () => {
          this.newImages.update(images => [...images, { link: reader.result as string, name: file.name, file: file }]);
        };
        reader.readAsDataURL(file);
      } else {
        this.notification.error(
          this.translate.instant('MSG_ERROR_IDEA_IMAGE_LIMIT', { limit: this.IMAGE_LIMIT })
        );
      }
    }
  }

  removeNewImage(index: number) {
    this.newImages.update(images => {
      images.splice(index, 1);
      return [...images];
    });
  }

  getDemographicValues(): Record<string, string> | null {
    const config = this.ideation()?.demographicsConfig;
    if (!config) return null;

    const prefix = "other: ";
    const demographics: Record<string, string> = {};
    Object.keys(config).forEach(curr => {
      const filterData = this.filtersData()[curr];
      const ctrl = this.ideaForm.get('demographics_' + curr);
      const customText = ctrl?.value !== null && ctrl?.value !== undefined ? String(ctrl.value).trim() : '';

      if (curr === 'residence') {
        if (this.isCountryEstonia()) {
          const sel = filterData?.selectedValue || '';
          if (sel === 'other') {
            const textWithoutPrefix = customText.startsWith(prefix) ? customText.slice(prefix.length).trim() : customText;
            demographics[curr] = prefix + textWithoutPrefix;
          } else {
            demographics[curr] = sel;
          }
        } else {
          demographics[curr] = customText;
        }
      } else if (curr === 'gender') {
        const sel = filterData?.selectedValue || '';
        if (sel === 'other') {
          const textWithoutPrefix = customText.startsWith(prefix) ? customText.slice(prefix.length).trim() : customText;
          demographics[curr] = prefix + textWithoutPrefix;
        } else {
          demographics[curr] = sel;
        }
      } else {
        demographics[curr] = customText;
      }
    });
    return demographics;
  }

  validateRequiredFieldsForPublish(): boolean {
    const statementCtrl = this.ideaForm.get('statement');
    const descCtrl = this.ideaForm.get('description');

    statementCtrl?.markAsTouched();
    descCtrl?.markAsTouched();

    let isValid = (statementCtrl?.valid ?? false) && (descCtrl?.valid ?? false);

    const config = this.ideation()?.demographicsConfig;
    const isAnonymous = !!this.ideation()?.allowAnonymous;

    if (isAnonymous && config) {
      Object.keys(config).forEach(key => {
        const isRequired = !!config[key]?.required;
        const controlName = 'demographics_' + key;
        const ctrl = this.ideaForm.get(controlName);
        const filterData = this.filtersData()[key];
        const isDropdown = filterData && (key === 'residence' ? this.isCountryEstonia() : true);

        if (isRequired) {
          ctrl?.markAsTouched();

          if (isDropdown) {
            const selVal = filterData.selectedValue;
            const isSelected = !!selVal && String(selVal).trim() !== '';
            const customVal = ctrl?.value ? String(ctrl.value).trim() : '';

            let hasError = false;
            if (!isSelected) {
              hasError = true;
            } else if (selVal === 'other' && (!customVal || customVal === 'other')) {
              hasError = true;
            }

            this.filtersData.update(data => {
              if (data[key]) {
                data[key].error = hasError;
              }
              return { ...data };
            });

            if (hasError) {
              isValid = false;
              ctrl?.setErrors({ required: true });
            } else {
              ctrl?.setErrors(null);
            }
          } else {
            const val = ctrl?.value;
            const isEmpty = val === null || val === undefined || String(val).trim() === '';
            if (isEmpty) {
              ctrl?.setErrors({ required: true });
              isValid = false;
            } else {
              ctrl?.setErrors(null);
            }
          }
        } else {
          if (filterData) {
            this.filtersData.update(data => {
              if (data[key]) {
                data[key].error = false;
              }
              return { ...data };
            });
          }
          ctrl?.setErrors(null);
        }
      });
    } else {
      this.filtersData.update(data => {
        Object.keys(data).forEach(k => {
          data[k].error = false;
        });
        return { ...data };
      });
    }

    return isValid && this.ideaForm.valid;
  }

  saveIdea(status: IdeaStatus, isAutosave = false) {
    const ideaData: Partial<Idea> & { topicId: string; ideationId: string; ideaId?: string } = {
      topicId: this.topic().id,
      ideationId: this.ideation().id,
      statement: this.ideaForm.value.statement || '',
      description: this.ideaForm.value.description || '',
      status: status,
      demographics: this.getDemographicValues() || undefined
    };

    if (status === IdeaStatus.draft) {
      if (!this.ideaForm.value.description) ideaData.description = '';
      if (!this.ideaForm.value.statement) ideaData.statement = '';
    }

    if (isAutosave) {
      this.isAutosaving.set(true);
    } else {
      this.isSubmitting.set(true);
    }

    const draft = this.autosavedIdea();
    if (draft) {
      ideaData.ideaId = draft.id;
      this.ideationService.updateIdea(ideaData as never).pipe(take(1)).subscribe({
        next: (idea) => {
          this.isSubmitting.set(false);
          if (isAutosave) {
            this.autosavedIdea.set(idea);
            setTimeout(() => this.isAutosaving.set(false), this.AUTOSAVE_HIDE_DELAY);
          } else {
            this.afterPost(idea);
          }
        },
        error: (err) => {
          console.error(err);
          this.errors.set(err);
          this.isSubmitting.set(false);
          if (isAutosave) {
            setTimeout(() => this.isAutosaving.set(false), this.AUTOSAVE_HIDE_DELAY);
          } else {
            const msg = err?.error?.status?.message || err?.message || 'MSG_ERROR_POST_API_USERS_TOPICS_IDEATIONS_IDEAS_500';
            this.notification.error(msg);
          }
        }
      });
    } else {
      this.ideationService.createIdea(ideaData as never).pipe(take(1)).subscribe({
        next: (idea) => {
          this.isSubmitting.set(false);
          if (isAutosave) {
            this.autosavedIdea.set(idea);
            setTimeout(() => this.isAutosaving.set(false), this.AUTOSAVE_HIDE_DELAY);
          } else {
            this.afterPost(idea);
          }
        },
        error: (err) => {
          console.error(err);
          this.errors.set(err);
          this.isSubmitting.set(false);
          if (isAutosave) {
            setTimeout(() => this.isAutosaving.set(false), this.AUTOSAVE_HIDE_DELAY);
          } else {
            const msg = err?.error?.status?.message || err?.message || 'MSG_ERROR_POST_API_USERS_TOPICS_IDEATIONS_IDEAS_500';
            this.notification.error(msg);
          }
        }
      });
    }
  }

  async doSaveAttachments(ideaId: string) {
    let errorsCounter = 0;
    const files = this.newImages();
    if (!files.length) return;

    for (const image of files) {
      if (image.file) {
        const path = `/users/${this.userStore.user()?.id}/topics/${this.topic().id}/ideations/${this.ideation().id}/ideas/${ideaId}/image/upload`;
        try {
          await lastValueFrom(this.uploadService.upload(path, image.file, { name: image.name }));
        } catch {
          errorsCounter++;
        }
      }
    }

    if (errorsCounter > 0) {
      this.notification.error('MSG_ERROR_POST_API_USERS_TOPICS_IDEATIONS_IDEAS_IMAGE_UPLOAD_500');
    }
  }

  afterPost(idea: Idea) {
    this.doSaveAttachments(idea.id);

    if (idea.status !== IdeaStatus.draft) {
      this.stopAutosave();
      this.isOpen.set(false);
      this.clear();
      this.ideaAdded.emit(idea);
      this.notification.show('success', 'COMPONENTS.ADD_IDEA.MSG_SUCCESS');
      this.router.navigate(['/', this.translate.currentLang || 'en', 'topics', this.topic().id], {
        queryParams: { ideaId: idea.id },
        fragment: 'ideation'
      });
    } else {
      this.autosavedIdea.set(idea);
    }
  }

  postIdea(status?: IdeaStatus) {
    const isValid = this.validateRequiredFieldsForPublish();
    if (!isValid) {
      return;
    }

    if (this.ideation()?.allowAnonymous) {
      const invitationDialog = this.dialog.open(AnonymousDialogComponent);
      invitationDialog.afterClosed().pipe(take(1)).subscribe({
        next: (confirmed) => {
          if (confirmed) {
            this.saveIdea(status || IdeaStatus.published);
          }
        }
      });
    } else {
      this.saveIdea(status || IdeaStatus.published);
    }
  }

  publishIdea() {
    this.postIdea(IdeaStatus.published);
  }

  deleteDraftIdea(_idea: Idea | null) {
    if (!_idea) return;
    this.ideationService.deleteIdea({
      topicId: this.topic().id,
      ideationId: this.ideation().id,
      ideaId: _idea.id
    }).subscribe(() => {
      this.clear();
      this.isOpen.set(false);
    });
  }

  openAddIdea() {
    if (this.hasIdeationEnded()) return;
    if (!this.userStore.isAuthenticated()) {
      const dialogRef = this.authDialog.openLogin(this.router.url);
      dialogRef.afterClosed().pipe(take(1)).subscribe((success) => {
        if (success || this.userStore.isAuthenticated()) {
          this.isOpen.set(true);
          this.initAddIdeaForm();
        }
      });
      return;
    }
    this.isOpen.set(true);
    this.initAddIdeaForm();
  }

  initAddIdeaForm() {
    this.initDemographicsControls();

    if (!this.autosavedIdea()) {
      const template = this.ideation()?.template || '';
      const currentDesc = this.ideaForm.get('description')?.value;
      const currentStatement = this.ideaForm.get('statement')?.value;

      if (!currentStatement && (!currentDesc || currentDesc === template)) {
        this.ideaForm.patchValue({
          statement: '',
          description: template
        });
        this.description.set(template);
        this.ideaForm.markAsPristine();
        this.ideaForm.markAsUntouched();
      } else if (!currentDesc) {
        this.description.set(template);
        this.ideaForm.patchValue({ description: template });
      }
    }
    this.isOpen.set(true);
  }

  hasChanges(): boolean {
    const statement = this.ideaForm.get('statement')?.value?.trim();
    if (statement) return true;

    const template = (this.ideation()?.template || '').trim();
    const description = (this.ideaForm.get('description')?.value || this.description() || '').trim();
    if (description && description !== template) return true;

    if (this.newImages().length > 0) return true;
    if (this.autosavedIdea()) return true;

    return false;
  }

  closeAddIdea() {
    this.close();
  }

  close() {
    if (this.hasChanges()) {
      const dialogRef = this.dialog.open(CloseWithoutSavingDialogComponent);
      dialogRef.afterClosed().pipe(take(1)).subscribe({
        next: (res) => {
          if (!res) {
            this.clear();
            this.isOpen.set(false);
          }
        }
      });
    } else {
      this.clear();
      this.isOpen.set(false);
    }
  }

  clear() {
    this.stopAutosave();
    this.idea = null;
    this.ideaForm.reset();
    const template = this.ideation()?.template || '';
    this.description.set(template);
    this.ideaForm.patchValue({
      statement: '',
      description: template,
    });
    this.ideaForm.markAsPristine();
    this.ideaForm.markAsUntouched();
    this.filtersData.update(data => {
      Object.keys(data).forEach(k => {
        data[k].error = false;
        data[k].selectedValue = '';
      });
      return { ...data };
    });
    this.newImages.set([]);
    this.autosavedIdea.set(null);
    if (this.imageUploadInput?.nativeElement) {
      this.imageUploadInput.nativeElement.value = '';
    }
  }

  numberOnly(event: KeyboardEvent): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }
}
