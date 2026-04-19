import { Component, ChangeDetectionStrategy, ViewEncapsulation, inject, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'cos-create-menu',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="create_menu_item" [routerLink]="['/', translate.currentLang, 'topics', 'create']" [queryParams]="{phase: 'ideation'}" routerLinkActive="active" (click)="onClose.emit()">
      <div class="left_wrap">
        <div class="icon_wrap ideation">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C8.13 2 5 5.13 5 9C5 11.38 6.19 13.47 8 14.74V17C8 17.55 8.45 18 9 18H15C15.55 18 16 17.55 16 17V14.74C17.81 13.47 19 11.38 19 9C19 5.13 15.87 2 12 2ZM13 15H11V14.2C9.53 13.79 8.41 12.65 8 11.17C7.81 10.47 7.71 9.75 7.71 9C7.71 6.63 9.63 4.71 12 4.71C14.37 4.71 16.29 6.63 16.29 9C16.29 9.75 16.19 10.47 16 11.17C15.59 12.65 14.47 13.79 13 14.2V15ZM9 20H15V22H9V20Z" fill="currentColor"/>
          </svg>
        </div>
        <div class="item_text">
          <div class="item_title">{{ 'COMPONENTS.CREATE.TITLE_IDEATION' | translate }}</div>
          <div class="item_desc">{{ 'COMPONENTS.CREATE.DESC_IDEATION' | translate }}</div>
        </div>
      </div>
      <div class="icon_item icon_arrow_right">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M10 7L15 12L10 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      </div>
    </div>

    <div class="create_menu_item" [routerLink]="['/', translate.currentLang, 'topics', 'create']" [queryParams]="{phase: 'discussion'}" routerLinkActive="active" (click)="onClose.emit()">
      <div class="left_wrap">
        <div class="icon_wrap discussion">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16ZM7 9H17V11H7V9ZM7 12H14V14H7V12ZM7 6H17V8H7V6Z" fill="currentColor"/>
          </svg>
        </div>
        <div class="item_text">
          <div class="item_title">{{ 'COMPONENTS.CREATE.TITLE_DISCUSSION' | translate }}</div>
          <div class="item_desc">{{ 'COMPONENTS.CREATE.DESC_DISCUSSION' | translate }}</div>
        </div>
      </div>
      <div class="icon_item icon_arrow_right">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M10 7L15 12L10 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      </div>
    </div>

    <div class="create_menu_item" [routerLink]="['/', translate.currentLang, 'topics', 'create']" [queryParams]="{phase: 'voting'}" routerLinkActive="active" (click)="onClose.emit()">
      <div class="left_wrap">
        <div class="icon_wrap voting">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM11.06 13.58L15.35 9.29L16.76 10.7L11.06 16.41L7.53 12.88L8.94 11.47L11.06 13.58Z" fill="currentColor"/>
          </svg>
        </div>
        <div class="item_text">
          <div class="item_title">{{ 'COMPONENTS.CREATE.TITLE_VOTE' | translate }}</div>
          <div class="item_desc">{{ 'COMPONENTS.CREATE.DESC_VOTE' | translate }}</div>
        </div>
      </div>
      <div class="icon_item icon_arrow_right">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M10 7L15 12L10 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      </div>
    </div>

    <div class="line_separator"></div>

    <div class="create_menu_item" [routerLink]="['/', translate.currentLang, 'groups', 'create']" routerLinkActive="active" (click)="onClose.emit()">
      <div class="left_wrap">
        <div class="icon_wrap group">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z" fill="currentColor"/>
          </svg>
        </div>
        <div class="item_text">
          <div class="item_title">{{ 'COMPONENTS.CREATE.TITLE_GROUP' | translate }}</div>
          <div class="item_desc">{{ 'COMPONENTS.CREATE.DESC_GROUP' | translate }}</div>
        </div>
      </div>
      <div class="icon_item icon_arrow_right">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M10 7L15 12L10 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      </div>
    </div>
  `,
  styleUrls: ['./create-menu.component.scss']
})
export class CreateMenuComponent {
  translate = inject(TranslateService);
  onClose = output();
}
