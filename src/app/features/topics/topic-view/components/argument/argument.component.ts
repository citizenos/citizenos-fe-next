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
import { DropdownComponent } from '../../../../../shared/components/dropdown/dropdown.component';

@Component({
  selector: 'cos-argument',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe, FormsModule, TranslateModule,
    IconComponent, InitialsComponent, DropdownComponent,
    forwardRef(() => ArgumentComponent),
  ],
  template: `
    <div class="argument" [class]="'argument--' + argument().type" [id]="argumentId()">
      <div class="argument-inner">

        <div class="argument-header">
          <div class="type-badge type-badge--{{ argument().type }}">
            {{ 'COMPONENTS.ARGUMENT.TYPE_' + argument().type.toUpperCase() | translate }}
          </div>

          <div class="author-row">
            <div class="avatar">
              @if (argument().creator?.imageUrl) {
                <img [src]="argument().creator.imageUrl" [alt]="argument().creator.name" class="avatar-img">
              } @else {
                <cos-initials [name]="argument().creator?.name || ''"></cos-initials>
              }
            </div>
            <span class="author-name">{{ argument().creator?.name }}</span>
            <span class="created-at">{{ argument().createdAt | date:'y-MM-dd HH:mm' }}</span>
            @if (isEdited()) {
              <span class="edited-badge" translate="COMPONENTS.ARGUMENT.LBL_EDITED"></span>
            }
          </div>

          <cos-dropdown>
            <button selection class="btn-actions" (click)="$event.stopPropagation()">
              <cos-icon name="more-vertical" size="16"></cos-icon>
            </button>
            <div options>
              @if (canEdit()) {
                <button class="option" (click)="showEdit.update(v => !v)">
                  <cos-icon name="edit" size="16"></cos-icon>
                  <span translate="COMPONENTS.ARGUMENT.OPTION_EDIT"></span>
                </button>
              }
              <button class="option" (click)="copyLink($event)">
                <cos-icon name="link" size="16"></cos-icon>
                <span translate="LNK_DIRECT_LINK"></span>
              </button>
              <button class="option" (click)="doReport()">
                <cos-icon name="warning" size="16"></cos-icon>
                <span translate="COMPONENTS.ARGUMENT.OPTION_REPORT"></span>
              </button>
              @if (canEdit()) {
                <button class="option option--error" (click)="doDelete()">
                  <cos-icon name="trash" size="16"></cos-icon>
                  <span translate="COMPONENTS.ARGUMENT.OPTION_DELETE"></span>
                </button>
              }
            </div>
          </cos-dropdown>
        </div>

        @if (argument().subject) {
          <div class="argument-subject">{{ argument().subject }}</div>
        }

        @if (!argument().deletedAt && !showEdit()) {
          <div class="argument-body" #argumentBody [innerHTML]="safe(argument().text)"></div>
        }

        @if (argument().deletedAt && !showDeletedArgument()) {
          <div class="argument-deleted">
            <span translate="COMPONENTS.ARGUMENT.LBL_DELETED"></span>
            <button class="btn-show-deleted" (click)="showDeletedArgument.set(true)" translate="COMPONENTS.ARGUMENT.BTN_SHOW_DELETED"></button>
          </div>
        }

        @if (showEdit()) {
          <div class="edit-form">
            <input [ngModel]="editSubject()" (ngModelChange)="editSubject.set($event)" class="edit-subject-input" [placeholder]="'COMPONENTS.POST_ARGUMENT.SUBJECT_PLACEHOLDER' | translate">
            <textarea [ngModel]="editText()" (ngModelChange)="editText.set($event)" class="edit-text-input" rows="4"></textarea>
            <div class="edit-actions">
              <button class="btn-cancel" (click)="showEdit.set(false)" translate="BTN_CANCEL"></button>
              <button class="btn-save" (click)="saveEdit()" translate="BTN_SAVE"></button>
            </div>
          </div>
        }

        <div class="argument-footer">
          <div class="votes">
            <button class="btn-vote btn-vote--up" [class.active]="argument().votes?.up?.selected" (click)="vote(1)">
              <cos-icon name="thumbs-up" size="16"></cos-icon>
              <span>{{ argument().votes?.up?.count || 0 }}</span>
            </button>
            <button class="btn-vote btn-vote--down" [class.active]="argument().votes?.down?.selected" (click)="vote(-1)">
              <cos-icon name="thumbs-down" size="16"></cos-icon>
              <span>{{ argument().votes?.down?.count || 0 }}</span>
            </button>
          </div>

          <div class="reply-actions">
            @if ((argument().replies?.count || 0) > 0) {
              <button class="btn-toggle-replies" (click)="showReplies.update(v => !v)">
                {{ (showReplies() ? 'COMPONENTS.ARGUMENT.LNK_HIDE_REPLIES' : 'COMPONENTS.ARGUMENT.LNK_SHOW_REPLIES') | translate:{ count: argument().replies.count } }}
              </button>
            }
            @if (userStore.isAuthenticated()) {
              <button class="btn-reply" (click)="showReplyForm.update(v => !v)" translate="COMPONENTS.ARGUMENT.BTN_REPLY"></button>
            }
          </div>
        </div>
      </div>

      @if (showReplyForm()) {
        <div class="reply-form-wrap">
          <textarea
            [ngModel]="replyText()"
            (ngModelChange)="replyText.set($event)"
            class="reply-textarea"
            rows="3"
            [placeholder]="'COMPONENTS.ARGUMENT.REPLY_PLACEHOLDER' | translate"
          ></textarea>
          <div class="reply-form-actions">
            <button class="btn-cancel" (click)="showReplyForm.set(false)" translate="BTN_CANCEL"></button>
            <button class="btn-primary" [disabled]="!replyText().trim()" (click)="postReply()" translate="COMPONENTS.ARGUMENT.BTN_POST_REPLY"></button>
          </div>
        </div>
      }

      @if (showReplies()) {
        <div class="replies-wrap">
          @for (reply of argument().replies?.rows; track reply.id) {
            <cos-argument
              [argument]="reply"
              [topicId]="topicId()"
              [discussionId]="discussionId()"
              [root]="root() || argument()"
              (deleted)="deleted.emit()"
            ></cos-argument>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .argument { margin-bottom: 16px; }
    .argument-inner {
      background: var(--color-surfaces, #f9fafb);
      border-radius: var(--radius-md, 8px);
      padding: 16px;
      border-left: 4px solid var(--color-border);
    }
    .argument--pro .argument-inner { border-left-color: var(--color-success, #5AB467); }
    .argument--con .argument-inner { border-left-color: var(--color-error, #EF4025); }
    .argument--poi .argument-inner { border-left-color: var(--color-primary, #1168A8); }

    .argument-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; flex-wrap: wrap; }
    .type-badge {
      font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 2px 8px;
      border-radius: 99px; flex-shrink: 0;
    }
    .type-badge--pro { background: #e8f5e9; color: #2e7d32; }
    .type-badge--con { background: #ffebee; color: #c62828; }
    .type-badge--poi { background: #e3f2fd; color: #1565c0; }

    .author-row { display: flex; align-items: center; gap: 8px; flex: 1; }
    .avatar { width: 28px; height: 28px; flex-shrink: 0; }
    .avatar-img { width: 28px; height: 28px; border-radius: 50%; object-fit: cover; }
    .author-name { font-weight: 600; font-size: 13px; }
    .created-at { font-size: 12px; color: var(--color-text-muted); }
    .edited-badge { font-size: 11px; color: var(--color-text-muted); font-style: italic; }

    .btn-actions { background: none; border: none; cursor: pointer; color: var(--color-text-muted); padding: 4px; display: flex; align-items: center; margin-left: auto; }
    .option { display: flex; align-items: center; gap: 8px; padding: 8px 12px; cursor: pointer; width: 100%; background: none; border: none; font-size: 14px; text-align: left; }
    .option--error { color: var(--color-error, #EF4025); }

    .argument-subject { font-weight: 700; font-size: 15px; margin-bottom: 6px; }
    .argument-body { font-size: 14px; line-height: 1.6; color: var(--color-text); }
    .argument-deleted { font-style: italic; color: var(--color-text-muted); display: flex; gap: 8px; align-items: center; }
    .btn-show-deleted { background: none; border: none; color: var(--color-primary); cursor: pointer; font-size: 13px; text-decoration: underline; }

    .edit-form { display: flex; flex-direction: column; gap: 8px; margin: 10px 0; }
    .edit-subject-input, .edit-text-input { width: 100%; padding: 8px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: 14px; box-sizing: border-box; }
    .edit-actions { display: flex; gap: 8px; justify-content: flex-end; }

    .argument-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 12px; padding-top: 10px; border-top: 1px solid var(--color-border); }
    .votes { display: flex; gap: 12px; }
    .btn-vote { background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 4px; color: var(--color-text-muted); font-size: 13px; padding: 4px 8px; border-radius: var(--radius-sm); transition: color .15s; &:hover { color: var(--color-primary); } &.active { color: var(--color-primary); font-weight: 700; } }

    .reply-actions { display: flex; gap: 12px; align-items: center; }
    .btn-toggle-replies, .btn-reply { background: none; border: none; cursor: pointer; font-size: 13px; font-weight: 600; color: var(--color-primary); &:hover { text-decoration: underline; } }

    .reply-form-wrap { margin-top: 8px; padding: 12px; background: var(--color-background); border-radius: var(--radius-md); border: 1px solid var(--color-border); }
    .reply-textarea { width: 100%; padding: 8px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: 14px; box-sizing: border-box; resize: vertical; }
    .reply-form-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 8px; }

    .btn-cancel { background: none; border: 1px solid var(--color-border); padding: 6px 14px; border-radius: var(--radius-sm); cursor: pointer; font-size: 13px; }
    .btn-save, .btn-primary { background: var(--color-primary); color: white; border: none; padding: 6px 14px; border-radius: var(--radius-sm); cursor: pointer; font-size: 13px; font-weight: 600; &:disabled { opacity: .5; cursor: not-allowed; } }

    .replies-wrap { margin-top: 8px; padding-left: 24px; border-left: 2px solid var(--color-border); }
  `]
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
