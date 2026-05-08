import { Component, inject, signal, input, output, ChangeDetectionStrategy, OnInit, effect, model } from '@angular/core';
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
    TranslateModule,
    ReactiveFormsModule,
    IconComponent
  ],
  templateUrl: './idea-reply-form.component.html',
  styleUrls: ['./idea-reply-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdeaReplyFormComponent implements OnInit {
  // Inputs as signals
  argument = model<any>(null);
  topicId = model<string>('');
  ideationId = model<string>('');
  ideaId = model<string>('');
  editMode = model<boolean>(false);

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
