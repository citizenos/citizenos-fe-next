import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import { PublicGroupService } from '../../../core/services/public-group.service';
import { UserStore } from '../../../core/state/user.store';
import { GroupCardComponent } from '../../../shared/components/group-card/group-card.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input.component';
import { ListFilterToolbarComponent, FilterConfig } from '../../../shared/components/list-filter-toolbar/list-filter-toolbar.component';
import { ActivitiesButtonComponent } from '../../../shared/components/activities-button/activities-button.component';
import { PageListHeaderComponent } from '../../../shared/components/page-list-header/page-list-header.component';
import { countries } from '../../../core/constants/countries';
import { languages } from '../../../core/constants/all-languages';

@Component({
  selector: 'cos-public-groups',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslateModule,
    GroupCardComponent,
    PaginationComponent,
    SearchInputComponent,
    ListFilterToolbarComponent,
    ActivitiesButtonComponent,
    PageListHeaderComponent,
  ],
  template: `
    <div class="page_content">
      <app-page-list-header (searchToggle)="showSearch.update(v => !v)">
        <span title translate="VIEWS.PUBLIC_GROUPS.TITLE"></span>
        @if (isAuthenticated()) {
          <cos-activities-button activities></cos-activities-button>
        }
      </app-page-list-header>

      @if (showSearch()) {
        <div class="search_row">
          <app-search-input
            [placeholder]="'VIEWS.PUBLIC_GROUPS.PLACEHOLDER_SEARCH' | translate"
            [value]="searchValue()"
            (valueChange)="onSearch($event)"
          ></app-search-input>
        </div>
      }

      <app-list-filter-toolbar
        [filters]="filterConfigs()"
        (filterChange)="onFilterChange($event)"
      ></app-list-filter-toolbar>

      <div class="groups_grid">
        @for (group of groups(); track group.id) {
          <cos-group-card [group]="group" mode="public"></cos-group-card>
        } @empty {
          <div class="no_groups">
            <div class="no_groups_heading" translate="VIEWS.PUBLIC_GROUPS.HEADING_GET_STARTED"></div>
            <div class="no_groups_desc" translate="VIEWS.PUBLIC_GROUPS.HEADING_NO_RESUTS"></div>
          </div>
        }
      </div>

      <cos-pagination
        [page]="currentPage()"
        [totalPages]="totalPages()"
        (select)="onPageChange($event)"
      ></cos-pagination>
    </div>
  `,
  styles: [`
    .page_content {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .search_row { margin-bottom: 16px; }

    .groups_grid {
      display: flex;
      flex-wrap: wrap;
      gap: 24px;
    }

    .no_groups {
      padding: 60px 0;
      width: 100%;
      text-align: center;
    }

    .no_groups_heading {
      font-size: 20px;
      font-weight: 600;
      color: var(--color-text);
      margin-bottom: 8px;
    }

    .no_groups_desc {
      color: var(--color-text-muted);
    }
  `]
})
export class PublicGroupsComponent {
  private groupService = inject(PublicGroupService);
  private userStore = inject(UserStore);

  isAuthenticated = this.userStore.isAuthenticated;

  showSearch = signal(false);
  searchValue = signal('');
  currentPage = signal(1);

  private sortedCountries = [...countries].sort((a, b) => a.name.localeCompare(b.name));
  private sortedLanguages = [...languages].sort((a, b) => a.name.localeCompare(b.name));

  groups = toSignal(this.groupService.items$, { initialValue: [] });
  totalPages = toSignal(this.groupService.totalPages, { initialValue: 1 });

  private selectedFilters = signal<Record<string, string>>({});

  filterConfigs = computed<FilterConfig[]>(() => {
    const sel = this.selectedFilters();
    const visibilityItems: FilterConfig['items'] = [
      { title: 'VIEWS.PUBLIC_GROUPS.FILTERS.ALL', value: 'all' },
    ];
    if (this.isAuthenticated()) {
      visibilityItems.push({ title: 'VIEWS.PUBLIC_GROUPS.FILTERS.FAVOURITED', value: 'favourite' });
    }
    return [
      {
        key: 'visibility',
        placeholder: 'VIEWS.PUBLIC_GROUPS.FILTERS.VISIBILITY',
        selectedValue: sel['visibility'] ?? '',
        items: visibilityItems,
      },
      {
        key: 'orderBy',
        placeholder: 'VIEWS.PUBLIC_GROUPS.FILTERS.ORDER',
        selectedValue: sel['orderBy'] ?? '',
        items: [
          { title: 'VIEWS.PUBLIC_GROUPS.FILTERS.ALL', value: 'all' },
          { title: 'VIEWS.PUBLIC_GROUPS.FILTERS.ORDER_RECENT_ACTIVITY', value: 'activity' },
          { title: 'VIEWS.PUBLIC_GROUPS.FILTERS.MOST_ACTIVITIES', value: 'activityCount' },
          { title: 'VIEWS.PUBLIC_GROUPS.FILTERS.MOST_PARTICIPANTS', value: 'memberCount' },
          { title: 'VIEWS.PUBLIC_GROUPS.FILTERS.MOST_RECENT', value: 'createdAt' },
          { title: 'VIEWS.PUBLIC_GROUPS.FILTERS.MOST_TOPICS', value: 'topicCount' },
        ],
      },
      {
        key: 'country',
        placeholder: 'VIEWS.PUBLIC_GROUPS.FILTERS.COUNTRY',
        selectedValue: sel['country'] ?? '',
        items: [
          { title: 'VIEWS.PUBLIC_GROUPS.FILTERS.ALL', value: 'all' },
          ...this.sortedCountries.map(c => ({ title: c.name, value: c.name })),
        ],
      },
      {
        key: 'language',
        placeholder: 'VIEWS.PUBLIC_GROUPS.FILTERS.LANGUAGE',
        selectedValue: sel['language'] ?? '',
        items: [
          { title: 'VIEWS.PUBLIC_GROUPS.FILTERS.ALL', value: 'all' },
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
}
