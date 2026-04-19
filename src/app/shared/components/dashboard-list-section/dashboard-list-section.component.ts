import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { IconComponent } from '../icon/icon.component';

export type DashboardListSectionMobileButtonClass = 'btn_big_submit' | 'btn_medium_submit';

@Component({
  selector: 'cos-dashboard-list-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslateModule, IconComponent],
  template: `
    <div class="dashboard_section items_list_section">
      <div class="section_header">
        <div class="small_heading">{{ sectionTitleKey() | translate }}</div>
        <a class="view_more_link" [routerLink]="viewAllLink()">
          <span>{{ viewAllLabelKey() | translate }}</span>
          <cos-icon name="arrow-next" [size]="24" />
        </a>
      </div>
      <div class="section_content">
        <ng-content />
      </div>
      <button
        type="button"
        class="view_more_button"
        [class.btn_big_submit]="mobileButtonClass() === 'btn_big_submit'"
        [class.btn_medium_submit]="mobileButtonClass() === 'btn_medium_submit'"
        [routerLink]="viewAllLink()"
      >
        {{ viewAllLabelKey() | translate }}
      </button>
    </div>
  `,
  styleUrl: './dashboard-list-section.component.scss',
})
export class DashboardListSectionComponent {
  /** i18n key for the section title */
  readonly sectionTitleKey = input.required<string>();
  /** i18n key for “view all” link and mobile button label */
  readonly viewAllLabelKey = input.required<string>();
  /** RouterLink commands, e.g. `['/', translate.currentLang, 'public', 'topics']` */
  readonly viewAllLink = input.required<readonly (string | number)[]>();
  readonly mobileButtonClass = input<DashboardListSectionMobileButtonClass>('btn_big_submit');
}
