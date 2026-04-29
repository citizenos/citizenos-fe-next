import { Component, input, output, signal, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Topic } from '../../../../../core/interfaces/topic';
import { ImageUploadComponent } from '../../../../../shared/components/image-upload/image-upload.component';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { EtherpadDirective } from '../../../../../shared/directives/etherpad.directive';
import { TopicAttachmentsComponent } from '../../../../../shared/components/topic-attachments/topic-attachments.component';

@Component({
  selector: 'cos-step-topic-info',
  standalone: true,
  imports: [
    FormsModule,
    TranslateModule,
    ImageUploadComponent,
    ButtonComponent,
    IconComponent,
    EtherpadDirective,
    TopicAttachmentsComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './step-topic-info.component.html',
  styleUrl: './step-topic-info.component.scss'
})
export class StepTopicInfoComponent implements OnInit {
  private sanitizer = inject(DomSanitizer);

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

  titleLimit = 100;
  introLimit = 500;

  block = signal({
    headerImage: false,
    title: true,
    intro: true,
    description: true
  });

  ngOnInit() {
    // Open image block if image exists
    const t = this.topic();
    if (t.imageUrl) {
      this.block.update(b => ({ ...b, headerImage: true }));
    }
  }

  sanitizeURL(): SafeResourceUrl {
    const padUrl = this.topic().padUrl;
    if (padUrl) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(padUrl);
    }
    return '';
  }

  toggleBlock(name: keyof ReturnType<typeof this.block>) {
    this.block.update(b => ({ ...b, [name]: !b[name] }));
  }

  onUpdate(updates: Partial<Topic>) {
    this.topicUpdate.emit(updates);
  }

  onImageChange(file: File | null) {
    this.imageFileUpdate.emit(file);
  }

  deleteTopicImage() {
    this.onUpdate({ imageUrl: null });
    this.imageFileUpdate.emit(null);
  }
}
