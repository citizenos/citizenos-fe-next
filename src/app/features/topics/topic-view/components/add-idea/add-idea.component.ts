import { UserStore } from '../../../../../core/state/user.store';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';

import { Router, ActivatedRoute } from '@angular/router';
import { Component, input, output, signal, inject, ChangeDetectionStrategy, OnInit, ElementRef, ViewChild, computed, model } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { take, takeWhile, lastValueFrom } from 'rxjs';

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
    IconComponent
  ],
  templateUrl: './add-idea.component.html',
  styleUrls: ['./add-idea.component.scss'],
})
export class AddIdeaComponent implements OnInit {
  topic = input.required<Topic>();
  ideation = input.required<Ideation>();
  isOpen = model(false);

  ideaAdded = output<Idea>();

  private ideationService = inject(TopicIdeationService);
  private notification = inject(NotificationService);
  private translate = inject(TranslateService);
  private uploadService = inject(UploadService);
  
  private userStore = inject(UserStore);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  @ViewChild('imageUpload') imageUploadInput?: ElementRef<HTMLInputElement>;

  ideaForm = new FormGroup({
    statement: new FormControl('', [Validators.required, Validators.maxLength(1024)]),
    description: new FormControl('', [Validators.required]),
  });

  IDEA_STATEMENT_MAXLENGTH = 1024;
  IMAGE_LIMIT = 3;
  AUTOSAVE_HIDE_DELAY = 1000;
  
  toggleExpand = signal(false);
  isAutosaving = signal(false);
  images = signal<any[]>([]);
  newImages = signal<{ link: string, name: string, file?: File }[]>([]);
  autosavedIdea = signal<Idea | null>(null);

  municipalities = municipalities;
  filtersData = signal<Record<string, { selectedValue: string; items: { title: string; value: string }[]; error: boolean }>>({
    residence: { selectedValue: '', items: municipalities.map(m => ({ title: m.name, value: m.name })), error: false },
    gender: { selectedValue: '', items: [{ title: 'VIEWS.IDEATION_CREATE.DEMOGRAPHICS_DATA_GENDER_FEMALE', value: 'female' }, { title: 'VIEWS.IDEATION_CREATE.DEMOGRAPHICS_DATA_GENDER_MALE', value: 'male' }, { title: 'VIEWS.IDEATION_CREATE.DEMOGRAPHICS_DATA_GENDER_OTHER_PLACEHOLDER', value: 'other' }], error: false }
  });

  isCountryEstonia = computed(() => this.topic().country === 'ee');
  description = signal('');

  ngOnInit() {
    const config = this.ideation().demographicsConfig;
    if (config) {
        Object.keys(config).forEach(key => {
            (this.ideaForm as FormGroup).addControl(('demographics_' + key), new FormControl(config[key].value || '', config[key].required ? [Validators.required] : []));
        });
    }

    // Load draft if exists
    this.ideationService.getIdeas({ topicId: this.topic().id, ideationId: this.ideation().id, statuses: IdeaStatus.draft }).pipe(take(1)).subscribe(res => {
      if (res.rows && res.rows.length) {
        const draft = res.rows[0];
        this.autosavedIdea.set(draft);
        this.ideaForm.patchValue({
          statement: draft.statement,
          description: draft.description
        });
        this.description.set(draft.description);
        // Load demographics from draft
        if (draft.demographics && config) {
          Object.keys(config).forEach(key => {
            if (draft.demographics![key]) {
              let val = draft.demographics![key];
              if (val.startsWith('other: ')) val = val.substring(7);
              this.ideaForm.get('demographics_' + key)?.setValue(val);
              this.setFilterValue(key, val);
            }
          });
        }
      }
    });
  }

  getDemographicKeys() {
    return this.ideation().demographicsConfig ? Object.keys(this.ideation().demographicsConfig!) : [];
  }

  setFilterValue(key: string, value: string) {
    this.filtersData.update(data => {
        data[key].selectedValue = value;
        return { ...data };
    });
    this.ideaForm.get('demographics_' + key)?.setValue(value);
  }

  ideaMaxLength() {
    return 10000;
  }

  updateText(text: string) {
    this.description.set(text);
    this.ideaForm.patchValue({ description: text });
    
    // Auto-save logic
    if (this.ideaForm.valid && this.userStore.isAuthenticated()) {
      this.saveIdea(IdeaStatus.draft, true);
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
    const config = this.ideation().demographicsConfig;
    if (!config) return null;

    const prefix = "other: ";
    const demographics: Record<string, string> = {};
    Object.keys(config).forEach(curr => {
      let val = this.ideaForm.get('demographics_' + curr)?.value as string;
      if (!val) {
        val = this.filtersData()[curr]?.selectedValue || '';
      }
      
      if (curr === 'residence' || curr === 'gender') {
        const isStandard = this.filtersData()[curr].items.find(i => i.value === val);
        if (!isStandard && val) {
          demographics[curr] = prefix + val;
        } else {
          demographics[curr] = val;
        }
      } else {
        demographics[curr] = val;
      }
    });
    return demographics;
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
    }

    const draft = this.autosavedIdea();
    if (draft) {
      ideaData.ideaId = draft.id;
      this.ideationService.updateIdea(ideaData as any).subscribe({
        next: (idea) => {
          if (isAutosave) {
            this.autosavedIdea.set(idea);
            setTimeout(() => this.isAutosaving.set(false), this.AUTOSAVE_HIDE_DELAY);
          } else {
            this.afterPost(idea);
          }
        },
        error: (err) => {
          console.error(err);
          setTimeout(() => this.isAutosaving.set(false), this.AUTOSAVE_HIDE_DELAY);
        }
      });
    } else {
      this.ideationService.createIdea(ideaData as any).pipe(take(1)).subscribe({
        next: (idea) => {
          if (isAutosave) {
            this.autosavedIdea.set(idea);
            setTimeout(() => this.isAutosaving.set(false), this.AUTOSAVE_HIDE_DELAY);
          } else {
            this.afterPost(idea);
          }
        },
        error: (err) => {
          console.error(err);
          setTimeout(() => this.isAutosaving.set(false), this.AUTOSAVE_HIDE_DELAY);
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
        } catch (error) {
          errorsCounter++;
        }
      }
    }

    if (errorsCounter > 0) {
      this.notification.error('MSG_ERROR_POST_API_USERS_TOPICS_IDEATIONS_IDEAS_IMAGE_UPLOAD_500');
    }
  }

  afterPost(idea: Idea) {
    this.doSaveAttachments(idea.id).then(() => {
      this.ideaForm.reset();
      this.description.set('');
      this.newImages.set([]);
      this.autosavedIdea.set(null);
      this.isOpen.set(false);
      this.ideaAdded.emit(idea);
      this.notification.success('COMPONENTS.ADD_IDEA.MSG_PUBLISH_SUCCESS');
      
      if (idea.status !== IdeaStatus.draft) {
        this.router.navigate(['/', this.translate.currentLang, 'topics', this.topic().id], { queryParams: { ideaId: idea.id }, fragment: 'ideation' });
      }
    });
  }

  publishIdea() {
    if (this.ideaForm.invalid) {
        Object.values(this.ideaForm.controls).forEach(control => {
            control.markAsTouched();
        });
        return;
    }
    this.saveIdea(IdeaStatus.published);
  }

  deleteDraftIdea(_idea: Idea | null) {
    if (!_idea) return;
    this.ideationService.deleteIdea({
      topicId: this.topic().id,
      ideationId: this.ideation().id,
      ideaId: _idea.id
    }).subscribe(() => {
      this.autosavedIdea.set(null);
      this.ideaForm.reset();
      this.description.set('');
      this.isOpen.set(false);
    });
  }

  openAddIdea() {
    if (!this.userStore.isAuthenticated()) {
      this.router.navigate(['/', this.translate.currentLang, 'account', 'login'], {
        queryParams: { redirectSuccess: this.router.url }
      });
    } else {
      this.isOpen.set(true);
    }
  }

  close() {
    this.isOpen.set(false);
  }

  numberOnly(event: KeyboardEvent): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }
}
