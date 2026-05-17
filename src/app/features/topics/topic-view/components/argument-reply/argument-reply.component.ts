import { Component, input, output, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { take } from 'rxjs';

import { Argument } from '../../../../../core/interfaces/discussion';
import { TopicArgumentService } from '../../../../../core/services/topic-argument.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { UserStore } from '../../../../../core/state/user.store';
import { MarkdownDirective } from '../../../../../shared/directives/markdown.directive';

@Component({
  selector: 'app-argument-reply',
  standalone: true,
  imports: [FormsModule, TranslateModule, MarkdownDirective],
  templateUrl: './argument-reply.component.html',
  styleUrls: ['./argument-reply.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArgumentReplyComponent {
  argument = input.required<Argument>();
  topicId = input.required<string>();
  showReplyChange = output<boolean>();

  private argumentService = inject(TopicArgumentService);
  private notification = inject(NotificationService);
  private router = inject(Router);
  userStore = inject(UserStore);

  replyText = signal('');
  errors = signal<{ text?: string[] } | null>(null);

  readonly ARGUMENT_TYPES_MAXLENGTH = this.argumentService.ARGUMENT_TYPES_MAXLENGTH;

  saveReply() {
    const text = this.replyText();
    if (!text.length) {
      this.notification.error('COMPONENTS.ARGUMENT_REPLY.ERROR_NO_TEXT');
      return;
    }

    const arg = this.argument();
    const edits = arg.edits || {};
    const parentVersion = Math.max(0, Object.keys(edits).length - 1);

    this.errors.set(null);
    this.argumentService.save({
      parentId: arg.id,
      parentVersion,
      type: 'reply',
      discussionId: arg.discussionId || '',
      subject: '',
      text,
      topicId: this.topicId()
    }).pipe(take(1)).subscribe({
      next: (reply) => {
        this.argumentService.reload();
        this.router.navigate(['/', 'topics', this.topicId()], { queryParams: { argumentId: reply.id + '_v0' } });
        this.close();
      },
      error: (res) => {
        this.errors.set(res.errors);
      }
    });
  }

  close() {
    this.showReplyChange.emit(false);
  }
}
