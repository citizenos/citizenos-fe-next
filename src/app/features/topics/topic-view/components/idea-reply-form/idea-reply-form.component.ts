import { Component, inject, signal, output, ChangeDetectionStrategy, effect, model } from '@angular/core';
import { form, FormRoot, FormField, required, maxLength } from '@angular/forms/signals';
import { TranslateModule } from '@ngx-translate/core';
import { IdeaComment } from '../../../../../core/interfaces/ideation';
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
    FormRoot,
    FormField,
    IconComponent
  ],
  templateUrl: './idea-reply-form.component.html',
  styleUrls: ['./idea-reply-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdeaReplyFormComponent {
  // Inputs as signals
  argument = model<IdeaComment | null>(null);
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

  replyModel = signal({ text: '' });
  replyForm = form(this.replyModel, (path) => {
    required(path.text);
    maxLength(path.text, this.COMMENT_TYPES_MAXLENGTH.reply);
  });

  errors = signal<Record<string, string[]>>({});

  constructor() {
    effect(() => {
      const arg = this.argument();
      if (this.editMode() && arg) {
        this.replyModel.update(m => ({ ...m, text: arg.text || '' }));
      }
    });
  }



  save() {
    if (this.replyForm().invalid()) return;

    const data = {
      ...this.replyForm().value(),
      topicId: this.topicId(),
      ideationId: this.ideationId(),
      ideaId: this.ideaId()
    };

    const argument = this.argument();

    if (this.editMode()) {
      if (!argument) return;
      this.ideationService.updateIdeaComment({ ...data, commentId: argument.id }).subscribe({
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
        type: 'reply',
        parentId: this.argument()?.id,
        parentVersion: (Array.isArray(this.argument()?.edits) ? this.argument()?.edits?.length : Object.keys(this.argument()?.edits || {}).length) || 0
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
