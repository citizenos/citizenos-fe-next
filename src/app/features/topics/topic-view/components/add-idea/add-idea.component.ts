import { Component, input, output, signal, inject, ChangeDetectionStrategy, OnInit, ElementRef, ViewChild, computed, model } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs';

import { TopicIdeationService } from '../../../../../core/services/topic-ideation.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { Topic } from '../../../../../core/interfaces/topic';
import { Ideation } from '../../../../../core/interfaces/ideation';
import { Idea, IdeaStatus } from '../../../../../core/interfaces/idea';
import { MarkdownDirective } from '../../../../../shared/directives/markdown.directive';
import { CosDropdownDirective } from '../../../../../shared/directives/cos-dropdown.directive';
import { TooltipComponent } from '../../../../../shared/components/tooltip/tooltip.component';
import { municipalities } from '../../../../../core/services/municipality.service';
import { UpperCasePipe } from '@angular/common';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-add-idea',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
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

  @ViewChild('imageUpload') imageUploadInput?: ElementRef<HTMLInputElement>;

  ideaForm = new FormGroup({
    statement: new FormControl('', [Validators.required, Validators.maxLength(1024)]),
    description: new FormControl('', [Validators.required]),
  });

  IDEA_STATEMENT_MAXLENGTH = 1024;
  toggleExpand = signal(false);
  isAutosaving = signal(false);
  newImages = signal<{ link: string, name: string }[]>([]);
  autosavedIdea = signal<Idea | null>(null);

  municipalities = municipalities;
  filtersData = signal<Record<string, { selectedValue: string; items: { title: string; value: string }[]; error: boolean }>>({
    residence: { selectedValue: '', items: municipalities.map(m => ({ title: m.name, value: m.name })), error: false },
    gender: { selectedValue: '', items: [{ title: 'VIEWS.IDEATION_CREATE.DEMOGRAPHICS_DATA_GENDER_FEMALE', value: 'female' }, { title: 'VIEWS.IDEATION_CREATE.DEMOGRAPHICS_DATA_GENDER_MALE', value: 'male' }, { title: 'VIEWS.IDEATION_CREATE.DEMOGRAPHICS_DATA_GENDER_OTHER_PLACEHOLDER', value: 'other' }], error: false }
  });

  isCountryEstonia = computed(() => this.topic().country === 'ee');

  ngOnInit() {
    const config = this.ideation().demographicsConfig;
    if (config) {
        Object.keys(config).forEach(key => {
            (this.ideaForm as FormGroup).addControl(('demographics_' + key), new FormControl(config[key].value || '', config[key].required ? [Validators.required] : []));
        });
    }
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
    return 10000; // Placeholder
  }

  updateText(text: string) {
    this.ideaForm.patchValue({ description: text });
  }

  uploadImage() {
    this.imageUploadInput?.nativeElement.click();
  }

  fileUpload() {
    const files = this.imageUploadInput?.nativeElement.files;
    if (files) {
        // Handle image upload logic
    }
  }

  removeNewImage(index: number) {
    this.newImages.update(images => {
        images.splice(index, 1);
        return [...images];
    });
  }

  publishIdea() {
    if (this.ideaForm.invalid) {
        Object.values(this.ideaForm.controls).forEach(control => {
            control.markAsTouched();
        });
        return;
    }

    const ideaData: Record<string, any> & { topicId: string; ideationId: string; } = {
      topicId: this.topic().id,
      ideationId: this.ideation().id,
      statement: this.ideaForm.value.statement,
      description: this.ideaForm.value.description,
      status: IdeaStatus.published
    };

    const config = this.ideation().demographicsConfig;
    if (config) {
        const demographics: Record<string, unknown> = {};
        Object.keys(config).forEach(key => {
            demographics[key] = this.ideaForm.get('demographics_' + key)?.value;
        });
        ideaData['demographics'] = demographics;
    }

    this.ideationService.createIdea(ideaData).pipe(take(1)).subscribe({
      next: (idea: Idea) => {
        this.ideaAdded.emit(idea);
        this.notification.success('COMPONENTS.ADD_IDEA.MSG_PUBLISH_SUCCESS');
      },
      error: (err: unknown) => {
        console.error('Failed to publish idea', err);
        this.notification.error('COMPONENTS.ADD_IDEA.MSG_PUBLISH_ERROR');
      }
    });
  }

  saveDraft() {
    // Implement draft saving logic
  }

  deleteDraftIdea(_idea: Idea) {
    // Implement delete draft logic
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
