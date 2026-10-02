import { Component, inject, signal, input, model, ChangeDetectionStrategy, OnInit, AfterViewInit, ViewChild, ElementRef, forwardRef, PLATFORM_ID } from '@angular/core';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { take } from 'rxjs';

import { TopicIdeationService } from '../../../../../core/services/topic-ideation.service';
import { IdeaComment } from '../../../../../core/interfaces/ideation';
import { UserStore } from '../../../../../core/state/user.store';
import { NotificationService } from '../../../../../core/services/notification.service';
import { DialogService } from '../../../../../shared/dialog/dialog.service';
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { InitialsComponent } from '../../../../../shared/components/initials/initials.component';
import { IdeaReplyFormComponent } from '../idea-reply-form/idea-reply-form.component';
import { IdeaReplyReportComponent } from '../idea-reply-report/idea-reply-report.component';
import { CosDropdownDirective } from '../../../../../shared/directives/cos-dropdown.directive';

@Component({
  selector: 'app-idea-reply',
  standalone: true,
  imports: [
    DatePipe,
    TranslateModule,
    RouterModule,
    InitialsComponent,
    IdeaReplyFormComponent,
    CosDropdownDirective,
    forwardRef(() => IdeaReplyComponent)
  ],
  template: `
<div class="argument">
  <div class="argument_wrap idea_reply" [id]="argument().id">
    <div class="argument_content_wrap">
      <div class="argument_header" (click)="toggleReplies()" (keydown.enter)="toggleReplies()" role="button" tabindex="0">
        <div class="header_left">
          @if (argument().creator; as creator) {
            <div class="author_wrap">
              <div class="image_wrap">
                @if (creator.imageUrl) {
                  <img class="profile_image" [src]="creator.imageUrl" [alt]="creator.name" />
                } @else {
                  <div class="profile_image_filler">
                    <cos-initials [name]="creator.name || ''"></cos-initials>
                  </div>
                }
              </div>
              <div class="author_name">
                {{ creator.name }}
              </div>
            </div>
          }
        </div>

        <div class="header_right">
          <div class="created_at">{{ argument().createdAt | date : 'y-MM-dd HH:mm' }}</div>
          
          <div class="dropdown button_dropdown mobile_hidden" cosDropdown>
            <button type="button" class="btn_argument_actions" [aria-label]="'COMPONENTS.ARGUMENT.LBL_ARGUMENT_ACTIONS' | translate">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M9.33325 4.00033C9.33325 3.26699 8.73325 2.66699 7.99992 2.66699C7.26659 2.66699 6.66659 3.26699 6.66659 4.00033C6.66659 4.73366 7.26659 5.33366 7.99992 5.33366C8.73325 5.33366 9.33325 4.73366 9.33325 4.00033ZM9.33325 12.0003C9.33325 11.267 8.73325 10.667 7.99992 10.667C7.26659 10.667 6.66659 11.267 6.66659 12.0003C6.66659 12.7337 7.26659 13.3337 7.99992 13.3337C8.73325 13.3337 9.33325 12.7337 9.33325 12.0003ZM7.99992 6.66699C8.73325 6.66699 9.33325 7.26699 9.33325 8.00033C9.33325 8.73366 8.73325 9.33366 7.99992 9.33366C7.26659 9.33366 6.66659 8.73366 6.66659 8.00033C6.66659 7.26699 7.26659 6.66699 7.99992 6.66699Z" fill="#2C3B47" />
              </svg>
            </button>
            <div class="options">
              @if (canEdit()) {
                <button type="button" class="option" (click)="toggleEdit(); $event.stopPropagation()" (keydown.enter)="toggleEdit(); $event.stopPropagation()" role="button" tabindex="0">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.8143 4.18517L11.8147 7.18569L5.29947 13.7012L2.62438 13.9965C2.26626 14.0361 1.96369 13.7333 2.00354 13.3752L2.30118 10.6981L8.8143 4.18517ZM13.6704 3.73845L12.2616 2.3296C11.8222 1.89013 11.1095 1.89013 10.67 2.3296L9.34467 3.65501L12.3451 6.65553L13.6704 5.33011C14.1099 4.89042 14.1099 4.17791 13.6704 3.73845Z" fill="#2C3B47" />
                  </svg>
                  <span>{{ 'COMPONENTS.ARGUMENT.OPTION_EDIT' | translate }}</span>
                </button>
              }
              <button type="button" class="option" (click)="copyArgumentLink($event); $event.stopPropagation()" (keydown.enter)="copyArgumentLink($event); $event.stopPropagation()" role="button" tabindex="0">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.99965 11.8837L5.30885 9.8302C4.95457 10.1889 4.50411 10.4327 4.01425 10.5306C3.52439 10.6286 3.01706 10.5764 2.55623 10.3807C2.0954 10.1849 1.70169 9.85438 1.42474 9.43072C1.14779 9.00705 1 8.50922 1 8C1 7.49078 1.14779 6.99295 1.42474 6.56929C1.70169 6.14562 2.0954 5.81508 2.55623 5.61934C3.01706 5.4236 3.52439 5.37142 4.01425 5.46938C4.50411 5.56734 4.95457 5.81106 5.30885 6.1698L8.99965 4.11635C8.87306 3.51051 8.96449 2.87843 9.2572 2.3357C9.54992 1.79297 10.0244 1.37586 10.5938 1.16065C11.1632 0.945429 11.7895 0.946489 12.3582 1.16363C12.9269 1.38077 13.4 1.79949 13.6909 2.34321C13.9819 2.88692 14.0712 3.51931 13.9427 4.12472C13.8141 4.73012 13.4763 5.2681 12.9908 5.64027C12.5054 6.01243 11.9049 6.19391 11.2991 6.15153C10.6933 6.10914 10.1226 5.84572 9.69158 5.40943L6.00078 7.46288C6.07441 7.81702 6.07441 8.18298 6.00078 8.53712L9.69158 10.5906C10.1226 10.1543 10.6933 9.89086 11.2991 9.84848C11.9049 9.80609 12.5054 9.98757 12.9908 10.3597C13.4763 10.7319 13.8141 11.2699 13.9427 11.8753C14.0712 12.4807 13.9819 13.1131 13.6909 13.6568C13.4 14.2005 12.9269 14.6192 12.3582 14.8364C11.7895 15.0535 11.1632 15.0546 10.5938 14.8394C10.0244 14.6241 9.54992 14.207 9.2572 13.6643C8.96449 13.1216 8.87306 12.4895 8.99965 11.8837Z" fill="#2C3B47" />
                </svg>
                <span>{{ 'LNK_DIRECT_LINK' | translate }}</span>
              </button>
              <button type="button" class="option" (click)="doArgumentReport(); $event.stopPropagation()" (keydown.enter)="doArgumentReport(); $event.stopPropagation()" role="button" tabindex="0">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="8" cy="8" r="5.5" fill="#2C3B47" stroke="#2C3B47" />
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M4.83552 4.12842L11.8714 11.1643C11.6598 11.4228 11.4228 11.6598 11.1643 11.8714L4.12842 4.83552C4.34 4.57697 4.57697 4.34 4.83552 4.12842Z" fill="white" />
                </svg>
                <span>{{ 'COMPONENTS.ARGUMENT.OPTION_REPORT' | translate }}</span>
              </button>
              @if (canEdit()) {
                <button type="button" class="option error_text" (click)="doShowDeleteArgument(); $event.stopPropagation()" (keydown.enter)="doShowDeleteArgument(); $event.stopPropagation()" role="button" tabindex="0">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M10 3H6V4H10V3ZM11 4V3C11 2.44772 10.5523 2 10 2H6C5.44772 2 5 2.44772 5 3V4H4H2.5C2.22386 4 2 4.22386 2 4.5C2 4.77614 2.22386 5 2.5 5H4V13C4 13.5523 4.44772 14 5 14H11C11.5523 14 12 13.5523 12 13V5H13.5C13.7761 5 14 4.77614 14 4.5C14 4.22386 13.7761 4 13.5 4H12H11ZM7 7H6V11H7V7ZM10 7H9V11H10V7Z" fill="#2C3B47" />
                  </svg>
                  <span>{{ 'COMPONENTS.ARGUMENT.OPTION_DELETE' | translate }}</span>
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
            <button type="button" class="btn_vote_argument" (click)="doArgumentVote(1)" [class.selected]="argument().votes?.up?.selected" [aria-label]="'COMPONENTS.ARGUMENT.LBL_VOTE_UP' | translate">
              @if (!argument().votes?.up?.selected) {
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.9746 4.99965C14.2413 4.99965 14.4748 5.10135 14.6749 5.30474C14.8749 5.50813 15 5.74542 15 6.0166L15 7.5C15.0275 8.00035 15 8 15 8C15 8 14.9725 8.1409 14.9391 8.21999L12.8383 13.1352C12.7382 13.3725 12.5743 13.5759 12.3464 13.7454C12.1185 13.9149 11.8768 13.9997 11.6211 13.9997L3.99432 14V4.99965L7.96957 1.28779C8.12519 1.1296 8.30582 1.03638 8.51147 1.00813C8.71711 0.979879 8.91441 1.02225 9.10338 1.13525C9.29235 1.24824 9.43407 1.40361 9.52856 1.60135C9.62304 1.79909 9.64805 2.0053 9.60359 2.21999L9.2202 5L13.9746 4.99965ZM4.99235 5.5V12.9831L11.8379 12.9827L14 8V5.99965H7.98636L8.60317 2.1183L4.99235 5.5ZM2.00041 13.9997C1.72252 13.9997 1.48631 13.9008 1.29179 13.703C1.09726 13.5053 0.999997 13.2652 0.999997 12.9827L1.00021 6C1.00021 5.71751 1.09726 5.50248 1.29179 5.30474C1.48631 5.107 1.72035 5 1.99825 5L3.99432 4.99965V5.99965L2.00041 6.0166V12.9827L3.99432 12.9831V14L2.00041 13.9997Z" fill="#2C3B47" />
                </svg>
              } @else {
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.675 5.30508C14.475 5.1017 14.2415 5 13.9747 5L9.22038 5.00035L9.60376 2.22034C9.64823 2.00565 9.62322 1.79943 9.52873 1.60169C9.43425 1.40395 9.29252 1.24859 9.10356 1.13559C8.91459 1.0226 8.71728 0.980226 8.51164 1.00847C8.306 1.03672 8.12537 1.12994 7.96975 1.28814L3.99449 5V14.0003L11.6213 14C11.8769 14 12.1187 13.9153 12.3466 13.7458C12.5744 13.5763 12.7384 13.3729 12.8384 13.1356L14.9393 8.22034C14.9727 8.14124 15.0001 8.00035 15.0001 8.00035C15.0001 8.00035 15.0277 8.00069 15.0002 7.50035L15.0002 6.01695C15.0002 5.74576 14.8751 5.50847 14.675 5.30508Z" fill="#2C3B47" />
                  <path d="M2.99432 14.0003V5L1.99825 5.00035C1.72036 5.00035 1.48631 5.10734 1.29179 5.30508C1.09726 5.50283 1.00021 5.71786 1.00021 6.00035L1 12.983C1 13.2655 1.09726 13.5056 1.29179 13.7034C1.48631 13.9011 1.72252 14 2.00042 14L2.99432 14.0003Z" fill="#2C3B47" />
                </svg>
              }
            </button>
            <button type="button" class="btn_small_plain count_pro" (click)="doShowVotersList()" [class.bold]="argument().votes?.up?.selected">
              {{ argument().votes?.up?.count || 0 }}
            </button>
          </div>
          <div class="button_group">
            <button type="button" class="btn_vote_argument" (click)="doArgumentVote(-1)" [class.selected]="argument().votes?.down?.selected" [aria-label]="'COMPONENTS.ARGUMENT.LBL_VOTE_DOWN' | translate">
              @if (!argument().votes?.down?.selected) {
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.02543 11.0003C1.75865 11.0003 1.52522 10.8987 1.32514 10.6953C1.12505 10.4919 1 10.2546 1 9.9834L0.999961 8.5C0.999961 8 1 8 1 8C1 8 0.999968 7.85876 1.03332 7.77966L3.16173 2.86475C3.26177 2.62747 3.42572 2.42408 3.6536 2.25458C3.88147 2.08509 4.12324 2.00035 4.3789 2.00035L12.0057 2L12.0057 11.0003L8.03042 14.7122C7.8748 14.8704 7.69417 14.9636 7.48853 14.9919C7.28289 15.0201 7.08559 14.9777 6.89662 14.8648C6.70765 14.7518 6.56592 14.5964 6.47144 14.3987C6.37696 14.2009 6.35195 13.9947 6.39641 13.78L6.77979 11L2.02543 11.0003ZM11.0076 10.5L11.0076 3.01695L4.16214 3.0173L2.02533 8L2.02543 10.0003L8.01364 10.0003L7.39683 13.8817L11.0076 10.5ZM13.9996 2.00035C14.2775 2.00035 14.5137 2.09922 14.7082 2.29696C14.9027 2.4947 15 2.73481 15 3.0173L14.9998 10C14.9998 10.2825 14.9027 10.4975 14.7082 10.6953C14.5137 10.893 14.2796 11 14.0018 11L12.0057 11.0003V10.0003L13.9996 9.9834L13.9996 3.0173L12.0057 3.01695V2L13.9996 2.00035Z" fill="#2C3B47" />
                </svg>
              } @else {
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.33717 10.6949C1.53725 10.8983 1.77068 11 2.03746 11L6.79183 10.9997L6.40844 13.7797C6.36398 13.9944 6.38899 14.2006 6.48347 14.3983C6.57796 14.596 6.71968 14.7514 6.90865 14.8644C7.09762 14.9774 7.29492 15.0198 7.50056 14.9915C7.70621 14.9633 7.88684 14.8701 8.04246 14.7119L12.0177 11V1.99965L4.39093 2C4.13527 2 3.8935 2.08475 3.66563 2.25424C3.43776 2.42373 3.2738 2.62712 3.17376 2.86441L1.07288 7.77966C1.03954 7.85876 1.01207 7.99965 1.01207 7.99965C1.01207 7.99965 0.984535 7.99931 1.01203 8.49965L1.01203 9.98305C1.01203 10.2542 1.13709 10.4915 1.33717 10.6949Z" fill="#2C3B47" />
                  <path d="M13.0179 1.99965V11L14.014 10.9997C14.2919 10.9997 14.5259 10.8927 14.7204 10.6949C14.9149 10.4972 15.012 10.2821 15.012 9.99965L15.0122 3.01695C15.0122 2.73446 14.9149 2.49435 14.7204 2.29661C14.5259 2.09887 14.2897 2 14.0118 2L13.0179 1.99965Z" fill="#2C3B47" />
                </svg>
              }
            </button>
            <button type="button" class="btn_small_plain count_con" (click)="doShowVotersList()" [class.bold]="argument().votes?.down?.selected">
              {{ argument().votes?.down?.count || 0 }}
            </button>
          </div>
        </div>

        @if (argument().replies; as replies) {
          <div class="footer_right">
            @if (replies.count > 0) {
              <button type="button" class="btn_ghost_reply_argument" (click)="showReplies.set(!showReplies())">
                {{ (showReplies() ? 'COMPONENTS.ARGUMENT.LNK_HIDE_REPLIES' : 'COMPONENTS.ARGUMENT.LNK_SHOW_REPLIES') | translate:{ count: replies.count } }}
              </button>
            }
            
            @if (canReply()) {
              <button type="button" class="btn_reply_argument" (click)="showReplyInput.set(!showReplyInput())">
                {{ 'COMPONENTS.ARGUMENT.BTN_REPLY' | translate }}
              </button>
            }
          </div>
        } @else if (canReply()) {
          <div class="footer_right">
            <button type="button" class="btn_reply_argument" (click)="showReplyInput.set(!showReplyInput())">
              {{ 'COMPONENTS.ARGUMENT.BTN_REPLY' | translate }}
            </button>
          </div>
        }
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
              [ideaId]="ideaId()"
              [canReply]="canReply()">
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
  argument = model.required<IdeaComment>();
  root = input<IdeaComment | null>(null);
  topicId = model.required<string>();
  ideationId = model.required<string>();
  ideaId = model.required<string>();
  canReply = input<boolean>(false);
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
  private platformId = inject(PLATFORM_ID);

  showEdit = signal(false);
  showEdits = signal(false);
  showDeletedArgument = signal(false);
  mobileActions = signal(false);
  isReply = signal(false);
  wWidth = signal(isPlatformBrowser(this.platformId) ? window.innerWidth : 1280);

  ngOnInit() {
    const arg = this.argument();
    if (arg.replies) {
      arg.replies.count = arg.replies.rows?.length || 0;
      arg.replies.rows?.forEach((reply: IdeaComment) => {
        if (reply.children?.length) {
          arg.replies!.count += reply.children.length;
        }
      });
    }

    this.isReply.set(arg.type === 'reply');
    if (arg.children) {
      arg.children.sort((a: IdeaComment, b: IdeaComment) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
  }

  ngAfterViewInit() {
    if (this.isReply()) {
      // Replicate legacy prepend author name logic if it's a direct reply
      // In a real app, this might be better handled in the template or via a pipe
    }
  }

  onResize() {
    if (isPlatformBrowser(this.platformId)) {
      this.wWidth.set(window.innerWidth);
    }
  }

  isEdited() {
    const edits = this.argument().edits;
    const length = Array.isArray(edits) ? edits.length : Object.keys(edits || {}).length;
    return (length || 0) > 1;
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

  copyArgumentLink(_event: Event) {
    const arg = this.argument();
    const edits = arg.edits;
    const length = Array.isArray(edits) ? edits.length : Object.keys(edits || {}).length;
    const id = arg.id + '_v' + ((length || 1) - 1);
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
    if (!this.userStore.isAuthenticated()) {
      this.router.navigate(['/', this.translate.currentLang, 'account', 'login'], {
        queryParams: { redirectSuccess: this.router.url }
      });
      return;
    }

    this.ideationService.voteIdeaComment({
      topicId: this.topicId(),
      ideationId: this.ideationId(),
      ideaId: this.ideaId(),
      commentId: this.argument().id,
      value
    }).pipe(take(1)).subscribe((votes: IdeaComment['votes']) => {
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
