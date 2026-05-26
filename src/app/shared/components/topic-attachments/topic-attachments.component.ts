import { Component, input, signal, inject, ChangeDetectionStrategy, OnInit, ViewChild, ElementRef, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TopicService } from '../../../core/services/topic.service';
import { TopicAttachment } from '../../../core/interfaces/topic';
import { UploadService } from '../../../core/services/upload.service';
import { Topic } from '../../../core/interfaces/topic';
import { NotificationService } from '../../../core/services/notification.service';
import { DIALOG_DATA, DialogService } from '../../dialog';
import { take, switchMap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

import { ButtonComponent } from '../button/button.component';
import { TooltipComponent } from '../tooltip/tooltip.component';

@Component({
  selector: 'cos-topic-attachments',
  standalone: true,
  imports: [FormsModule, TranslateModule, ButtonComponent, TooltipComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './topic-attachments.component.html',
  styleUrl: './topic-attachments.component.scss'
})
export class TopicAttachmentsComponent implements OnInit {
  @ViewChild('attachmentInput') attachmentInput?: ElementRef;

  topic = input<Partial<Topic>>({});
  
  private data = inject<{ topic: Topic }>(DIALOG_DATA, { optional: true });
  private topicService = inject(TopicService);
  private uploadService = inject(UploadService);
  private notification = inject(NotificationService);
  private translate = inject(TranslateService);

  limit = 10;
  allowedFileSize = '50MB';
  allowedFileTypes = ["txt", "pdf", "doc", "asice", "docx", "ddoc", "bdoc", "odf", "odt", "jpg", "jpeg", "img", "png", "rtf", "xls", "xlsx", "ppt", "pptx", "pps", "xlt"].join(', ');
  
  resolvedTopic = computed(() => this.data?.topic || this.topic());
  attachments = signal<TopicAttachment[]>([]);
  blockAttachments = signal(false);

  ngOnInit() {
    const topicId = this.resolvedTopic().id;
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
    this.blockAttachments.set(true);
  }

  onUpload() {
    const files = this.attachmentInput?.nativeElement.files;
    const topicId = this.resolvedTopic().id;
    if (!topicId || !files.length) return;

    for (const file of files) {
      const path = `/api/users/self/topics/${topicId}/attachments/upload`;
      
      this.uploadService.upload(path, file, { name: file.name }).subscribe({
        next: (result: unknown) => {
          const res = result as TopicAttachment;
          if (res && res.id) {
            this.attachments.update(items => [...items, res]);
          }
        },
        error: () => {
          this.notification.showRaw('error', 'VIEWS.TOPIC_CREATE.ERROR_ATTACHMENT_UPLOAD_FAILED');
        }
      });
    }

    if (this.attachmentInput) {
      this.attachmentInput.nativeElement.value = '';
    }
  }

  onUpdate(attachment: TopicAttachment) {
    const topicId = this.resolvedTopic().id;
    if (!topicId) return;

    this.topicService.updateAttachment(topicId, attachment).subscribe({
      error: () => {
        this.notification.showRaw('error', 'VIEWS.TOPIC_CREATE.ERROR_ATTACHMENT_UPDATE_FAILED');
      }
    });
  }

  onDelete(attachment: TopicAttachment) {
    const topicId = this.resolvedTopic().id;
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

@Component({
  selector: 'app-topic-attachments-dialog',
  standalone: true,
  template: ''
})
export class TopicAttachmentsDialogComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(DialogService);
  private topicService = inject(TopicService);

  ngOnInit() {
    this.route.params.pipe(
      take(1),
      switchMap((params) => {
        const topicId = params['topicId'];
        return this.topicService.loadTopic(topicId).pipe(
          take(1),
          switchMap((topic) => {
            const dialogRef = this.dialog.open(TopicAttachmentsComponent, {
              data: { topic }
            });
            return dialogRef.afterClosed().pipe(
              take(1),
              switchMap(() => {
                const lang = this.router.url.split('/')[1] || 'en';
                return this.router.navigate([lang, 'topics', topicId]);
              })
            );
          })
        );
      })
    ).subscribe();
  }
}

