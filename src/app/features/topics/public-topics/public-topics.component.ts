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
import { SearchInputComponent } from '../../../shared/components/search-input/search-input.component';
import { ListFilterToolbarComponent, FilterConfig } from '../../../shared/components/list-filter-toolbar/list-filter-toolbar.component';
import { ActivitiesButtonComponent } from '../../../shared/components/activities-button/activities-button.component';
import { TOPIC_STATUSES, TOPIC_CATEGORIES } from '../../../core/constants/topic.constants';

@Component({
  selector: 'cos-public-topics',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslateModule,
    TopicCardComponent,
    PaginationComponent,
    SearchInputComponent,
    ListFilterToolbarComponent,
    ActivitiesButtonComponent,
  ],
  template: `
    <div class="page_content">
      <div id="page_header">
        <div class="small_heading" translate="VIEWS.PUBLIC_TOPICS.HEADING_TOPICS"></div>
        <div class="buttons_area">
          <button class="icon_btn" (click)="showSearch.update(v => !v)" aria-label="Search">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M14.1922 15.6064C13.0236 16.4816 11.5723 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10C17 11.5723 16.4816 13.0236 15.6064 14.1922L19.7071 18.2929C20.0976 18.6834 20.0976 19.3166 19.7071 19.7071C19.3166 20.0976 18.6834 20.0976 18.2929 19.7071L14.1922 15.6064ZM15 10C15 12.7614 12.7614 15 10 15C7.23858 15 5 12.7614 5 10C5 7.23858 7.23858 5 10 5C12.7614 5 15 7.23858 15 10Z" fill="#727C84"/>
            </svg>
          </button>
          <cos-activities-button></cos-activities-button>
        </div>
      </div>

      @if (showSearch()) {
        <div class="search_row">
          <app-search-input
            [placeholder]="'COMPONENTS.PUBLIC_TOPICS.PLACEHOLDER_SEARCH_TOPIC' | translate"
            [value]="searchValue()"
            (valueChange)="onSearch($event)"
          ></app-search-input>
        </div>
      }

      <app-list-filter-toolbar
        [filters]="filterConfigs()"
        (filterChange)="onFilterChange($event)"
      ></app-list-filter-toolbar>

      <div class="topics_list">
        @if (topics().length === 0) {
          <div class="no_topics">
            <div class="no_topics_heading" translate="COMPONENTS.PUBLIC_TOPICS.TEXT_TOPICS_NONE"></div>
          </div>
        } @else {
          <div class="topics_grid">
            @for (topic of topics(); track topic.id) {
              <cos-topic-card [topic]="topic"></cos-topic-card>
            }
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

    #page_header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .small_heading {
      font-size: 24px;
      font-weight: 700;
      color: var(--color-text);
    }

    .buttons_area {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .icon_btn {
      background: transparent;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      transition: background var(--transition-fast);
      &:hover { background: var(--color-border); }
    }

    .search_row { margin-bottom: 16px; }

    .topics_list { display: flex; flex-direction: column; gap: 24px; }

    .no_topics {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 24px;
      padding: 60px 0;
    }

    .no_topics_heading {
      font-size: 20px;
      font-weight: 600;
      color: var(--color-text);
      text-align: center;
    }

    .topics_grid {
      display: flex;
      flex-wrap: wrap;
      gap: 24px;
    }
  `]
})
export class PublicTopicsComponent {
  private topicService = inject(PublicTopicService);

  showSearch = signal(false);
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

  onFilterChange(event: { key: string; value: string }) {
    const val = event.value === 'all' ? '' : event.value;
    this.selectedFilters.update(f => ({ ...f, [event.key]: val }));
    this.applyFilters();
  }

  private applyFilters() {
    this.topicService.reset();
    const f = this.selectedFilters();

    if (f['status'] === 'showModerated') {
      this.topicService.setParam('showModerated' as any, 'showModerated');
    } else if (f['status']) {
      this.topicService.setParam('statuses' as any, [f['status']]);
    }

    if (f['category']) this.topicService.setParam('categories' as any, [f['category']]);
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
