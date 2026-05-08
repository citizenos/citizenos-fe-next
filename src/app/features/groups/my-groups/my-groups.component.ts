import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UserGroupService } from '../../../core/services/user-group.service';
import { GroupCardComponent } from '../../../shared/components/group-card/group-card.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { ListFilterToolbarComponent, FilterConfig } from '../../../shared/components/list-filter-toolbar/list-filter-toolbar.component';
import { ActivitiesButtonComponent } from '../../../shared/components/activities-button/activities-button.component';
import { CreateMenuComponent } from '../../../shared/components/create-menu/create-menu.component';
import { PageListHeaderComponent } from '../../../shared/components/page-list-header/page-list-header.component';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { UserStore } from '../../../core/state/user.store';
import { countries } from '../../../core/constants/countries';
import { languages } from '../../../core/constants/all-languages';
import { SeoService } from '../../../core/services/seo.service';

@Component({
  selector: 'cos-my-groups',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    TranslateModule,
    GroupCardComponent,
    PaginationComponent,
    ListFilterToolbarComponent,
    ActivitiesButtonComponent,
    CreateMenuComponent,
    PageListHeaderComponent,
    IconComponent,
  ],
  template: `
    <div class="page_content">
      <app-page-list-header>
        <span title>{{ 'VIEWS.MY_GROUPS.HEADER' | translate }}</span>
        <div activities class="header_actions">
          <cos-activities-button></cos-activities-button>
          <button type="button" class="btn_medium_submit" (click)="toggleCreate()" [class.active]="showCreate()" [attr.aria-expanded]="showCreate()" [attr.aria-label]="'VIEWS.MY_GROUPS.HAVENT_ENGAGED_BTN_CREATE' | translate">
            <cos-icon name="plus" [size]="24"></cos-icon>
            <span>{{ 'VIEWS.MY_GROUPS.HAVENT_ENGAGED_BTN_CREATE' | translate }}</span>
          </button>
        </div>
      </app-page-list-header>

      <div id="create_menu_wrap" [class.hidden]="!showCreate()">
        <cos-create-menu (closeMenu)="showCreate.set(false)"></cos-create-menu>
        <div id="close_create" (click)="showCreate.set(false)" (keydown.enter)="showCreate.set(false)" role="button" tabindex="0" [attr.aria-label]="'CONTROL.CLOSE' | translate"></div>
      </div>

      <app-list-filter-toolbar
        [filters]="filterConfigs()"
        [filtersExtra]="filterExtraConfigs()"
        [searchPlaceholder]="'VIEWS.MY_GROUPS.PLACEHOLDER_SEARCH' | translate"
        [searchValue]="searchValue()"
        (filterChange)="onFilterChange($event)"
        (searchChange)="onSearch($event)"
      ></app-list-filter-toolbar>

      <div class="groups_grid">
        @for (group of groups(); track group.id) {
          <cos-group-card [group]="group" mode="member"></cos-group-card>
        } @empty {
          <div class="no_groups">
            <div class="no_groups_heading">{{ 'VIEWS.MY_GROUPS.HAVENT_ENGAGED_GROUPS_HEADING' | translate }}</div>
            <div class="no_groups_desc">{{ 'VIEWS.MY_GROUPS.HAVENT_ENGAGED_GROUPS_DESCRIPTION' | translate }}</div>
            <div class="no_groups_actions">
              <button type="button" class="btn_medium_submit" (click)="toggleCreate()">
                <cos-icon name="plus"></cos-icon>
                <span>{{ 'VIEWS.MY_GROUPS.HAVENT_ENGAGED_BTN_CREATE' | translate }}</span>
              </button>
              <a class="btn_medium_submit"
                 [routerLink]="['/', userLang, 'public', 'groups']">
                 {{ 'VIEWS.MY_GROUPS.HAVENT_ENGAGED_BTN_VIEW_PUBLIC_GROUPS' | translate }}
              </a>
            </div>
          </div>
        }
      </div>

      <cos-pagination
        [page]="currentPage()"
        [totalPages]="totalPages()"
        (selectPage)="onPageChange($event)"
      ></cos-pagination>
    </div>
  `,
  styles: [`
    .groups_grid {
      display: flex;
      flex-wrap: wrap;
      gap: 24px;
    }

    .no_groups {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 24px;
      padding: 60px 0;
      width: 100%;
    }

    .no_groups_heading {
      font-size: 20px;
      font-weight: 600;
      color: var(--color-text);
      text-align: center;
    }

    .no_groups_actions {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      justify-content: center;
    }

    .no_groups_desc {
      color: var(--color-text-muted);
      text-align: center;
      max-width: 600px;
      line-height: 1.5;
    }

    .header_actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .create_btn {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    #create_menu_wrap {
      position: absolute;
      right: 24px;
      top: 80px;
      z-index: 1000;
      filter: drop-shadow(0px 4px 20px rgba(0, 0, 0, 0.15));
    }

    #create_menu_wrap.hidden {
      display: none;
    }

    #close_create {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: -1;
    }
  `]
})
export class MyGroupsComponent {
  private groupService = inject(UserGroupService);
  private userStore = inject(UserStore);
  private translate = inject(TranslateService);
  private seoService = inject(SeoService);

  constructor() {
    this.seoService.setPageTitle('VIEWS.MY_GROUPS.HEADER');
  }

  get userLang() { return this.translate.currentLang; }

  private sortedCountries = [...countries].sort((a, b) => a.name.localeCompare(b.name));
  private sortedLanguages = [...languages].sort((a, b) => a.name.localeCompare(b.name));

  showCreate = signal(false);
  searchValue = signal('');
  currentPage = signal(1);

  groups = toSignal(this.groupService.items$, { initialValue: [] });
  totalPages = toSignal(this.groupService.totalPages, { initialValue: 1 });

  private selectedFilters = signal<Record<string, string>>({});

  filterConfigs = computed<FilterConfig[]>(() => {
    const sel = this.selectedFilters();
    return [
      {
        key: 'visibility',
        placeholder: 'VIEWS.MY_GROUPS.FILTER_VISIBILITY',
        selectedValue: sel['visibility'] ?? '',
        items: [
          { title: 'VIEWS.MY_GROUPS.FILTER_ALL', value: 'all' },
          { title: 'TXT_GROUP_VISIBILITY_PUBLIC', value: 'public' },
          { title: 'TXT_GROUP_VISIBILITY_PRIVATE', value: 'private' },
          { title: 'VIEWS.MY_GROUPS.FILTER_FAVOURITED', value: 'favourite' },
        ],
      },
      {
        key: 'engagement',
        placeholder: 'VIEWS.MY_GROUPS.FILTER_MY_ENGAGEMENT',
        selectedValue: sel['engagement'] ?? '',
        items: [
          { title: 'VIEWS.MY_GROUPS.FILTER_ALL', value: 'all' },
          { title: 'VIEWS.MY_GROUPS.FILTER_GROUPS_I_CREATED', value: 'iCreated' },
        ],
      },
      {
        key: 'orderBy',
        placeholder: 'VIEWS.MY_GROUPS.FILTER_ORDER',
        selectedValue: sel['orderBy'] ?? '',
        items: [
          { title: 'VIEWS.MY_GROUPS.ORDER_ALL', value: 'all' },
          { title: 'VIEWS.MY_GROUPS.ORDER_RECENT_ACTIVITY', value: 'activity' },
          { title: 'VIEWS.MY_GROUPS.MOST_ACTIVITIES', value: 'activityCount' },
          { title: 'VIEWS.MY_GROUPS.MOST_PARTICIPANTS', value: 'memberCount' },
          { title: 'VIEWS.MY_GROUPS.MOST_RECENT', value: 'createdAt' },
          { title: 'VIEWS.MY_GROUPS.MOST_TOPICS', value: 'topicCount' },
        ],
      }
    ];
  });

  filterExtraConfigs = computed<FilterConfig[]>(() => {
    const sel = this.selectedFilters();
    return [
      {
        key: 'country',
        placeholder: 'VIEWS.MY_GROUPS.FILTER_COUNTRY',
        selectedValue: sel['country'] ?? '',
        items: [
          { title: 'VIEWS.MY_GROUPS.FILTER_ALL', value: 'all' },
          ...this.sortedCountries.map(c => ({ title: c.name, value: c.name })),
        ],
      },
      {
        key: 'language',
        placeholder: 'VIEWS.MY_GROUPS.FILTER_LANGUAGE',
        selectedValue: sel['language'] ?? '',
        items: [
          { title: 'VIEWS.MY_GROUPS.FILTER_ALL', value: 'all' },
          ...this.sortedLanguages.map(l => ({ title: l.name, value: l.name })),
        ],
      },
    ];
  });

  onFilterChange(event: { key: string; value: string }) {
    const val = event.value === 'all' ? '' : event.value;
    this.selectedFilters.update(f => ({ ...f, [event.key]: val }));
    this.applyFilters();
  }

  private applyFilters() {
    this.groupService.reset();
    const f = this.selectedFilters();

    if (f['visibility'] === 'favourite') {
      this.groupService.setParam('favourite' as any, true);
    } else if (f['visibility']) {
      this.groupService.setParam('visibility' as any, f['visibility']);
    }

    if (f['engagement'] === 'iCreated') {
      const user = this.userStore.user();
      if (user?.id) {
        this.groupService.setParam('creatorId' as any, user.id);
      }
    }

    if (f['orderBy']) {
      this.groupService.setParam('orderBy', f['orderBy']);
      this.groupService.setParam('order', 'desc');
    }

    if (f['country']) this.groupService.setParam('country' as any, f['country']);
    if (f['language']) this.groupService.setParam('language' as any, f['language']);
    if (this.searchValue()) this.groupService.setParam('search', this.searchValue());
  }

  onSearch(value: string) {
    this.searchValue.set(value);
    this.groupService.setParam('search', value || null);
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.groupService.loadPage(page);
  }

  toggleCreate() {
    this.showCreate.update(v => !v);
  }
}
