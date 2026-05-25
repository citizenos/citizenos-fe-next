import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import { PublicTopicService } from '../../../core/services/public-topic.service';
import { TopicCardComponent } from '../../../shared/components/topic-card/topic-card.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { ListFilterToolbarComponent, FilterConfig } from '../../../shared/components/list-filter-toolbar/list-filter-toolbar.component';
import { ActivitiesButtonComponent } from '../../../shared/components/activities-button/activities-button.component';
import { PageListHeaderComponent } from '../../../shared/components/page-list-header/page-list-header.component';
import { TOPIC_STATUSES, TOPIC_CATEGORIES } from '../../../core/constants/topic.constants';
import { SeoService } from '../../../core/services/seo.service';
import { countries } from '../../../core/constants/countries';
import { languages } from '../../../core/constants/all-languages';

@Component({
  selector: 'cos-public-topics',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslateModule,
    TopicCardComponent,
    PaginationComponent,
    ListFilterToolbarComponent,
    ActivitiesButtonComponent,
    PageListHeaderComponent,
  ],
  template: `
    <div class="page_content">
      <app-page-list-header>
        <span title translate="VIEWS.PUBLIC_TOPICS.HEADING_TOPICS"></span>
        <cos-activities-button activities></cos-activities-button>
      </app-page-list-header>

      <app-list-filter-toolbar
        [filters]="filterConfigs()"
        [filtersExtra]="filterExtraConfigs()"
        [searchPlaceholder]="'COMPONENTS.PUBLIC_TOPICS.PLACEHOLDER_SEARCH_TOPIC' | translate"
        [searchValue]="searchValue()"
        (filterChange)="onFilterChange($event)"
        (searchChange)="onSearch($event)"
      ></app-list-filter-toolbar>

      <div class="topics_grid">
        @for (topic of topics(); track topic.id) {
          <cos-topic-card [topic]="topic"></cos-topic-card>
        } @empty {
          <div class="no_topics">
            <div class="no_topics_heading" translate="COMPONENTS.PUBLIC_TOPICS.TEXT_TOPICS_NONE"></div>
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
    .topics_grid {
      display: flex;
      flex-wrap: wrap;
      gap: 24px;
    }

    .no_topics {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 24px;
      padding: 60px 0;
      width: 100%;
    }

    .no_topics_heading {
      font-size: 20px;
      font-weight: 600;
      color: var(--color-text);
      text-align: center;
    }
  `]
})
export class PublicTopicsComponent {
  private topicService = inject(PublicTopicService);
  private seoService = inject(SeoService);

  private sortedCountries = [...countries].sort((a, b) => a.name.localeCompare(b.name));
  private sortedLanguages = [...languages].sort((a, b) => a.name.localeCompare(b.name));

  constructor() {
    this.seoService.setPageTitle('COMPONENTS.PUBLIC_TOPICS.HEADER');
  }

  searchValue = signal('');
  currentPage = signal(1);

  topics = toSignal(this.topicService.items$, { initialValue: [] });
  totalPages = toSignal(this.topicService.totalPages, { initialValue: 1 });

  private selectedFilters = signal<Record<string, string>>({});

  filterConfigs = computed<FilterConfig[]>(() => {
    const sel = this.selectedFilters();
    return [
      {
        key: 'status',
        placeholder: 'COMPONENTS.PUBLIC_TOPICS.FILTER_STATUS',
        selectedValue: sel['status'] ?? '',
        items: [
          { title: 'TXT_TOPIC_STATUS_ALL', value: 'all' },
          { title: 'COMPONENTS.PUBLIC_TOPICS.FILTER_TOPICS_MODERATED', value: 'showModerated' },
          ...Object.keys(TOPIC_STATUSES).map(s => ({ title: `TXT_TOPIC_STATUS_${s}`, value: s })),
        ],
      },
      {
        key: 'category',
        placeholder: 'COMPONENTS.PUBLIC_TOPICS.FILTER_CATEGORIES',
        selectedValue: sel['category'] ?? '',
        items: [
          { title: 'TXT_TOPIC_CATEGORY_ALL', value: 'all' },
          ...Object.keys(TOPIC_CATEGORIES).map(c => ({ title: `TXT_TOPIC_CATEGORY_${c}`, value: c })),
        ],
      },
      {
        key: 'orderBy',
        placeholder: 'VIEWS.MY_TOPICS.FILTER_ORDER',
        selectedValue: sel['orderBy'] ?? '',
        items: [
          { title: 'VIEWS.MY_TOPICS.FILTER_ALL', value: 'all' },
          { title: 'VIEWS.MY_TOPICS.FILTERS.ORDER_MOST_PARTICIPANTS', value: 'membersCount' },
          { title: 'VIEWS.MY_TOPICS.FILTERS.ORDER_MOST_RECENT', value: 'created' },
        ],
      },
    ];
  });

  filterExtraConfigs = computed<FilterConfig[]>(() => {
    const sel = this.selectedFilters();
    return [
      {
        key: 'country',
        placeholder: 'COMPONENTS.PUBLIC_TOPICS.FILTER_COUNTRY',
        selectedValue: sel['country'] ?? '',
        items: [
          { title: 'VIEWS.MY_TOPICS.FILTER_ALL', value: 'all' },
          ...this.sortedCountries.map(c => ({ title: c.name, value: c.name })),
        ],
      },
      {
        key: 'language',
        placeholder: 'COMPONENTS.PUBLIC_TOPICS.FILTER_LANGUAGE',
        selectedValue: sel['language'] ?? '',
        items: [
          { title: 'VIEWS.MY_TOPICS.FILTER_ALL', value: 'all' },
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
    this.topicService.reset();
    const f = this.selectedFilters();

    if (f['status'] === 'showModerated') {
      this.topicService.setParam('showModerated', 'showModerated');
    } else if (f['status']) {
      this.topicService.setParam('statuses', [f['status']]);
    }

    if (f['category']) this.topicService.setParam('categories', [f['category']]);
    if (f['country']) this.topicService.setParam('country', f['country']);
    if (f['language']) this.topicService.setParam('language', f['language']);
    if (f['orderBy']) {
      this.topicService.setParam('orderBy', f['orderBy']);
      this.topicService.setParam('order', 'desc');
    }
    if (this.searchValue()) this.topicService.setParam('search', this.searchValue());
  }

  onSearch(value: string) {
    this.searchValue.set(value);
    this.topicService.setParam('search', value || null);
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.topicService.loadPage(page);
  }
}
