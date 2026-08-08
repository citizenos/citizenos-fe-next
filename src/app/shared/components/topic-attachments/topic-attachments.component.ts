import { IconComponent } from '../icon/icon.component';
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
import { CosDropdownDirective } from '../../directives/cos-dropdown.directive';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare let Dropbox: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare let OneDrive: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare let google: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare let gapi: any;

@Component({
  selector: 'cos-topic-attachments',
  standalone: true,
  imports: [FormsModule, TranslateModule, ButtonComponent, TooltipComponent, CosDropdownDirective, IconComponent],
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

  config = {
    dropbox: {
      appKey: 'lkk7j6f41sfpm5b'
    },
    googleDrive: {
      developerKey: 'AIzaSyBuEp5_A9tMjIZbIWzZ3pyh9wzLVcikD6I',
      clientId: '11623449066-0pdp3p7mp4l4f3e7vm43pr7okjpmddmc.apps.googleusercontent.com'
    },
    oneDrive: {
      clientId: 'deb735fe-1c3d-489c-93f4-0a8927101d09'
    }
  };

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
      
      this.uploadService.upload(path, file, {
        name: file.name,
        type: file.name.split('.').pop() || '',
        source: 'upload'
      }).subscribe({
        next: (result: unknown) => {
          const res = result as TopicAttachment;
          if (res && res.id) {
            this.attachments.update(items => [...items, res]);
            this.blockAttachments.set(true);
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

  doSaveAttachment(attachment: Partial<TopicAttachment>) {
    const topicId = this.resolvedTopic().id;
    if (!topicId) return;

    this.topicService.saveAttachment(topicId, attachment).subscribe({
      next: (res) => {
        if (res && res.id) {
          this.attachments.update(items => [...items, res]);
        }
      },
      error: () => {
        this.notification.showRaw('error', 'VIEWS.TOPIC_CREATE.ERROR_ATTACHMENT_SAVE_FAILED');
      }
    });
  }

  dropboxSelect() {
    if (typeof Dropbox === 'undefined') return;
    Dropbox.appKey = this.config.dropbox.appKey;
    Dropbox.choose({
      success: (files: { name: string, bytes: number, link: string }[]) => {
        if (files && files.length > 0) {
          const attachment = {
            name: files[0].name,
            type: files[0].name.split('.').pop(),
            source: 'dropbox',
            size: files[0].bytes,
            link: files[0].link
          };
          this.doSaveAttachment(attachment);
          this.blockAttachments.set(true);
        }
      },
      cancel: () => {
        // No action needed on cancel
      },
      linkType: 'preview',
      multiselect: false
    });
  }

  oneDriveSelect() {
    if (typeof OneDrive === 'undefined') return;
    OneDrive.open({
      clientId: this.config.oneDrive.clientId,
      action: 'share',
      advanced: {
        redirectUri: window.location.origin + '/onedrive'
      },
      success: (res: { value?: { name: string, size: number, permissions: { link: { webUrl: string } }[] }[] }) => {
        if (res && res.value && res.value.length > 0) {
          const attachment = {
            name: res.value[0].name,
            type: res.value[0].name.split('.').pop(),
            source: 'onedrive',
            size: res.value[0].size,
            link: res.value[0].permissions[0].link.webUrl
          };
          this.doSaveAttachment(attachment);
          this.blockAttachments.set(true);
        }
      },
      cancel: () => {
        // No action needed on cancel
      },
      error: (err: unknown) => {
        console.error(err);
      }
    });
  }

  googleDriveSelect() {
    if (typeof gapi === 'undefined' || typeof google === 'undefined') return;
    let googlePickerApiLoaded = false;
    let oauthToken: string;

    const createPicker = () => {
      const pickerCallback = (data: Record<string, unknown>) => {
        if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
          const docs = data[google.picker.Response.DOCUMENTS] as Record<string, unknown>[];
          const doc = docs[0];
          const attachment = {
            name: doc[google.picker.Document.NAME] as string,
            type: (doc[google.picker.Document.TYPE] as string) || (doc[google.picker.Document.NAME] as string).split('.').pop(),
            source: 'googledrive',
            size: (doc['sizeBytes'] as number) || 0,
            link: doc[google.picker.Document.URL] as string
          };
          this.doSaveAttachment(attachment);
          this.blockAttachments.set(true);
        }
      };

      const picker = new google.picker.PickerBuilder()
        .addView(google.picker.ViewId.DOCS)
        .setOAuthToken(oauthToken)
        .setDeveloperKey(this.config.googleDrive.developerKey)
        .setCallback(pickerCallback)
        .setOrigin(window.location.origin)
        .setSize(600, 400)
        .build();
      picker.setVisible(true);
    };

    const onAuthApiLoad = () => {
      gapi.auth.authorize(
        {
          'client_id': this.config.googleDrive.clientId,
          'scope': ['https://www.googleapis.com/auth/drive.file'],
          'immediate': false
        },
        (authResult: { error?: unknown, access_token: string }) => {
          if (authResult && !authResult.error && googlePickerApiLoaded) {
            oauthToken = authResult.access_token;
            createPicker();
          }
        }
      );
    };

    const onPickerApiLoad = () => {
      googlePickerApiLoaded = true;
    };

    gapi.load('client', { 'callback': onAuthApiLoad });
    gapi.load('picker', { 'callback': onPickerApiLoad });
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

