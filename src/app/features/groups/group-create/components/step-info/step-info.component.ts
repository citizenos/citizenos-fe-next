import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  OnInit,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { GroupCreateData } from '../../group-create.interface';

@Component({
  selector: 'cos-step-info',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, TranslateModule, InputComponent, ButtonComponent],
  templateUrl: './step-info.component.html',
  styleUrl: './step-info.component.scss',
})
export class StepInfoComponent implements OnInit {
  group = input.required<GroupCreateData>();
  groupUpdate = output<GroupCreateData>();
  imageFileUpdate = output<File | null>();

  @ViewChild('imageUpload') imageUpload?: ElementRef<HTMLInputElement>;

  tmpImageUrl = signal<string | null>(null);
  rules = signal<{ rule: string }[]>([]);
  descriptionLength = 1000;

  ngOnInit() {
    const g = this.group();
    if (g.rules?.length) {
      this.rules.set(g.rules.map(r => ({ rule: r })));
    } else {
      this.rules.set([{ rule: '' }, { rule: '' }, { rule: '' }]);
    }
  }

  onNameChange(name: string) {
    this.groupUpdate.emit({ name });
  }

  onDescriptionChange(description: string) {
    this.groupUpdate.emit({ description });
  }

  updateContact(contact: string) {
    this.groupUpdate.emit({ contact });
  }

  addRule() {
    this.rules.update(r => [...r, { rule: '' }]);
    this.emitRules();
  }

  removeRule(index: number) {
    this.rules.update(r => r.filter((_, i) => i !== index));
    this.emitRules();
  }

  onRuleChange(index: number, value: string) {
    this.rules.update(r => r.map((item, i) => i === index ? { rule: value } : item));
    this.emitRules();
  }

  private emitRules() {
    this.groupUpdate.emit({ rules: this.rules().map(r => r.rule).filter(r => r.length > 0) });
  }

  uploadImage() {
    this.imageUpload?.nativeElement.click();
  }

  fileUpload() {
    const files = this.imageUpload?.nativeElement.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  fileDropped(event: DragEvent) {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  removeImage() {
    this.tmpImageUrl.set(null);
    this.imageFileUpdate.emit(null);
    if (this.imageUpload) this.imageUpload.nativeElement.value = '';
  }

  private handleFile(file: File) {
    this.imageFileUpdate.emit(file);
    const reader = new FileReader();
    reader.onload = () => this.tmpImageUrl.set(reader.result as string);
    reader.readAsDataURL(file);
  }
}
