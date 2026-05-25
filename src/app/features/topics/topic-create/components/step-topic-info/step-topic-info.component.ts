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
import { TooltipComponent } from '../../../../../shared/components/tooltip/tooltip.component';

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
    TopicAttachmentsComponent,
    TooltipComponent
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

  titleLimit = 100;
  introLimit = 500;

  block = signal({
    headerImage: false,
    title: false,
    intro: false,
    description: false
  });

  ngOnInit() {
    const t = this.topic();
    this.block.update(b => {
      const updates = { ...b };
      if (t.imageUrl) updates.headerImage = true;
      if (t.title) updates.title = true;
      if (t.intro) updates.intro = true;
      if (t.description) {
        const hasText = !!t.description.replace(/<[^>]*>/g, '').trim();
        if (hasText) {
          updates.description = true;
        }
      }
      return updates;
    });
  }

  // Cached so Angular doesn't see a new object on every render and reload the iframe
  private _cachedPadUrl = '';
  private _cachedSafeUrl!: SafeResourceUrl;

  sanitizeURL(): SafeResourceUrl {
    const padUrl = this.topic().padUrl;
    if (padUrl && padUrl !== this._cachedPadUrl) {
      this._cachedPadUrl = padUrl;
      this._cachedSafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(padUrl);
    }
    if (!this._cachedSafeUrl) {
      this._cachedSafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl('about:blank');
    }
    return this._cachedSafeUrl;
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
