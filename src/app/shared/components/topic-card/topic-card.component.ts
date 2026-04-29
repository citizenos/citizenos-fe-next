import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  inject,
  computed,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Topic } from '../../../core/interfaces/topic';
import { TimeAgoPipe } from '../../pipes/time-ago.pipe';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'cos-topic-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslateModule, DatePipe, TimeAgoPipe, IconComponent],
  template: `
    <!-- Remove from group overlay -->
    @if (removable()) {
      <div class="remove_wrap">
        <button class="btn_medium_submit" (click)="removeFromGroup($event)">
          <cos-icon name="trash-filled" [size]="24" color="white"></cos-icon>
          <span translate="COMPONENTS.TOPICBOX.BTN_REMOVE_FROM_GROUP"></span>
        </button>
      </div>
    }

    <a
      class="topic"
      [class.moderated]="topic().report"
      [class.disabled]="removable()"
      [routerLink]="topicLink()"
    >
      <!-- Moderation overlay -->
      @if (topic().report) {
        <div class="moderated_topic">
          <div class="notification">
            <div>
              <cos-icon name="warning-filled" [size]="40" color="#F39129"></cos-icon>
            </div>
            <div class="notification_title" translate="COMPONENTS.TOPICBOX.NOTIFICATION_TITLE"></div>
          </div>
        </div>
      }

      <!-- Status header -->
      <div
        class="topic_header"
        [class.draft]="topic().status === 'draft'"
        [class.discussion]="topic().status === 'inProgress'"
        [class.voting]="topic().status === 'voting'"
        [class.follow_up]="topic().status === 'followUp'"
        [class.ideation]="topic().status === 'ideation'"
        [class.closed]="topic().status === 'closed'"
      >
        <div class="progress" [style.width.%]="progressWidth()">
          <div class="header_content">
            @switch (topic().status) {
              @case ('draft') {
                <cos-icon name="status-draft" [size]="16"></cos-icon>
                <div class="bold" [translate]="'COMPONENTS.TOPICBOX.HEADER_DRAFT'" [translateParams]="{value: topic().comments?.count || 0}"></div>
              }
              @case ('inProgress') {
                <cos-icon name="status-in-progress" [size]="16"></cos-icon>
                <div class="bold" [translate]="'COMPONENTS.TOPICBOX.HEADER_DISCUSSION'" [translateParams]="{value: topic().comments?.count || 0}"></div>
              }
              @case ('voting') {
                <cos-icon name="status-voting" [size]="16"></cos-icon>
                <div class="bold" [translate]="'COMPONENTS.TOPICBOX.HEADER_VOTING'" [translateParams]="{target: topic().members.users.count || 0, value: topic().vote?.votersCount || 0}"></div>
              }
              @case ('followUp') {
                <cos-icon name="status-follow-up-inverted" [size]="16"></cos-icon>
                <div class="bold" translate="COMPONENTS.TOPICBOX.HEADER_FOLLOW_UP" [translateParams]="{value: 0}"></div>
              }
              @case ('ideation') {
                <cos-icon name="status-voting" [size]="16"></cos-icon>
                <div class="bold" translate="COMPONENTS.TOPICBOX.HEADER_IDEATION" [translateParams]="{value: 0}"></div>
              }
              @case ('closed') {
                <cos-icon name="status-voting" [size]="16"></cos-icon>
                <div class="bold" translate="COMPONENTS.TOPICBOX.HEADER_CLOSED"></div>
              }
            }
          </div>
        </div>
      </div>

      <!-- Image -->
      <div class="image">
        <div class="image_overlay"></div>
        @if (topic().imageUrl) {
          <img [src]="topic().imageUrl" [alt]="topic().title || ''" loading="lazy">
        } @else {
          @if (['inProgress', 'voting', 'ideation', 'followUp'].includes(topic().status)) {
            <div class="no_image" [class.discussion]="topic().status === 'inProgress'" [class.voting]="topic().status === 'voting'" [class.ideation]="topic().status === 'ideation'" [class.follow_up]="topic().status === 'followUp'"></div>
          } @else {
            <div class="no_image">
              <cos-icon name="no-image" [size]="40" color="#4D5C6A"></cos-icon>
            </div>
          }
        }
      </div>

      <!-- Content -->
      <div class="topic_content">
        <svg class="svg">
          <clipPath id="topic-clip-path" clipPathUnits="objectBoundingBox">
            <path d="M0.829,0.305 C0.86,0.407,0.921,0.5,1,0.5 V0.5 C0.982,0.753,0.685,1,0.5,1 C0.309,1,0.009,0.765,0,0.5 V0.5 C0.079,0.5,0.14,0.407,0.171,0.305 C0.225,0.126,0.352,0,0.5,0 C0.648,0,0.775,0.126,0.829,0.305"/>
          </clipPath>
        </svg>
        <div class="icon_area">
          @if (topic().favourite) {
            <div class="topic_icon">
              <div class="clipped">
                <cos-icon name="favourite-filled" [size]="24" color="#2C3B47"></cos-icon>
              </div>
            </div>
          }
          @if (topic().visibility === 'private') {
            <div class="topic_icon">
              <div class="clipped">
                <cos-icon name="lock-filled" [size]="24" color="#2C3B47"></cos-icon>
              </div>
            </div>
          }
        </div>
        <div class="date">{{ topic().createdAt | date:'y-MM-dd' }}</div>
        <div class="topic_title" [innerHTML]="topic().title || ('TOPIC.NO_TITLE' | translate)"></div>
      </div>

      <!-- Footer -->
      <div class="topic_footer">
        <div class="line_separator"></div>
        <div class="data_wrap">
          <div class="participants_count">
            <cos-icon name="users-filled" [size]="16"></cos-icon>
            <span>{{ topic().members.users.count || 0 }}</span>
          </div>
          <div class="last_edit">
            <cos-icon name="status-last-edit" [size]="16"></cos-icon>
            <span>{{ topic().lastActivity | timeAgo }}</span>
          </div>
        </div>
      </div>
    </a>
  `,
  styles: [`
    :host {
      display: contents;
      position: relative;
    }

    .remove_wrap {
      position: absolute;
      z-index: 9;
      display: flex;
      width: 100%;
      height: 100%;
      align-items: center;
      justify-content: center;
      background-color: rgba(255, 255, 255, 0.5);
      border-radius: 16px;

      button {
        z-index: 99;
        gap: 8px;
        display: flex;
        align-items: center;
        padding: 12px 20px;
        background: var(--color-primary);
        color: white;
        border: none;
        border-radius: var(--radius-md);
        cursor: pointer;
        font-size: 14px;
        font-family: var(--font-family-base);
      }
    }

    .topic {
      display: flex;
      flex-direction: column;
      width: 280px;
      height: 408px;
      border-radius: 16px;
      background-color: var(--color-surfaces);
      position: relative;
      transition: box-shadow 0.3s ease-in-out;
      text-decoration: none;
      color: var(--color-text);
      flex-shrink: 0;

      &.moderated:hover .image .image_overlay { display: none; }

      &:hover {
        text-decoration: none;
        box-shadow: 0 8px 20px rgba(220, 231, 240, 0.3), 0 12px 16px rgba(50, 85, 112, 0.1);

        .image .image_overlay {
          visibility: visible;
          opacity: 0.4;
        }

        .topic_title { color: var(--color-link); }
      }
    }

    .moderated_topic {
      position: absolute;
      inset: 0;
      z-index: 5;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255,255,255,0.85);
      border-radius: 16px;

      .notification {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: 24px;
        text-align: center;
      }

      .notification_title {
        font-size: 14px;
        font-weight: 600;
        color: var(--color-text);
      }
    }

    .topic_header {
      position: relative;
      display: flex;
      border-radius: 16px 16px 0 0;
      height: 40px;
      width: 100%;
      align-items: center;
      overflow: hidden;
      background-color: var(--color-border);

      &.draft { background-color: var(--color-border); }
      &.discussion { background-color: var(--color-discussion, #5086a4); }
      &.voting { background-color: var(--color-voting-disabled, #aac7d6); }
      &.follow_up { background-color: var(--color-follow-up-disabled, #eabcd4); }
      &.ideation { background-color: var(--color-ideation-disabled, #aad6c6); }
      &.closed { background-color: var(--color-argument-info, #8fa8bb); }

      .progress {
        position: relative;
        display: flex;
        height: 40px;
        align-items: center;

        &:not([style]) { width: 100%; }
      }

      &.draft .progress { background-color: var(--color-border); width: 100%; }
      &.discussion .progress { background-color: var(--color-discussion, #5086a4); width: 100%; }
      &.voting .progress { background-color: var(--color-voting, #1e6890); }
      &.follow_up .progress { background-color: var(--color-follow-up, #c8619a); }
      &.ideation .progress { background-color: var(--color-ideation, #3aaa8a); }
      &.closed .progress { background-color: var(--color-argument-info, #8fa8bb); width: 100%; }

      .header_content {
        display: flex;
        position: absolute;
        width: 280px;
        padding: 12px;
        gap: 8px;
        align-items: center;
        color: var(--color-surfaces);
        white-space: nowrap;

        .bold { font-weight: 600; font-size: 13px; }
      }

      &.draft .header_content {
        color: var(--color-text);
        svg path { fill: var(--color-text); }
      }
    }

    .image {
      display: flex;
      width: 100%;
      height: 168px;
      position: relative;

      .no_image {
        width: 100%;
        height: 100%;
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--color-border);
        background-position: center;
        background-repeat: no-repeat;
        background-size: cover;

        &.discussion { background-image: url('/assets/imgs/no_image_discussion.svg'); }
        &.voting { background-image: url('/assets/imgs/no_image_voting.svg'); }
        &.ideation { background-image: url('/assets/imgs/no_image_ideation.svg'); }
        &.follow_up { background-image: url('/assets/imgs/no_image_follow_up.svg'); }
      }

      .image_overlay {
        position: absolute;
        width: 100%;
        height: 100%;
        z-index: 9;
        background-color: rgba(17, 104, 168, 1);
        visibility: hidden;
        opacity: 0;
        transition: visibility 0s, opacity 0.2s linear;
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .topic_content {
      position: relative;
      padding: 24px 24px 0;
      color: var(--color-text);
      display: flex;
      flex-direction: column;
      gap: 8px;
      overflow: visible;

      .svg {
        position: absolute;
        width: 0;
        height: 0;
      }

      .icon_area {
        display: flex;
        align-items: flex-end;
        position: absolute;
        right: 4px;
        top: -20px;

        .topic_icon {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 56px;
          height: 40px;

          .clipped {
            width: 100%;
            height: 40px;
            background: var(--color-surfaces);
            background-size: cover;
            -webkit-clip-path: url(#topic-clip-path);
            clip-path: url(#topic-clip-path);
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
      }

      .date {
        color: var(--color-border-active);
        font-size: 13px;
        line-height: 16px;
      }

      .topic_title {
        font-size: 18px;
        font-weight: 600;
        line-height: 24px;
        max-height: 72px;
        overflow: hidden;
        text-overflow: ellipsis;
        overflow-wrap: break-word;
        -webkit-line-clamp: 3;
        display: -webkit-box;
        -webkit-box-orient: vertical;
      }
    }

    .topic_footer {
      padding: 0 24px 24px;
      color: var(--color-text);
      position: absolute;
      bottom: 0;
      width: 100%;

      .line_separator {
        width: 100%;
        height: 1px;
        background: var(--color-border);
      }

      .data_wrap {
        display: flex;
        padding: 16px 0 0;
        justify-content: space-between;

        .participants_count,
        .last_edit {
          display: flex;
          gap: 8px;
          align-items: center;
          font-size: 13px;
          line-height: 16px;
          color: var(--color-border-active);
        }
      }
    }
  `]
})
export class TopicCardComponent {
  topic = input.required<Topic>();
  removable = input<boolean>(false);
  remove = output<string>();

  private translate = inject(TranslateService);

  topicLink = computed(() => {
    const t = this.topic();
    const lang = this.translate.currentLang;
    let fragment = 'discussion';
    if (t.status === 'draft') fragment = 'info';
    else if (t.status === 'ideation') fragment = 'ideation';
    else if (t.status === 'voting') fragment = 'voting';
    else if (t.status === 'followUp') fragment = 'followUp';
    return ['/', lang, 'topics', t.id];
  });

  progressWidth = computed(() => {
    const t = this.topic();
    if (t.status === 'voting' && t.vote && t.members?.users?.count) {
      return Math.floor((t.vote.votersCount / t.members.users.count) * 100);
    }
    return 100;
  });

  removeFromGroup(event: MouseEvent) {
    event.stopPropagation();
    this.remove.emit(this.topic().id);
  }
}
