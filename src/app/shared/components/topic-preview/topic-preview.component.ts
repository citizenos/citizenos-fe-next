import { NoFeatureYetComponent } from '@shared/components/no-feature-yet/no-feature-yet.component';
import { Component, ChangeDetectionStrategy, input, model, inject, signal, viewChild, ElementRef, afterNextRender } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Topic } from '../../../core/interfaces/topic';
import { TopicMemberGroup } from '../topic-settings-panel/topic-settings-panel.component';
import { Ideation } from '../../../core/interfaces/ideation';
import { Vote } from '../../../core/interfaces/vote';
import { DiscussionData } from '../../../core/interfaces/discussion';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';
import { IconComponent } from '../icon/icon.component';
import { TopicService } from '../../../core/services/topic.service';
import { VoteOptionsComponent } from '../vote-options/vote-options.component';

@Component({
  selector: 'cos-topic-preview',
  standalone: true,
  imports: [
    NoFeatureYetComponent,TranslateModule, SafeHtmlPipe, DatePipe, NgClass, IconComponent, VoteOptionsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="topic_content_wrap">
      <div class="info_bar">
        <div>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="12" fill="#F39129" />
            <path
              d="M11.4385 4.80078C11.0924 4.80078 10.8181 5.09279 10.8396 5.43821L11.3646 13.8382C11.3844 14.1544 11.6466 14.4008 11.9635 14.4008H12.0361C12.353 14.4008 12.6152 14.1544 12.635 13.8382L13.16 5.43821C13.1816 5.09279 12.9072 4.80078 12.5611 4.80078H11.4385Z"
              fill="white" />
            <path
              d="M11.9998 18.6008C12.6625 18.6008 13.1998 18.0635 13.1998 17.4008C13.1998 16.738 12.6625 16.2008 11.9998 16.2008C11.3371 16.2008 10.7998 16.738 10.7998 17.4008C10.7998 18.0635 11.3371 18.6008 11.9998 18.6008Z"
              fill="white" />
          </svg>
        </div>
        <span [innerHTML]="'VIEWS.TOPIC_CREATE.PREVIEW_INFO' | translate"></span>
      </div>

      @if (topic(); as t) {
        @if (t.imageUrl) {
          <div class="topic_image">
            <img [src]="t.imageUrl" [alt]="t.title || ''" />
          </div>
        }

        <div id="topic_text_wrap" #topicTextWrap [ngClass]="readMore() ? 'open' : 'closed'">
          <div class="topic_title">
            <h1 class="main_heading" [innerHTML]="t.title || ('VIEWS.TOPIC_CREATE.TITLE_HEADING' | translate)"></h1>
          </div>
          
          @if (t.intro) {
            <div class="topic_intro" [innerHTML]="t.intro"></div>
          }
          
          @if (t.description) {
            <div class="topic_content" [innerHTML]="t.description | safeHtml"></div>
          }

          @if (readMoreButton()) {
            <div class="button_wrap" [ngClass]="{open: readMore()}">
              <button class="btn_medium_secondary" (click)="toggleReadMore()">
                @if (!readMore()) {
                  <cos-icon name="chevron-down"></cos-icon>
                  <span>{{ 'VIEWS.TOPIC_CREATE.BTN_READ_MORE' | translate }}</span>
                } @else {
                  <cos-icon name="chevron-up"></cos-icon>
                  <span>{{ 'VIEWS.TOPIC_CREATE.BTN_READ_LESS' | translate }}</span>
                }
              </button>
            </div>
          }
        </div>
      }
    </div>

    @if (discussion(); as d) {
      @if (d.question) {
        <div class="arguments_wrap">
          <div class="arguments_header">
            <div class="header_section">
              <div class="question">
                {{ d.question }}
              </div>
              <div class="setting_button dropdown button_dropdown">
                <button class="btn_medium_close mobile_hidden">
                  <cos-icon name="more-vertical-legacy"></cos-icon>
                  <span>{{ 'COMPONENTS.TOPIC_ARGUMENTS.BTN_DISCUSSION_ACTIONS' | translate }}</span>
                </button>
                <button id="mobile_actions" class="btn_medium_close icon mobile_show">
                  <cos-icon name="more-vertical-legacy"></cos-icon>
                </button>
              </div>
            </div>
            @if (d.deadline) {
              <div class="data_section">
                <h3 class="title">{{ 'COMPONENTS.TOPIC_ARGUMENTS.LBL_DEADLINE' | translate }}</h3>
                <div class="deadline">
                  <span class="bold">{{ d.deadline | date:'y-MM-dd HH:mm' }}</span>
                </div>
              </div>
            }
          </div>
          <div class="arguments_content">
            <cos-no-feature-yet>
              
              <div class="description_heading">{{ 'COMPONENTS.TOPIC_ARGUMENTS.NO_ARGUMENTS_HEADING' | translate }}</div>
              <div class="button">
                <button class="btn_medium_submit"
                  [ngClass]="{disabled: (topic().status === topicService.STATUSES.inProgress && !topicService.canDelete(topic()))}">
                  <cos-icon name="plus-legacy"></cos-icon>
                  <span>{{ 'COMPONENTS.TOPIC_ARGUMENTS.NO_ARGUMENTS_BTN_ADD' | translate }}</span>
                </button>
              </div>
              <div class="no_feature_description">
                <div class="description_text">
                  <div class="description_heading">{{ 'COMPONENTS.TOPIC_ARGUMENTS.NO_ARGUMENTS_DESC_HEADING' | translate }}</div>
                  <div>
                    <span>{{ 'COMPONENTS.TOPIC_ARGUMENTS.NO_ARGUMENTS_DESC_BEFORE' | translate }}</span><br /><br />
                    <span>{{ 'COMPONENTS.TOPIC_ARGUMENTS.NO_ARGUMENTS_DESC_AFTER' | translate }}</span>
                    @if (topic().status === topicService.STATUSES.ideation) {
                      <br /><br />
                      <span>{{ 'COMPONENTS.TOPIC_ARGUMENTS.NO_ARGUMENTS_DESC_INFO' | translate }}</span>
                    }
                    @if (topic().status === topicService.STATUSES.inProgress && !topicService.canDelete(topic())) {
                      <br /><br />
                      <span>{{ 'COMPONENTS.TOPIC_ARGUMENTS.NO_ARGUMENTS_DESC_PARTICIPANTS' | translate }}</span>
                    }
                    @if (topic().status === topicService.STATUSES.inProgress && topicService.canDelete(topic())) {
                      <br /><br />
                      <span>{{ 'COMPONENTS.TOPIC_ARGUMENTS.NO_ARGUMENTS_DESC_ADMIN' | translate }}</span>
                    }
                  </div>
                </div>
              </div>
            </cos-no-feature-yet>
          </div>
        </div>
      }
    }

    @if (ideation(); as i) {
      @if (i.question) {
        <div class="ideation_wrap">
          <div class="ideation_header">
            <div class="header_section">
              <div class="question">
                {{ i.question }}
              </div>
            </div>
          </div>
          <div class="ideation_content">
            <cos-no-feature-yet>
              <h2 class="description_heading">{{ 'COMPONENTS.TOPIC_IDEATION.NO_IDEAS_YET' | translate }}</h2>
            </cos-no-feature-yet>
          </div>
        </div>
      }
    }

    @if (vote(); as v) {
      @if (v.question || v.description) {
        <div class="vote_wrap">
          <div class="vote_header">
            <div class="header_section">
              <div class="question">{{ v.question || v.description }}</div>
              <div class="setting_button dropdown button_dropdown">
                <button class="btn_medium_close mobile_hidden">
                  <cos-icon name="more-vertical-legacy"></cos-icon>
                  <span>{{ 'COMPONENTS.TOPIC_VOTE_CAST.BTN_VOTE_ACTIONS' | translate }}</span>
                </button>
                <button id="mobile_actions" class="btn_medium_close icon mobile_show">
                  <cos-icon name="more-vertical-legacy"></cos-icon>
                </button>
              </div>
            </div>
            <div class="data_section">
              <div class="data_cell">
                <div class="title">{{ 'COMPONENTS.TOPIC_VOTE_CAST.LBL_DEADLINE' | translate }}</div>
                <div class="data_item">
                  @if (v.endsAt) {
                    <span class="bold">{{ v.endsAt | date:'y-MM-dd HH:mm' }}</span>
                    <a>{{ 'COMPONENTS.TOPIC_VOTE_CAST.OPT_SEND_VOTE_REMINDER' | translate }}</a>
                  } @else {
                    <span class="bold">{{ 'COMPONENTS.TOPIC_VOTE_CAST.NO_DEADLINE' | translate }}</span>
                  }
                </div>
              </div>
              <div class="data_cell">
                <div class="title">{{ 'COMPONENTS.TOPIC_VOTE_CAST.LBL_VOTES' | translate }}</div>
                <div class="data_item">
                  <span class="bold">{{ v.votersCount || 0 }}</span>
                </div>
              </div>
            </div>
            <div class="data_section">
              <div class="data_cell">
                <div class="info_text" [innerHTML]="'COMPONENTS.TOPIC_VOTE_CAST.LBL_INFO_RESULTS_ADMIN' | translate">
                </div>
              </div>
            </div>
          </div>
          <div class="vote_content">
            @if (v.maxChoices === 1) {
              <div class="vote_info">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="24" cy="24" r="24" fill="#98DAA2" />
                  <rect x="12" y="12" width="24" height="24" rx="12" fill="white" />
                  <rect x="18" y="18" width="12" height="12" rx="6" fill="#5AB467" />
                </svg>
                <span>{{ 'VIEWS.VOTE_CREATE.PREVIEW_VOTE_TYPE_REGULAR' | translate }}</span>
              </div>
            }
            @if (v.maxChoices !== undefined && v.maxChoices > 1) {
              <div class="vote_info">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="24" cy="24" r="24" fill="#98DAA2" />
                  <rect x="18" y="26" width="12" height="12" rx="1" fill="#F1FAF3" />
                  <path fill-rule="evenodd" clip-rule="evenodd"
                    d="M19.1992 32.1455L22.6278 35.6004L28.7992 29.3816L27.8324 28.4004L22.6278 33.6449L20.1661 31.1712L19.1992 32.1455Z"
                    fill="#5AB467" />
                  <rect x="18" y="10" width="12" height="12" rx="1" fill="#F1FAF3" />
                  <path fill-rule="evenodd" clip-rule="evenodd"
                    d="M20 16.1209L22.8571 19L28 13.8177L27.1943 13L22.8571 17.3704L20.8057 15.309L20 16.1209Z"
                    fill="#5AB467" />
                </svg>
                <span>{{ 'VIEWS.VOTE_CREATE.TXT_YOU_CAN_CHOOSE_OPTIONS' | translate: {range: (v.maxChoices !== v.minChoices) ? (v.minChoices + '-' + v.maxChoices) : v.maxChoices} }}</span>
              </div>
            }
            <cos-vote-options [options]="v.options || []" [maxChoices]="v.maxChoices || 1" [disabled]="true"></cos-vote-options>
            <div class="line_separator vote"></div>
            <div class="vote_buttons_wrap">
              @if (v.delegationIsAllowed) {
                <button class="btn_medium_close">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M18.3432 7.92286L19.0634 2L13.1505 2.72143L15.1001 4.67429L7.72208 12.0647L9.12918 13.4742L16.5072 6.08375L18.3432 7.92286Z"
                      fill="#2C3B47" />
                    <path
                      d="M9.92821 21L20 10.9113L18.5929 9.50181L9.93524 18.174L5.4071 13.6524L4 15.0618L9.92821 21Z"
                      fill="#2C3B47" />
                  </svg>
                  <span class="bold">{{ 'VIEWS.VOTE_CREATE.VOTE_HEADING_DELEGATE' | translate }}</span>
                </button>
              }
            </div>
          </div>
        </div>
      }
    }
  `,
  styles: [`
    .topic_content_wrap {
      display: flex;
      flex-direction: column;
      width: 100%;
      border-radius: 16px;
      background-color: var(--color-surfaces);
      position: relative;
      overflow: hidden;

      .info_bar {
        display: flex;
        gap: 16px;
        align-items: center;
        border-top-left-radius: 16px;
        border-top-right-radius: 16px;
        padding: 16px;
        background-color: var(--color-warn-background);
        position: relative;
        top: 0;
        width: 100%;
        font-size: 14px;
        font-weight: 500;
        color: var(--color-text-main);
      }

      .topic_image {
        width: 100%;
        height: 324px;
        background: var(--color-surfaces);
        position: relative;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      #topic_text_wrap {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 32px;
        overflow: hidden;
        position: relative;
        transition: max-height 0.1s;

        &.open {
          max-height: none;
        }

        &.closed {
          max-height: 320px;
        }

        .button_wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 96px;
          background: linear-gradient(0deg, #FFFFFF 0%, rgba(255, 255, 255, 0) 100%);
          
          &.open {
            background: none;
            position: relative;
            height: 48px;
            margin-top: 24px;
          }
        }

        .topic_title {
          margin-bottom: 12px;

          .main_heading {
            font-size: 28px;
            font-weight: 700;
            color: var(--color-text-main);
            word-break: break-word;
            margin: 0;
          }
        }

        .topic_intro {
          font-style: italic;
          font-weight: 500;
          font-size: 16px;
          line-height: 24px;
          color: var(--color-text-main);
          margin-bottom: 16px;
          word-break: break-word;
        }

        .topic_content {
          font-weight: 400;
          font-size: 16px;
          line-height: 24px;
          color: var(--color-text-main);
          word-break: break-word;
        }
      }
    }

    .arguments_wrap, .ideation_wrap {
      display: flex;
      flex-direction: column;
      margin-top: 24px;
      width: 100%;
      border-radius: 16px;
      overflow: hidden;

      .arguments_header, .ideation_header {
        display: flex;
        flex-direction: column;
        padding: 24px 32px;
        gap: 16px;
        background-color: #c9dff1;

        .header_section {
          display: flex;
          justify-content: space-between;
          gap: 8px;

          .question {
            font-size: 20px;
            font-weight: 600;
            line-height: 28px;
            color: var(--color-text-main);
          }
        }

        .data_section {
          display: flex;
          flex-direction: column;
          align-items: flex-start;

          .title {
            font-size: 12px;
            font-weight: 400;
            line-height: 16px;
            color: var(--color-text-muted);
            text-transform: uppercase;
          }

          .deadline {
            .bold {
              font-weight: 600;
              color: var(--color-text-main);
            }
          }
        }
      }

      .arguments_content, .ideation_content {
        background-color: var(--color-blue-100);
        padding: 32px;
        display: flex;
        flex-direction: column;
        gap: 16px;

        
      }
    }

    .vote_wrap {
      margin-top: 24px;
      width: 100%;

      .vote_header {
        display: flex;
        flex-direction: column;
        padding: 24px;
        gap: 16px;
        border-radius: 16px 16px 0 0;
        background-color: var(--color-dialog-voting-contrast);
        align-items: initial;

        .header_section {
          display: flex;
          justify-content: space-between;

          .question {
            font-size: 24px;
            font-style: normal;
            font-weight: 600;
            line-height: 32px;
            color: var(--color-text-main);
          }
        }

        .data_section {
          display: flex;
          gap: 56px;

          .data_cell {
            display: flex;
            flex-direction: column;
            align-items: flex-start;

            .title {
              font-size: 12px;
              font-weight: 400;
              line-height: 16px;
            }
            .data_item {
              display: flex;
              gap: 8px;
            }
            .info_text {
              font-size: 14px;
              font-style: normal;
              font-weight: 600;
              line-height: 16px;
            }
          }
        }
      }

      .vote_content {
        display: flex;
        flex-direction: column;
        background-color: var(--color-surfaces);
        border-radius: 0 0 16px 16px;
        padding: 24px;
        gap: 24px;

        @media (max-width: 600px) {
          padding: 16px;
          gap: 16px;
        }

        .vote_info {
          width: 100%;
          display: flex;
          padding: 8px;
          background-color: var(--color-argument-pro-light);
          border-radius: 8px;
          align-items: center;
          gap: 16px;
        }

        .vote_buttons_wrap {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          min-height: 40px;

          @media (max-width: 600px) {
            flex-direction: column;
            gap: 8px;
            button {
              width: 100%;
            }
          }

          .btn_medium_close {
            justify-self: flex-start;
          }

          .btn_medium_submit {
            justify-self: flex-end;
          }
        }
      }

      .radio_wrap {
        padding: 16px;
        border-radius: 8px;
      }
    }
  `]
})
export class TopicPreviewComponent {
  topicService = inject(TopicService);

  topic = model.required<Partial<Topic>>();
  topicGroups = model<TopicMemberGroup[]>([]);
  ideation = input<Partial<Ideation> | null>(null);
  vote = input<Partial<Vote> | null>(null);
  discussion = input<DiscussionData | null>(null);

  topicTextWrap = viewChild<ElementRef>('topicTextWrap');
  readMore = signal(false);
  readMoreButton = signal(false);

  constructor() {
    afterNextRender(() => {
      const content = this.topicTextWrap()?.nativeElement;
      if (content) {
        if (content.offsetHeight >= 320) {
          this.readMoreButton.set(true);
        } else {
          // The structure is roughly .topic_title, .topic_intro, .topic_content inside this wrapper
          const children = content.children;
          let h = 0;
          for (const child of children) {
            h += child.offsetHeight;
            if (h >= 320) {
              this.readMoreButton.set(true);
              break;
            }
          }
        }
      }
    });
  }

  toggleReadMore() {
    this.readMore.update(val => !val);
  }
}
