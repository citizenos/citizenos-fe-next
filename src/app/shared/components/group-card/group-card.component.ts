import { Component, ChangeDetectionStrategy, input, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
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
    <a class="group_card" [routerLink]="['/', translate.currentLang, 'groups', group().id]">
      <div class="group_header">
        <div class="header_icons">
          @if (group().visibility === 'private') {
            <div class="icon_item">
              <cos-icon name="lock" [size]="20"></cos-icon>
            </div>
          }
          @if (group().favourite) {
            <div class="icon_item favourite">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 3L14.645 8.35942L20.5595 9.21885L16.2798 13.3906L17.2901 19.2812L12 16.5L6.70993 19.2812L7.72025 13.3906L3.44049 9.21885L9.35497 8.35942L12 3Z" fill="currentColor"/>
              </svg>
            </div>
          }
          <div class="icon_item counts">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M8.00002 8.00016C9.84097 8.00016 11.3334 6.50778 11.3334 4.66683C11.3334 2.82588 9.84097 1.3335 8.00002 1.3335C6.15907 1.3335 4.66669 2.82588 4.66669 4.66683C4.66669 6.50778 6.15907 8.00016 8.00002 8.00016Z" fill="currentColor"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M4 11.63C4 9.99356 5.19391 8.66699 6.66667 8.66699H9.33333C10.8061 8.66699 12 9.99356 12 11.63V15.3337H4V11.63Z" fill="currentColor"/>
            </svg>
            <span>{{ group().members?.users?.count || 1 }}</span>
          </div>
        </div>
      </div>

      <div class="group_image_area">
        @if (group().imageUrl) {
          <div class="group_image" [style.background-image]="'url(' + group().imageUrl + ')'"></div>
        } @else {
          <div class="group_initials">
            <cos-initials [name]="group().name" [limit]="1"></cos-initials>
          </div>
        }
      </div>

      <div class="group_body">
        <div class="group_name">{{ group().name }}</div>
        <div class="group_description">
          @if (latestTopic(); as topic) {
            <a class="latest_topic" [routerLink]="['/', translate.currentLang, 'topics', topic.id]" (click)="$event.stopPropagation()">
              {{ topic.title }}
            </a>
          } @else {
            {{ group().description }}
          }
        </div>
      </div>

      <div class="group_footer">
        <div class="group_visibility" [translate]="'TXT_GROUP_VISIBILITY_' + group().visibility.toUpperCase()"></div>
        <div class="group_date">{{ group().createdAt | date: 'y-MM-dd HH:mm' }}</div>
      </div>
    </a>
  `,
  styles: [`
    :host { display: contents; }
    .group_card {
      display: flex;
      flex-direction: column;
      width: 280px;
      height: 380px;
      background: var(--color-surfaces);
      border-radius: 16px;
      overflow: hidden;
      text-decoration: none;
      color: var(--color-text);
      flex-shrink: 0;
      transition: box-shadow 0.3s ease-in-out;
      border: 1px solid var(--color-border);

      &:hover {
        box-shadow: 0 8px 20px rgba(220, 231, 240, 0.3), 0 12px 16px rgba(50, 85, 112, 0.1);
        .group_name { color: var(--color-link); }
      }
    }

    .group_header {
      height: 48px;
      display: flex;
      align-items: center;
      padding: 0 16px;
      background: var(--color-surface-contrast);
      color: var(--color-text);
    }

    .header_icons {
      display: flex;
      gap: 12px;
      align-items: center;
      width: 100%;
    }

    .icon_item {
      display: flex;
      align-items: center;
      gap: 4px;
      color: var(--color-text-muted);

      &.favourite { color: var(--color-warning); }
      &.counts { margin-left: auto; font-size: 13px; font-weight: 600; }
    }

    .group_image_area {
      height: 140px;
      width: 100%;
      background: var(--color-border);
      position: relative;
    }

    .group_image {
      width: 100%;
      height: 100%;
      background-size: cover;
      background-position: center;
    }

    .group_initials {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      
      cos-initials {
        width: 80px;
        height: 80px;
        font-size: 32px;
      }
    }

    .group_body {
      padding: 16px 20px;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
      overflow: hidden;
    }

    .group_name {
      font-weight: 600;
      font-size: 18px;
      line-height: 24px;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .group_description {
      font-size: 14px;
      line-height: 20px;
      color: var(--color-text-muted);
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
    }

    .latest_topic {
      color: var(--color-link);
      text-decoration: none;
      font-weight: 500;
      &:hover { text-decoration: underline; }
    }

    .group_footer {
      padding: 12px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid var(--color-border);
      background: var(--color-surface-contrast);
    }

    .group_visibility {
      font-size: 12px;
      font-weight: 600;
      color: var(--color-text-muted);
      text-transform: uppercase;
    }

    .group_date {
      font-size: 12px;
      color: var(--color-text-muted);
    }
  `]
})
export class GroupCardComponent {
  group = input.required<Group>();
  translate = inject(TranslateService);

  latestTopic = computed(() => {
    return this.group().members?.topics?.latest || null;
  });
}
