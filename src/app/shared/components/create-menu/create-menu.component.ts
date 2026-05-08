import { Component, ChangeDetectionStrategy, ViewEncapsulation, inject, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { IconComponent } from '../icon/icon.component';
import { DomainIconComponent } from '../domain-icon/domain-icon.component';

@Component({
  selector: 'cos-create-menu',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslateModule, IconComponent, DomainIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="create_menu_container">
      <div class="create_menu_heading">{{ 'COMPONENTS.CREATE.HEADING' | translate }}</div>

      <div class="create_menu_item" [routerLink]="['/', translate.currentLang, 'topics', 'ideation', 'create']" routerLinkActive="active" (click)="closeMenu.emit()">
        <div class="left_wrap">
          <div class="icon_wrap">
            <cos-domain-icon type="ideation" [size]="32" />
          </div>
          <div class="item_text_wrap">
            <div class="item_title">{{ 'COMPONENTS.CREATE.TITLE_IDEATION' | translate }}</div>
            <div class="item_description">{{ 'COMPONENTS.CREATE.DESC_IDEATION' | translate }}</div>
          </div>
        </div>
        <div class="icon_item icon_arrow_right">
          <cos-icon name="chevron-right"></cos-icon>
        </div>
      </div>

      <div class="create_menu_item" [routerLink]="['/', translate.currentLang, 'topics', 'create']" routerLinkActive="active" (click)="closeMenu.emit()">
        <div class="left_wrap">
          <div class="icon_wrap">
            <cos-domain-icon type="topic" [size]="32" />
          </div>
          <div class="item_text_wrap">
            <div class="item_title">{{ 'COMPONENTS.CREATE.TITLE_DISCUSSION' | translate }}</div>
            <div class="item_description">{{ 'COMPONENTS.CREATE.DESC_DISCUSSION' | translate }}</div>
          </div>
        </div>
        <div class="icon_item icon_arrow_right">
          <cos-icon name="chevron-right"></cos-icon>
        </div>
      </div>

      <div class="create_menu_item" [routerLink]="['/', translate.currentLang, 'topics', 'vote', 'create']" routerLinkActive="active" (click)="closeMenu.emit()">
        <div class="left_wrap">
          <div class="icon_wrap">
            <cos-domain-icon type="vote" [size]="32" />
          </div>
          <div class="item_text_wrap">
            <div class="item_title">{{ 'COMPONENTS.CREATE.TITLE_VOTE' | translate }}</div>
            <div class="item_description">{{ 'COMPONENTS.CREATE.DESC_VOTE' | translate }}</div>
          </div>
        </div>
        <div class="icon_item icon_arrow_right">
          <cos-icon name="chevron-right"></cos-icon>
        </div>
      </div>

      <div class="line_separator"></div>

      <div class="create_menu_item" [routerLink]="['/', translate.currentLang, 'my', 'groups', 'create']" routerLinkActive="active" (click)="closeMenu.emit()">
        <div class="left_wrap">
          <div class="icon_wrap">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="16" fill="#D7E9F8" />
              <path fill-rule="evenodd" clip-rule="evenodd"
                d="M13.9998 16.0002C15.8408 16.0002 17.3332 14.5078 17.3332 12.6668C17.3332 10.8259 15.8408 9.3335 13.9998 9.3335C12.1589 9.3335 10.6665 10.8259 10.6665 12.6668C10.6665 14.5078 12.1589 16.0002 13.9998 16.0002Z"
                fill="#1168A8" />
              <path fill-rule="evenodd" clip-rule="evenodd"
                d="M20 12.6668C20 11.3217 18.9139 10.6668 18 10.6668V9.3335C19.4328 9.3335 21.3333 10.3853 21.3333 12.6668C21.3333 14.9484 19.4328 16.0002 18 16.0002V14.6668C18.9139 14.6668 20 14.0119 20 12.6668Z"
                fill="#1168A8" />
              <path fill-rule="evenodd" clip-rule="evenodd"
                d="M18.6665 16.6665H19.3332C20.8059 16.6665 21.9998 17.8604 21.9998 19.3332V22.6665H20.6665V19.3332C20.6665 18.5968 20.0696 17.9998 19.3332 17.9998H18.6665V16.6665Z"
                fill="#1168A8" />
              <path fill-rule="evenodd" clip-rule="evenodd"
                d="M10 19.3332C10 17.8604 11.1939 16.6665 12.6667 16.6665H15.3333C16.8061 16.6665 18 17.8604 18 19.3332V22.6665H10V19.3332Z"
                fill="#1168A8" />
            </svg>
          </div>
          <div class="item_text_wrap">
            <div class="item_title">{{ 'COMPONENTS.CREATE.TITLE_GROUP' | translate }}</div>
            <div class="item_description">{{ 'COMPONENTS.CREATE.DESC_GROUP' | translate }}</div>
          </div>
        </div>
        <div class="icon_item icon_arrow_right">
          <cos-icon name="chevron-right"></cos-icon>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./create-menu.component.scss']
})
export class CreateMenuComponent {
  translate = inject(TranslateService);
  closeMenu = output();
}
