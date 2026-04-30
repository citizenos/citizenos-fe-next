import {
  Component, input, output, signal, inject, ChangeDetectionStrategy, OnInit,
  AfterViewInit, ViewChild, ElementRef, forwardRef
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { take } from 'rxjs';

import { TopicArgumentService } from '../../../../../core/services/topic-argument.service';
import { UserStore } from '../../../../../core/state/user.store';
import { NotificationService } from '../../../../../core/services/notification.service';
import { DialogService } from '../../../../../shared/dialog/dialog.service';
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { InitialsComponent } from '../../../../../shared/components/initials/initials.component';
import { CosDropdownDirective } from '../../../../../shared/directives/cos-dropdown.directive';

@Component({
  selector: 'cos-argument',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe, FormsModule, TranslateModule,
    IconComponent, InitialsComponent, CosDropdownDirective,
    forwardRef(() => ArgumentComponent),
  ],
  templateUrl: './argument.component.html',
  styleUrls: ['./argument.component.scss']
})
})
export class ArgumentComponent implements OnInit, AfterViewInit {
  argument = input.required<any>();
  topicId = input.required<string>();
  discussionId = input.required<string>();
  root = input<any>(null);
  deleted = output<void>();

  @ViewChild('argumentBody') argumentBody?: ElementRef;

  private argumentService = inject(TopicArgumentService);
  private notification = inject(NotificationService);
  private dialog = inject(DialogService);
  private sanitizer = inject(DomSanitizer);
  userStore = inject(UserStore);

  showEdit = signal(false);
  showReplies = signal(false);
  showReplyForm = signal(false);
  showDeletedArgument = signal(false);

  editSubject = signal('');
  editText = signal('');
  replyText = signal('');

  ngOnInit() {
    this.editSubject.set(this.argument().subject || '');
    this.editText.set(this.argument().text || '');
  }

  ngAfterViewInit() {}

  argumentId() {
    const arg = this.argument();
    const version = (arg.edits?.length || 1) - 1;
    return arg.id + '_v' + version;
  }

  isEdited() {
    return (this.argument().edits?.length || 0) > 1;
  }

  canEdit() {
    return this.argument().creator?.id === this.userStore.user()?.id && !this.argument().deletedAt;
  }

  safe(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html || '');
  }

  vote(value: number) {
    if (!this.userStore.isAuthenticated()) return;
    this.argumentService.vote({
      commentId: this.argument().id,
      topicId: this.topicId(),
      discussionId: this.discussionId(),
      value,
    }).pipe(take(1)).subscribe(votes => {
      this.argument().votes = votes;
    });
  }

  postReply() {
    const text = this.replyText().trim();
    if (!text) return;
    this.argumentService.save({
      type: 'reply',
      text,
      subject: '',
      parentVersion: 0,
      topicId: this.topicId(),
      discussionId: this.discussionId(),
      parent: { id: this.argument().id },
    }).pipe(take(1)).subscribe({
      next: () => {
        this.replyText.set('');
        this.showReplyForm.set(false);
        this.showReplies.set(true);
        this.deleted.emit(); // reuse event to trigger parent reload
      }
    });
  }

  saveEdit() {
    this.argumentService.update({
      commentId: this.argument().id,
      topicId: this.topicId(),
      discussionId: this.discussionId(),
      subject: this.editSubject().trim(),
      text: this.editText().trim(),
    }).pipe(take(1)).subscribe({
      next: (updated) => {
        Object.assign(this.argument(), updated);
        this.showEdit.set(false);
      }
    });
  }

  copyLink(event: MouseEvent) {
    const id = this.argumentId();
    const url = `${window.location.origin}${window.location.pathname}?argumentId=${id}`;
    navigator.clipboard.writeText(url).then(() =>
      this.notification.success('VIEWS.TOPICS_TOPICID.ARGUMENT_LNK_COPIED')
    );
  }

  doReport() {
    // ArgumentReportComponent — stub for now, wired in report migration
    this.notification.showRaw('info', 'Report submitted');
  }

  doDelete() {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        level: 'delete',
        heading: 'MODALS.TOPIC_DELETE_ARGUMENT_TITLE',
        points: ['MODALS.TOPIC_DELETE_ARGUMENT_TXT_ARE_YOU_SURE'],
        confirmBtn: 'MODALS.TOPIC_DELETE_ARGUMENT_BTN_YES',
        closeBtn: 'MODALS.TOPIC_DELETE_ARGUMENT_BTN_NO',
      }
    }).afterClosed().pipe(take(1)).subscribe(confirmed => {
      if (!confirmed) return;
      this.argumentService.delete({
        topicId: this.topicId(),
        discussionId: this.discussionId(),
        commentId: this.argument().id,
      }).pipe(take(1)).subscribe(() => this.deleted.emit());
    });
  }
}
