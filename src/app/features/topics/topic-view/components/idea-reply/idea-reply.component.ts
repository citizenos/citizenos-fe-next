import { Component, inject, signal, input, model, output, ChangeDetectionStrategy, OnInit, AfterViewInit, ViewChild, ElementRef, forwardRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { take } from 'rxjs';

import { TopicIdeationService } from '../../../../../core/services/topic-ideation.service';
import { UserStore } from '../../../../../core/state/user.store';
import { NotificationService } from '../../../../../core/services/notification.service';
import { DialogService } from '../../../../../shared/dialog/dialog.service';
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { InitialsComponent } from '../../../../../shared/components/initials/initials.component';
import { IdeaReplyFormComponent } from '../idea-reply-form/idea-reply-form.component';
import { IdeaReplyReportComponent } from '../idea-reply-report/idea-reply-report.component';
import { CosDropdownDirective } from '../../../../../shared/directives/cos-dropdown.directive';

@Component({
  selector: 'app-idea-reply',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule,
    IconComponent,
    InitialsComponent,
    IdeaReplyFormComponent,
    CosDropdownDirective,
    forwardRef(() => IdeaReplyComponent)
  ],
  template: `
<div class="argument">
  <div class="argument_wrap idea_reply" [id]="argument().id">
    <div class="argument_content_wrap">
      <div class="argument_header" (click)="toggleReplies()">
        <div class="header_left">
          <div class="author_wrap">
            <div class="image_wrap">
              @if (argument().creator?.imageUrl) {
                <img class="profile_image" [src]="argument().creator.imageUrl" [alt]="argument().creator.name" />
              } @else {
                <div class="profile_image_filler">
                  <cos-initials [name]="argument().creator?.name || ''"></cos-initials>
                </div>
              }
            </div>
            <div class="author_name">
              {{ argument().creator?.name }}
            </div>
          </div>
        </div>

        <div class="header_right">
          <div class="created_at">{{ argument().createdAt | date : 'y-MM-dd HH:mm' }}</div>
          
          <div class="dropdown button_dropdown mobile_hidden" cosDropdown>
            <button class="btn_argument_actions" (click)="$event.stopPropagation()">
              <cos-icon name="more-vertical" size="16"></cos-icon>
            </button>
            <div class="options">
              @if (canEdit()) {
                <button class="option" (click)="toggleEdit(); $event.stopPropagation()">
                  <cos-icon name="edit" size="16"></cos-icon>
                  <span translate="COMPONENTS.ARGUMENT.OPTION_EDIT"></span>
                </button>
              }
              <button class="option" (click)="copyArgumentLink($event); $event.stopPropagation()">
                <cos-icon name="link" size="16"></cos-icon>
                <span translate="LNK_DIRECT_LINK"></span>
              </button>
              <button class="option" (click)="doArgumentReport(); $event.stopPropagation()">
                <cos-icon name="warning" size="16"></cos-icon>
                <span translate="COMPONENTS.ARGUMENT.OPTION_REPORT"></span>
              </button>
              @if (canEdit()) {
                <button class="option error_text" (click)="doShowDeleteArgument(); $event.stopPropagation()">
                  <cos-icon name="trash" size="16"></cos-icon>
                  <span translate="COMPONENTS.ARGUMENT.OPTION_DELETE"></span>
                </button>
              }
            </div>
          </div>
        </div>
      </div>

      <div class="argument_content">
        @if (isVisible()) {
          <div class="argument_body" #argumentBody [innerHTML]="getSafeHtml(argument().text)"></div>
        }

        @if (showEdit()) {
          <app-idea-reply-form
            [argument]="argument()"
            [topicId]="topicId()"
            [ideationId]="ideationId()"
            [ideaId]="ideaId()"
            [editMode]="true"
            (showReplyChange)="showEdit.set($event)">
          </app-idea-reply-form>
        }
      </div>

      <div class="argument_footer">
        <div class="footer_left">
          <div class="button_group">
            <button class="btn_vote_argument" (click)="doArgumentVote(1)" [class.selected]="argument().votes?.up?.selected">
              <cos-icon name="thumbs-up" size="16"></cos-icon>
            </button>
            <button class="btn_small_plain count_pro" (click)="doShowVotersList()" [class.bold]="argument().votes?.up?.selected">
              {{ argument().votes?.up?.count || 0 }}
            </button>
          </div>
          <div class="button_group">
            <button class="btn_vote_argument" (click)="doArgumentVote(-1)" [class.selected]="argument().votes?.down?.selected">
              <cos-icon name="thumbs-down" size="16"></cos-icon>
            </button>
            <button class="btn_small_plain count_con" (click)="doShowVotersList()" [class.bold]="argument().votes?.down?.selected">
              {{ argument().votes?.down?.count || 0 }}
            </button>
          </div>
        </div>

        <div class="footer_right">
          @if (argument().replies?.count > 0) {
            <button class="btn_ghost_reply_argument" (click)="showReplies.set(!showReplies())">
              {{ (showReplies() ? 'COMPONENTS.ARGUMENT.LNK_HIDE_REPLIES' : 'COMPONENTS.ARGUMENT.LNK_SHOW_REPLIES') | translate:{ count: argument().replies.count } }}
            </button>
          }
          
          @if (userStore.isAuthenticated()) {
            <button class="btn_reply_argument" (click)="showReplyInput.set(!showReplyInput())" translate="COMPONENTS.ARGUMENT.BTN_REPLY"></button>
          }
        </div>
      </div>
    </div>

    @if (showReplyInput()) {
      <app-idea-reply-form
        [argument]="argument()"
        [topicId]="topicId()"
        [ideationId]="ideationId()"
        [ideaId]="ideaId()"
        (showReplyChange)="showReplyInput.set($event)"
        (showRepliesChange)="showReplies.set($event)">
      </app-idea-reply-form>
    }

    @if (showReplies()) {
      <div class="replies_wrap">
        @for (reply of argument().replies?.rows; track reply.id) {
          <div class="reply_container">
            <div class="reply_referer"></div>
            <app-idea-reply
              [argument]="reply"
              [root]="root() || argument()"
              [topicId]="topicId()"
              [ideationId]="ideationId()"
              [ideaId]="ideaId()">
            </app-idea-reply>
          </div>
        }
      </div>
    }
  </div>
</div>
  `,
  styles: [`
.argument {
  width: 100%;
}

.idea_reply {
  padding: 16px 16px 16px 0;
  width: 100%;

  .argument_content_wrap {
    background-color: #F9FAFB;
    border-radius: 8px;
    padding: 16px;
  }
}

.argument_header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  cursor: pointer;
}

.author_wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.profile_image {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.author_name {
  font-weight: 600;
  color: #374151;
}

.header_right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.created_at {
  font-size: 12px;
  color: #9CA3AF;
}

.argument_content {
  margin-bottom: 16px;
  color: #4B5563;
  line-height: 1.5;
}

.argument_footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #E5E7EB;
}

.footer_left {
  display: flex;
  gap: 16px;
}

.button_group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn_vote_argument {
  background: none;
  border: none;
  cursor: pointer;
  color: #9CA3AF;
  display: flex;
  align-items: center;
  padding: 4px;

  &:hover {
    color: #3B82F6;
  }

  &.selected {
    color: #3B82F6;
  }
}

.btn_small_plain {
  background: none;
  border: none;
  cursor: pointer;
  color: #6B7280;
  font-size: 14px;

  &.bold {
    font-weight: 700;
  }
}

.footer_right {
  display: flex;
  gap: 12px;
}

.btn_reply_argument,
.btn_ghost_reply_argument {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #2563EB;

  &:hover {
    text-decoration: underline;
  }
}

.replies_wrap {
  padding-left: 32px;
  margin-top: 12px;
  border-left: 2px solid #E5E7EB;
}

.reply_container {
  display: flex;
  flex-direction: column;
  margin-top: 12px;
}

.dropdown {
  position: relative;
  .options {
    display: none;
    position: absolute;
    right: 0;
    top: 100%;
    background: var(--color-surfaces);
    box-shadow: var(--shadow-lg);
    border-radius: 8px;
    z-index: 10;
    padding: 8px 0;
    min-width: 180px;
    
    .option {
      display: flex;
      align-items: center;
      padding: 8px 16px;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
      cursor: pointer;
      font-size: 14px;
      color: var(--color-text-main);
      gap: 12px;

      &:hover {
        background: var(--color-background-hover);
      }

      &.error_text {
        color: var(--color-error);
      }
    }

    .line_separator {
      height: 1px;
      background: var(--color-border);
      margin: 4px 0;
    }
  }

  &.dropdown_active {
    .options {
      display: block;
    }
  }
}

.btn_argument_actions {
  background: none;
  border: none;
  cursor: pointer;
  color: #9CA3AF;
  display: flex;
  align-items: center;
}

.error_text {
  color: #EF4444;
}
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdeaReplyComponent implements OnInit, AfterViewInit {
  argument = model.required<any>();
  root = input<any>(null);
  topicId = model.required<string>();
  ideationId = model.required<string>();
  ideaId = model.required<string>();
  showReplyInput = signal(false);
  showReplies = signal(false);

  @ViewChild('argumentBody') argumentBody!: ElementRef;

  private ideationService = inject(TopicIdeationService);
  public userStore = inject(UserStore);
  private notification = inject(NotificationService);
  private translate = inject(TranslateService);
  private dialog = inject(DialogService);
  private sanitizer = inject(DomSanitizer);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  showEdit = signal(false);
  showEdits = signal(false);
  showDeletedArgument = signal(false);
  mobileActions = signal(false);
  isReply = signal(false);
  wWidth = signal(window.innerWidth);

  ngOnInit() {
    const arg = this.argument();
    if (arg.replies) {
      arg.replies.count = arg.replies.rows?.length || 0;
      arg.replies.rows?.forEach((reply: any) => {
        if (reply.children?.length) {
          arg.replies.count += reply.children.length;
        }
      });
    }

    this.isReply.set(arg.type === 'reply');
    if (arg.children) {
      arg.children.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
  }

  ngAfterViewInit() {
    if (this.isReply()) {
      // Replicate legacy prepend author name logic if it's a direct reply
      // In a real app, this might be better handled in the template or via a pipe
    }
  }

  isEdited() {
    return (this.argument().edits?.length || 0) > 1;
  }

  canEdit() {
    const user = this.userStore.user();
    return this.argument().creator?.id === user?.id && !this.argument().deletedAt;
  }

  isVisible() {
    const arg = this.argument();
    return (!arg.deletedAt && !this.showDeletedArgument() && !this.showEdit()) || (arg.deletedAt && this.showDeletedArgument());
  }

  getSafeHtml(text: string): SafeHtml {
    // Simple placeholder for markdown parsing
    return this.sanitizer.bypassSecurityTrustHtml(text || '');
  }

  toggleEdit() {
    this.showEdit.update(v => !v);
  }

  doShowDeleteArgument() {
    const dialog = this.dialog.open(ConfirmDialogComponent, {
      data: {
        level: 'delete',
        heading: 'MODALS.TOPIC_DELETE_IDEA_REPLY_TITLE',
        points: ['MODALS.TOPIC_DELETE_IDEA_REPLY_TXT_ARE_YOU_SURE'],
        confirmBtn: 'MODALS.TOPIC_DELETE_IDEA_REPLY_BTN_YES',
        closeBtn: 'MODALS.TOPIC_DELETE_IDEA_REPLY_BTN_NO'
      }
    });

    dialog.afterClosed().subscribe(confirm => {
      if (confirm) {
        this.ideationService.deleteIdeaComment({
          topicId: this.topicId(),
          ideationId: this.ideationId(),
          ideaId: this.ideaId(),
          commentId: this.argument().id
        }).pipe(take(1)).subscribe(() => {
          this.notification.success('COMPONENTS.IDEA_REPLY.MSG_DELETE_SUCCESS');
          // Emit event or reload
        });
      }
    });
  }

  copyArgumentLink(event: MouseEvent) {
    const arg = this.argument();
    const id = arg.id + '_v' + ((arg.edits?.length || 1) - 1);
    const url = `${window.location.origin}${this.router.url.split('?')[0]}?replyId=${id}`;
    
    navigator.clipboard.writeText(url).then(() => {
      this.notification.success('VIEWS.TOPICS_TOPICID.ARGUMENT_LNK_COPIED');
    });
  }

  doArgumentReport() {
    this.dialog.open(IdeaReplyReportComponent, {
      data: {
        argument: this.argument(),
        topicId: this.topicId(),
        ideaId: this.ideaId(),
        ideationId: this.ideationId()
      }
    });
  }

  doArgumentVote(value: number) {
    if (!this.userStore.isAuthenticated()) return;

    this.ideationService.voteIdeaComment({
      topicId: this.topicId(),
      ideationId: this.ideationId(),
      ideaId: this.ideaId(),
      commentId: this.argument().id,
      value
    }).pipe(take(1)).subscribe(votes => {
      this.argument().votes = votes;
    });
  }

  toggleReplies() {
    this.showReplies.update(v => !v);
  }

  doShowVotersList() {
    // Implement ArgumentReactionsComponent if needed
  }
}
