import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import { UserTopicService } from '../../../core/services/user-topic.service';
import { TopicCardComponent } from '../../../shared/components/topic-card/topic-card.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { ListFilterToolbarComponent, FilterConfig } from '../../../shared/components/list-filter-toolbar/list-filter-toolbar.component';
import { ActivitiesButtonComponent } from '../../../shared/components/activities-button/activities-button.component';
import { CreateMenuComponent } from '../../../shared/components/create-menu/create-menu.component';
import { PageListHeaderComponent } from '../../../shared/components/page-list-header/page-list-header.component';
import { TOPIC_STATUSES, TOPIC_CATEGORIES } from '../../../core/constants/topic.constants';
import { SeoService } from '../../../core/services/seo.service';

@Component({
  selector: 'cos-my-topics',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslateModule,
    TopicCardComponent,
    PaginationComponent,
    ListFilterToolbarComponent,
    ActivitiesButtonComponent,
    CreateMenuComponent,
    PageListHeaderComponent,
  ],
  template: `
    <div class="page_content">
      <app-page-list-header>
        <span title translate="VIEWS.MY_TOPICS.HEADER"></span>
        <cos-activities-button activities></cos-activities-button>
      </app-page-list-header>

      <app-list-filter-toolbar
        [filters]="filterConfigs()"
        [searchPlaceholder]="'VIEWS.MY_TOPICS.PLACEHOLDER_SEARCH_TOPIC' | translate"
        [searchValue]="searchValue()"
        (filterChange)="onFilterChange($event)"
        (searchChange)="onSearch($event)"
      ></app-list-filter-toolbar>

      <div class="topics_grid">
        @for (topic of topics(); track topic.id) {
          <cos-topic-card [topic]="topic"></cos-topic-card>
        } @empty {
          <div class="no_topics">
            <div class="no_topics_heading" translate="VIEWS.MY_TOPICS.HEADING_YOUR_ENGAGEMENTS_NONE"></div>
            <cos-create-menu></cos-create-menu>
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
export class MyTopicsComponent {
  private topicService = inject(UserTopicService);
  private seoService = inject(SeoService);

  constructor() {
    this.seoService.setPageTitle('VIEWS.MY_TOPICS.HEADER');
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
        key: 'visibility',
        placeholder: 'VIEWS.MY_TOPICS.FILTER_TOPIC_TYPE',
        selectedValue: sel['visibility'] ?? '',
        items: [
          { title: 'VIEWS.MY_TOPICS.FILTER_ALL', value: 'all' },
          { title: 'VIEWS.MY_TOPICS.FILTERS.MY_PUBLIC_TOPICS', value: 'public' },
          { title: 'VIEWS.MY_TOPICS.FILTERS.MY_PRIVATE_TOPICS', value: 'private' },
          { title: 'VIEWS.MY_TOPICS.FILTERS.TOPICS_MODERATED', value: 'showModerated' },
          { title: 'VIEWS.MY_TOPICS.FILTERS.TOPICS_FAVOURITED', value: 'favourite' },
        ],
      },
      {
        key: 'engagement',
        placeholder: 'VIEWS.MY_TOPICS.FILTER_MY_ENGAGEMENT',
        selectedValue: sel['engagement'] ?? '',
        items: [
          { title: 'VIEWS.MY_TOPICS.FILTER_ALL', value: 'all' },
          { title: 'VIEWS.MY_TOPICS.FILTERS.TOPICS_I_HAVE_VOTED', value: 'hasVoted' },
          { title: 'VIEWS.MY_TOPICS.FILTERS.TOPICS_I_HAVE_NOT_VOTED', value: 'hasNotVoted' },
          { title: 'VIEWS.MY_TOPICS.FILTERS.TOPICS_I_CREATED', value: 'iCreated' },
        ],
      },
      {
        key: 'status',
        placeholder: 'VIEWS.MY_TOPICS.FILTER_STATUS',
        selectedValue: sel['status'] ?? '',
        items: [
          { title: 'TXT_TOPIC_STATUS_ALL', value: 'all' },
          ...Object.keys(TOPIC_STATUSES).map(s => ({ title: `TXT_TOPIC_STATUS_${s}`, value: s })),
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
      {
        key: 'category',
        placeholder: 'VIEWS.MY_TOPICS.FILTER_CATEGORIES',
        selectedValue: sel['category'] ?? '',
        items: [
          { title: 'TXT_TOPIC_CATEGORY_ALL', value: 'all' },
          ...Object.keys(TOPIC_CATEGORIES).map(c => ({ title: `TXT_TOPIC_CATEGORY_${c}`, value: c })),
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

    if (f['visibility'] === 'showModerated') {
      this.topicService.setParam('showModerated' as any, 'showModerated');
    } else if (f['visibility'] === 'favourite') {
      this.topicService.setParam('favourite' as any, 'favourite');
    } else if (f['visibility']) {
      this.topicService.setParam('visibility' as any, f['visibility']);
    }

    if (f['engagement'] === 'hasVoted') this.topicService.setParam('hasVoted' as any, true);
    else if (f['engagement'] === 'hasNotVoted') this.topicService.setParam('hasVoted' as any, false);

    if (f['status']) this.topicService.setParam('statuses' as any, [f['status']]);
    if (f['orderBy']) {
      this.topicService.setParam('orderBy', f['orderBy']);
      this.topicService.setParam('order', 'desc');
    }
    if (f['category']) this.topicService.setParam('categories' as any, [f['category']]);
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
