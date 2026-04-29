import { Component, ChangeDetectionStrategy, input, inject, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { Group } from '../../../core/interfaces/group';
import { InitialsComponent } from '../initials/initials.component';
import { UserStore } from '../../../core/state/user.store';
import { GroupDetailService } from '../../../core/services/group-detail.service';

import { IconComponent } from '../icon/icon.component';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'cos-group-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslateModule, InitialsComponent, DatePipe, IconComponent, ButtonComponent],
  template: `
    <a class="group" [class]="mode()" (click)="viewGroup()" [attr.aria-label]="group().name">
      <div class="group_header">
        <div class="image_area">
          @if (group().imageUrl) {
            <div class="group_icon"><img [src]="group().imageUrl" [alt]="group().name" /></div>
          } @else if (group().name) {
            <div class="initial_wrap">
              <cos-initials [name]="group().name" [limit]="1"></cos-initials>
            </div>
          }
        </div>
        <div class="info_area">
          @if (group().visibility === 'private') {
            <div class="item">
              <cos-icon name="lock-filled" [size]="24"></cos-icon>
            </div>
          }
          @if (group().favourite) {
            <div class="item">
              <cos-icon name="star-filled" [size]="24"></cos-icon>
            </div>
          }
          <div class="item">
            <cos-icon name="users-filled" [size]="16"></cos-icon>
            <span class="members_count_text">{{ group().members?.users?.count || 1 }}</span>
          </div>
        </div>
      </div>

      @if (mode() === 'public') {
        <div class="group_content">
          <div class="group_title">{{ group().name }}</div>
          <div class="group_description">{{ group().description }}</div>
        </div>

        <div class="group_info_area">
          <div class="info_item">
            <cos-icon name="status-in-progress" [size]="16" color="#1168A8"></cos-icon>
            <span class="bold">{{ group().members?.topics?.count?.inProgress || 0 }}</span>
          </div>
          <div class="info_item">
            <cos-icon name="status-ideation" [size]="16" color="#E4B722"></cos-icon>
            <span class="bold">{{ group().members?.topics?.count?.ideation || 0 }}</span>
          </div>
          <div class="info_item">
            <cos-icon name="status-voting" [size]="16" color="#5AB467"></cos-icon>
            <span class="bold">{{ group().members?.topics?.count?.voting || 0 }}</span>
          </div>
          <div class="info_item">
            <cos-icon name="status-follow-up" [size]="16" color="#DA7AB1"></cos-icon>
            <span class="bold">{{ group().members?.topics?.count?.followUp || 0 }}</span>
          </div>
        </div>

        @if (!group().userLevel) {
          <cos-button variant="secondary" size="md" (clicked)="joinGroup(); $event.stopPropagation()">
            {{ 'VIEWS.PUBLIC_GROUPS.BTN_JOIN_GROUP' | translate }}
          </cos-button>
        } @else {
          <cos-button variant="secondary" size="md" (clicked)="viewGroup()">
            {{ 'VIEWS.PUBLIC_GROUPS.BTN_VIEW_GROUP' | translate }}
          </cos-button>
        }
      } @else {
        <div class="group_title">
          <div class="small_heading">{{ group().name }}</div>
        </div>
        <div class="group_footer">
          <div class="group_description">
            @if (latestTopic(); as topic) {
              <a [routerLink]="['/', translate.currentLang, 'topics', topic.id]" (click)="$event.stopPropagation()" class="bold">
                {{ topic.title }}
              </a>
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
        text-decoration: none;
        .group_title { color: var(--color-link); }
      }

      path { fill: var(--color-text); }

      @media (min-width: 768px) and (max-width: 1023px) {
        &.member { width: 232px; }
      }

      @media (max-width: 767px) {
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
        align-items: top;
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

          .members_count_text { color: var(--color-border-active); font-weight: 600; font-size: 13px; }
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

      .group_title {
        font-size: 18px;
        font-style: normal;
        font-weight: 600;
        line-height: 24px;
      }

      .group_description {
        display: flex;
        color: var(--color-border-active);
        overflow: hidden;
        font-size: 14px;
        line-height: 20px;
      }
    }

    .group_title {
      display: flex;
      height: 48px;
      color: var(--color-text);
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

        .bold { color: var(--color-border-active); }
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

      .group_description {
        display: flex;
        align-items: center;
        padding: 16px 0 0 0;

        a {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
      .date { font-size: 12px; color: var(--color-text-muted); }
    }
  `]
})
export class GroupCardComponent {
  group = input.required<Group>();
  mode = input<'public' | 'member'>('member');

  private router = inject(Router);
  translate = inject(TranslateService);
  private userStore = inject(UserStore);
  private groupDetailService = inject(GroupDetailService);

  latestTopic = computed(() => {
    return this.group().members?.topics?.latest || null;
  });

  viewGroup() {
    this.router.navigate(['/', this.translate.currentLang, 'groups', this.group().id]);
  }

  joinGroup() {
    if (!this.userStore.isAuthenticated()) {
      const urlPath = [this.translate.currentLang, 'groups', this.group().id];
      const tree = this.router.createUrlTree(urlPath);
      const redirectSuccess = window.location.origin + this.router.serializeUrl(tree);
      this.router.navigate(['/', this.translate.currentLang, 'account', 'login'], { queryParams: { redirectSuccess } });
    } else {
      const group = this.group();
      if (group.join?.token && this.groupDetailService.canShare(group)) {
        this.router.navigate(['/', this.translate.currentLang, 'groups', 'join', group.join.token]);
      } else {
        this.router.navigate(['/', this.translate.currentLang, 'groups', group.id, 'join']);
      }
    }
  }
}
