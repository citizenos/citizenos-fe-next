import { Component, inject, signal, input, output, ChangeDetectionStrategy, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TopicIdeationService } from '../../../../../core/services/topic-ideation.service';
import { UserStore } from '../../../../../core/state/user.store';
import { NotificationService } from '../../../../../core/services/notification.service';
import { Router, ActivatedRoute } from '@angular/router';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-idea-reply-form',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ReactiveFormsModule,
    IconComponent
  ],
  template: `
    <div class="reply_wrap reply">
      @if (userStore.isAuthenticated()) {
        <form [formGroup]="replyForm" (ngSubmit)="save()">
          <div class="field_wrap" [class.error]="errors()?.text">
            <textarea
              formControlName="text"
              class="gray_borders"
              [placeholder]="'COMPONENTS.IDEA_REPLY_FORM.PLACEHOLDER_WRITE_REPLY_HERE' | translate"
              [maxlength]="COMMENT_TYPES_MAXLENGTH['reply']"
              rows="4"></textarea>
            
            @if (errors()?.text) {
              <div class="error_label">
                <cos-icon name="warning" size="16"></cos-icon>
                <span>{{ errors().text | translate }}</span>
              </div>
            }
          </div>

          <div class="buttons_wrap">
            <button type="button" class="btn_medium_submit_ghost icon close_button" (click)="close()">
              <cos-icon name="close" size="24"></cos-icon>
            </button>
            <button
              type="submit"
              class="btn_medium"
              [disabled]="replyForm.invalid">
              {{ (editMode() ? 'COMPONENTS.IDEA_REPLY_FORM.BTN_UPDATE_REPLY' : 'COMPONENTS.IDEA_REPLY_FORM.BTN_POST_REPLY') | translate }}
            </button>
          </div>
        </form>
      }
    </div>
  `,
  styles: [`
    .reply_wrap {
      background-color: unset;
      gap: 16px;
      display: flex;
      flex-direction: column;
      width: 100%;
      max-width: 680px;
      position: relative;
      margin-top: 16px;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    textarea {
      width: 100%;
      padding: 12px;
      border: 1px solid #D1D5DB;
      border-radius: 8px;
      resize: vertical;
      font-family: inherit;
    }

    .gray_borders {
      border-color: #E5E7EB;
    }

    .field_wrap.error textarea {
      border-color: #EF4444;
    }

    .error_label {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #EF4444;
      font-size: 14px;
      margin-top: 4px;
    }

    .buttons_wrap {
      display: flex;
      align-items: center;
      width: 100%;
      justify-content: space-between;
    }

    .btn_medium {
      background: #3B82F6;
      color: white;
      border: none;
      padding: 8px 20px;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
    }

    .btn_medium:disabled {
      background: #93C5FD;
      cursor: not-allowed;
    }

    .btn_medium_submit_ghost {
      background: none;
      border: none;
      cursor: pointer;
      color: #374151;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdeaReplyFormComponent implements OnInit {
  // Inputs as signals
  argument = input<any>(null);
  topicId = input<string>('');
  ideationId = input<string>('');
  ideaId = input<string>('');
  editMode = input<boolean>(false);

  // Outputs
  showReplyChange = output<boolean>();
  showRepliesChange = output<boolean>();

  private ideationService = inject(TopicIdeationService);
  public userStore = inject(UserStore);
  private notification = inject(NotificationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  COMMENT_TYPES_MAXLENGTH = this.ideationService.COMMENT_TYPES_MAXLENGTH;

  replyForm = new FormGroup({
    text: new FormControl('', [Validators.required, Validators.maxLength(this.ideationService.COMMENT_TYPES_MAXLENGTH.reply)])
  });

  errors = signal<any>({});

  constructor() {
    effect(() => {
      const arg = this.argument();
      if (this.editMode() && arg) {
        this.replyForm.patchValue({
          text: arg.text || ''
        }, { emitEvent: false });
      }
    });
  }

  ngOnInit() {
  }

  save() {
    if (this.replyForm.invalid) return;

    const data = {
      ...this.replyForm.value,
      topicId: this.topicId(),
      ideationId: this.ideationId(),
      ideaId: this.ideaId()
    };

    if (this.editMode()) {
      this.ideationService.updateIdeaComment({ ...data, commentId: this.argument().id }).subscribe({
        next: (comment) => {
          this.notification.success('COMPONENTS.IDEA_REPLY_FORM.MSG_SUCCESS');
          this.showRepliesChange.emit(true);
          this.close();
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { replyId: comment.id },
            queryParamsHandling: 'merge'
          });
        },
        error: (res) => this.errors.set(res.errors)
      });
    } else {
      const saveParams = {
        ...data,
        parentId: this.argument()?.id,
        parentVersion: (this.argument()?.edits?.length || 1) - 1
      };
      this.ideationService.saveIdeaComment(saveParams).subscribe({
        next: (comment) => {
          this.notification.success('COMPONENTS.IDEA_REPLY_FORM.MSG_SUCCESS');
          this.showRepliesChange.emit(true);
          this.close();
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { replyId: comment.id + '_v0' },
            queryParamsHandling: 'merge'
          });
        },
        error: (res) => this.errors.set(res.errors)
      });
    }
  }

  close() {
    this.showReplyChange.emit(false);
  }
}
