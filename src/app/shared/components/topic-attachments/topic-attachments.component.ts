import { Component, input, signal, inject, ChangeDetectionStrategy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TopicService } from '../../../core/services/topic.service';
import { UploadService } from '../../../core/services/upload.service';
import { CosDropdownDirective } from '../../directives/cos-dropdown.directive';
import { Topic } from '../../../core/interfaces/topic';
import { NotificationService } from '../../../core/services/notification.service';
import { catchError, of, takeWhile } from 'rxjs';

import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'cos-topic-attachments',
  standalone: true,
  imports: [FormsModule, TranslateModule, CosDropdownDirective, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './topic-attachments.component.html',
  styleUrl: './topic-attachments.component.scss'
})
export class TopicAttachmentsComponent implements OnInit {
  @ViewChild('attachmentInput') attachmentInput?: ElementRef;

  topic = input.required<Partial<Topic>>();
  
  private topicService = inject(TopicService);
  private uploadService = inject(UploadService);
  private notification = inject(NotificationService);
  private translate = inject(TranslateService);
  
  attachments = signal<any[]>([]);
  blockAttachments = signal(false);

  ngOnInit() {
    const topicId = this.topic().id;
    if (topicId) {
      this.topicService.loadAttachments(topicId).subscribe(items => {
        this.attachments.set(items);
        if (items.length > 0) {
          this.blockAttachments.set(true);
        }
      });
    }
  }

  triggerUpload() {
    this.attachmentInput?.nativeElement.click();
  }

  onUpload() {
    const files = this.attachmentInput?.nativeElement.files;
    const topicId = this.topic().id;
    if (!topicId || !files.length) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const path = `/api/users/self/topics/${topicId}/attachments`;
      
      this.uploadService.upload(path, file, { name: file.name }).subscribe({
        next: (result: any) => {
          if (result && result.id) {
            this.attachments.update(items => [...items, result]);
          }
        },
        error: () => {
          this.notification.showRaw('error', 'VIEWS.TOPIC_CREATE.ERROR_ATTACHMENT_UPLOAD_FAILED');
        }
      });
    }
  }

  onUpdate(attachment: any) {
    const topicId = this.topic().id;
    if (!topicId) return;

    this.topicService.updateAttachment(topicId, attachment).subscribe({
      error: () => {
        this.notification.showRaw('error', 'VIEWS.TOPIC_CREATE.ERROR_ATTACHMENT_UPDATE_FAILED');
      }
    });
  }

  onDelete(attachment: any) {
    const topicId = this.topic().id;
    if (!topicId) return;

    this.topicService.deleteAttachment(topicId, attachment.id).subscribe({
      next: () => {
        this.attachments.update(items => items.filter(i => i.id !== attachment.id));
      },
      error: () => {
        this.notification.showRaw('error', 'VIEWS.TOPIC_CREATE.ERROR_ATTACHMENT_DELETE_FAILED');
      }
    });
  }
}
