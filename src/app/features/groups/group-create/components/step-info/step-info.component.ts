import { Component, input, output, signal, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Group } from '../../../../../core/interfaces/group';
import { InputComponent } from '../../../../../shared/components/input/input.component';

@Component({
  selector: 'cos-step-info',
  standalone: true,
  imports: [
    FormsModule,
    TranslateModule,
    InputComponent
  ],
  templateUrl: './step-info.component.html',
  styleUrl: './step-info.component.scss'
})
export class StepInfoComponent {
  group = input.required<Partial<Group>>();
  groupUpdate = output<Partial<Group>>();
  imageFileUpdate = output<File | null>();

  @ViewChild('imageUpload') imageUpload?: ElementRef<HTMLInputElement>;

  tmpImageUrl = signal<string | null>(null);
  descriptionLength = 1000;

  onNameChange(name: string) {
    this.groupUpdate.emit({ name });
  }

  onDescriptionChange(description: string) {
    this.groupUpdate.emit({ description });
  }

  uploadImage() {
    this.imageUpload?.nativeElement.click();
  }

  fileUpload() {
    const files = this.imageUpload?.nativeElement.files;
    if (files && files.length > 0) {
      const file = files[0];
      this.handleFile(file);
    }
  }

  fileDropped(event: DragEvent) {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      this.handleFile(file);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  private handleFile(file: File) {
    this.imageFileUpdate.emit(file);
    const reader = new FileReader();
    reader.onload = () => {
      this.tmpImageUrl.set(reader.result as string);
    };
    reader.readAsDataURL(file);
  }
}
