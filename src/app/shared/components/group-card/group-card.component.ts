import { Component, ChangeDetectionStrategy, input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Group } from '../../../core/interfaces/group';

@Component({
  selector: 'cos-group-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <a class="group_card" [routerLink]="['/', translate.currentLang, 'groups', group().id]">
      <div class="group_image" [style.background-image]="group().imageUrl ? 'url(' + group().imageUrl + ')' : ''"></div>
      <div class="group_body">
        <div class="group_name">{{ group().name }}</div>
        <div class="group_visibility">{{ group().visibility }}</div>
      </div>
    </a>
  `,
  styles: [`
    :host { display: contents; }
    .group_card {
      display: flex;
      flex-direction: column;
      min-width: 200px;
      max-width: 240px;
      background: var(--color-surfaces);
      border-radius: 16px;
      overflow: hidden;
      text-decoration: none;
      color: var(--color-text);
      flex-shrink: 0;
    }
    .group_image {
      width: 100%;
      height: 120px;
      background: var(--color-surface-contrast);
      background-size: cover;
      background-position: center;
    }
    .group_body {
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .group_name {
      font-weight: 600;
      font-size: 14px;
      line-height: 20px;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    .group_visibility {
      font-size: 12px;
      color: var(--color-text-muted);
      text-transform: capitalize;
    }
  `]
})
export class GroupCardComponent {
  group = input.required<Group>();
  translate = inject(TranslateService);
}
