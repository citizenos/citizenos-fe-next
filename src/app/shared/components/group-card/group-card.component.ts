import { Component, ChangeDetectionStrategy, input, inject, computed, output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { Group } from '../../../core/interfaces/group';
import { InitialsComponent } from '../initials/initials.component';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'cos-group-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslateModule, InitialsComponent, DatePipe, IconComponent],
  template: `
    <a class="group" [class]="mode()" (click)="viewGroup()">
      <div class="group_header">
        <div class="image_area">
          @if (group().imageUrl) {
            <div class="group_icon"><img [src]="group().imageUrl" /></div>
          } @else if (group().name) {
            <div class="initial_wrap">
              <cos-initials [name]="group().name" [limit]="1"></cos-initials>
            </div>
          }
        </div>
        <div class="info_area">
          @if (group().visibility === 'private') {
            <div class="item">
              <cos-icon name="lock-legacy" [size]="24"></cos-icon>
            </div>
          }
          @if (group().favourite) {
            <div class="item favourite">
              <cos-icon name="star-filled" [size]="24"></cos-icon>
            </div>
          }
          <div class="item counts">
            <cos-icon name="users-filled" [size]="16"></cos-icon>
            <span class="members_count_text">{{ group().members?.users?.count || 1 }}</span>
          </div>
        </div>
      </div>

      @if (mode() === 'public') {
        <div class="group_content">
          <div class="group_title bold">{{ group().name }}</div>
          <div class="group_description">{{ group().description }}</div>
        </div>

        <div class="group_info_area">
          <div class="info_item">
            <cos-icon name="status-in-progress" [size]="16" color="#1168A8"></cos-icon>
            <div class="info_number bold">{{ group().members?.topics?.count?.inProgress || 0 }}</div>
          </div>
          <div class="info_item">
            <cos-icon name="status-ideation" [size]="16" color="#E4B722"></cos-icon>
            <div class="info_number bold">{{ group().members?.topics?.count?.ideation || 0 }}</div>
          </div>
          <div class="info_item">
            <cos-icon name="status-voting" [size]="16" color="#5AB467"></cos-icon>
            <div class="info_number bold">{{ group().members?.topics?.count?.voting || 0 }}</div>
          </div>
          <div class="info_item">
            <cos-icon name="status-follow-up" [size]="16" color="#DA7AB1"></cos-icon>
            <div class="info_number bold">{{ group().members?.topics?.count?.followUp || 0 }}</div>
          </div>
        </div>

        <button class="btn_big_secondary" [routerLink]="['/', translate.currentLang, 'groups', group().id]">{{ 'VIEWS.PUBLIC_GROUPS.BTN_VIEW_GROUP' | translate }}</button>
      } @else {
        <div class="group_title bold">{{ group().name }}</div>
        <div class="group_footer">
          <div class="group_description">
            @if (latestTopic(); as topic) {
              <a [routerLink]="['/', translate.currentLang, 'topics', topic.id]" (click)="$event.stopPropagation()" class="bold">
                {{ topic.title }}
              </a>
            } @else {
              {{ 'VIEWS.MY_GROUPS.LBL_NO_TOPICS' | translate }}
            }
          </div>
          <div class="date">{{ group().createdAt | date: 'y-MM-dd HH:mm' }}</div>
        </div>
      }
    </a>
  `,
  styles: [`
    :host { display: contents; }

    .group {
      display: flex;
      flex-direction: column;
      width: 280px;
      background-color: var(--color-surfaces);
      border-radius: 16px;
      padding: 16px;
      gap: 8px;
      position: relative;
      transition: box-shadow 0.3s ease-in-out;
      text-decoration: none;
      color: var(--color-text);
      cursor: pointer;

      &.public { height: 360px; }
      &.member { height: 224px; }

      &:hover {
        box-shadow: 0px 8px 20px 0px rgba(220, 231, 240, 0.30), 0px 12px 16px 0px rgba(50, 85, 112, 0.10);
        .group_title { color: var(--color-link); }
      }

      @media (max-width: 768px) {
        width: 100%;
        min-width: 280px;
      }
    }

    .group_header {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      color: var(--color-text);

      .image_area {
        display: flex;
        align-items: center;
        .initial_wrap, .group_icon {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 56px;
          height: 56px;
          border-radius: 56px;
          background-color: var(--color-surface-contrast);
          overflow: hidden;
        }
        img {
          width: 56px;
          height: 56px;
          border-radius: 56px;
          aspect-ratio: 1;
          object-fit: cover;
        }
      }

      .info_area {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        .item {
          display: flex;
          gap: 8px;
          height: 32px;
          min-width: 32px;
          align-items: center;
          justify-content: center;
          padding: 4px;
          background-color: var(--color-surface-contrast);
          border-radius: 8px;
          color: var(--color-text);

          &.favourite { color: var(--color-warning); }
          .members_count_text { color: var(--color-text-muted); font-weight: 600; font-size: 13px; }
        }
      }
    }

    .group_content {
      display: flex;
      flex-direction: column;
      color: var(--color-text);
      height: 120px;
      padding-right: 16px;
      gap: 16px;
      overflow: hidden;

      .group_description {
        color: var(--color-text-muted);
        font-size: 14px;
        line-height: 20px;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }

    .group_title {
      font-size: 18px;
      font-weight: 600;
      line-height: 24px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      &.bold { font-weight: 600; }
    }

    .group_info_area {
      display: flex;
      flex-direction: row;
      gap: 16px;
      justify-content: space-between;
      padding: 8px 0;

      .info_item {
        display: flex;
        flex-direction: column;
        gap: 8px;
        align-items: center;
        justify-content: center;
        background-color: var(--color-surface-contrast);
        border-radius: 8px;
        width: 72px;
        height: 56px;

        .info_number.bold { color: var(--color-text); font-weight: 600; }
      }
    }

    .group_footer {
      display: flex;
      height: 100%;
      flex-direction: column;
      justify-content: space-between;
      width: 100%;
      gap: 8px;
      border-top: 1px solid var(--color-border);
      padding-top: 16px;

      .group_description {
        display: flex;
        align-items: center;
        overflow: hidden;
        a {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: var(--color-link);
          font-weight: 600;
        }
      }
      .date { font-size: 12px; color: var(--color-text-muted); }
    }

    .btn_big_secondary {
      width: 100%;
      justify-content: center;
    }
  `]
})
export class GroupCardComponent {
  group = input.required<Group>();
  mode = input<'public' | 'member'>('member');
  onJoin = output<Group>();

  router = inject(Router);
  translate = inject(TranslateService);

  latestTopic = computed(() => {
    return this.group().members?.topics?.latest || null;
  });

  viewGroup() {
    this.router.navigate(['/', this.translate.currentLang, 'groups', this.group().id]);
  }
}
