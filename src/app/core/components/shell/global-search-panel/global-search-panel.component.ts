import {
  Component,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Router } from '@angular/router';
import { UpperCasePipe } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged, Subject, switchMap, of, takeUntil } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GlobalSearchService } from '../../../services/global-search.service';
import { SearchService } from '../../../services/search.service';
import { UserStore } from '../../../state/user.store';
import { ConfigStore } from '../../../state/config.store';
import { UiStateService } from '../../../services/ui-state.service';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'cos-global-search-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, IconComponent, UpperCasePipe],
  template: `
    @if (globalSearch.showSearch()) {
      <div class="search_overlay" (click)="globalSearch.showSearch.set(false)"></div>
    }
    <div id="search" [class.open]="globalSearch.showSearch()">
      <div class="search_header">
        <div class="small_heading" translate="COMPONENTS.SEARCH.TITLE"></div>
        <button class="btn_medium_close icon" (click)="globalSearch.showSearch.set(false)" aria-label="Close search">
          <cos-icon name="close"></cos-icon>
        </button>
      </div>
      <div class="input_area">
        <div class="icon_wrap">
          <cos-icon name="search"></cos-icon>
        </div>
        <input
          #searchField
          type="text"
          class="search_field"
          [value]="searchInput()"
          (input)="onInput($event)"
          [placeholder]="'LAYOUTS.MAIN.PLACEHOLDER_SEARCH_TOPICS_USERS_GROUPS' | translate"
        />
        @if (searchInput()) {
          <button class="clear_search" (click)="clearSearch()" translate="COMPONENTS.SEARCH.LNK_CLEAR"></button>
        }
      </div>

      @if (!showResults()) {
        <div id="start_search">
          <div class="illustration_search"></div>
          <div id="text_wrap">
            <div class="small_heading" translate="COMPONENTS.SEARCH.HEADING_START_SEARCH"></div>
            <div translate="COMPONENTS.SEARCH.DESC_START_SEARCH"></div>
          </div>
        </div>
        <div id="donate_wrap">
          <div class="donate_item" id="donate_icon"></div>
          <div class="donate_item" id="donate_text" translate="DONATE_TXT"></div>
          <a class="donate_item" id="donate_button" target="_blank" [href]="lnkDonate()" translate="DONATE_BTN"></a>
        </div>
      }

      @if (showResults()) {
        <div id="results_area">
          <div class="results_header" translate="COMPONENTS.SEARCH.HEADING_SEARCH_RESULTS"></div>
          @if (noResults()) {
            <div class="results_no_results_wrap">
              <span class="results_no_results_text" translate="COMPONENTS.SEARCH.TXT_NO_RESULTS_FOUND"></span>
              <span class="results_no_results_link" (click)="toggleHelp()" translate="COMPONENTS.SEARCH.LNK_HELP_PANEL"></span>
            </div>
          }
          @for (context of contexts; track context) {
            @for (model of models; track model) {
              @if (resultCount(context, model) > 0) {
                <div class="result_group_wrap">
                  <div class="category bold">{{ 'LBL_CONTEXT_' + context + '_' + model | uppercase | translate }}</div>
                  @for (row of resultRows(context, model); track row.id) {
                    <a class="blue_link result_link" (click)="goToView(row, context)">
                      {{ row.name || row.title }}
                    </a>
                  }
                  @if (resultCount(context, model) > resultRows(context, model).length) {
                    <a class="more_results" (click)="viewMore(context, model)" translate="COMPONENTS.SEARCH.LNK_VIEW_MORE_RESULTS"></a>
                  }
                </div>
                <div class="line_separator"></div>
              }
            }
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .search_overlay {
      position: fixed;
      inset: 0;
      z-index: 12;
      background-color: rgba(44, 59, 71, 0.8);
      cursor: pointer;
    }

    #search {
      position: fixed;
      right: -300px;
      top: 0;
      width: 300px;
      height: 100%;
      display: flex;
      flex-direction: column;
      background-color: var(--color-background);
      z-index: 98;
      padding: 16px;
      transition: right 0.3s ease;
    }

    #search.open {
      right: 0;
    }

    .search_header {
      display: flex;
      padding-bottom: 16px;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .btn_medium_close {
      background: transparent;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      padding: 4px;
      color: var(--color-text);
    }

    .input_area {
      display: flex;
      align-items: center;
      border-radius: 40px;
      border: 1px solid var(--color-border);
      padding: 0 8px;
      gap: 8px;
      background: var(--color-surfaces);
    }

    .icon_wrap {
      display: flex;
      align-items: center;
      color: var(--color-text-muted);
      flex-shrink: 0;
    }

    .search_field {
      flex: 1;
      border: none;
      background: transparent;
      padding: 10px 0;
      font-size: 14px;
      color: var(--color-text);
      outline: none;
    }

    .search_field::placeholder {
      color: var(--color-text-muted);
    }

    .clear_search {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 13px;
      color: var(--color-primary);
      padding: 0;
      white-space: nowrap;
    }

    #start_search {
      padding-top: 64px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    #text_wrap {
      text-align: center;
    }

    .illustration_search {
      width: 80px;
      height: 80px;
      background-image: url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='80' height='80' rx='40' fill='white'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M35.7144 52.8574C43.9986 52.8574 50.7144 46.1417 50.7144 37.8574C50.7144 29.5732 43.9986 22.8574 35.7144 22.8574C27.4301 22.8574 20.7144 29.5732 20.7144 37.8574C20.7144 46.1417 27.4301 52.8574 35.7144 52.8574ZM35.7144 48.5717C41.6317 48.5717 46.4286 43.7748 46.4286 37.8574C46.4286 31.9401 41.6317 27.1431 35.7144 27.1431C29.797 27.1431 25.0001 31.9401 25.0001 37.8574C25.0001 43.7748 29.797 48.5717 35.7144 48.5717Z' fill='%23A7D1F3'/%3E%3Cpath d='M59.4866 55.1116L49.9219 45.5469L46.9754 48.4933L56.5402 58.058C57.3538 58.8717 58.673 58.8717 59.4866 58.058C60.3002 57.2444 60.3002 55.9252 59.4866 55.1116Z' fill='%23EFE08A'/%3E%3C/svg%3E");
    }

    #donate_wrap {
       padding-top: 64px;
       display: flex;
       flex-direction: column;
       align-items: center;
       gap: 16px;
       text-align: center;
    }

    #donate_icon {
      width: 48px;
      height: 48px;
      background-image: url("data:image/svg+xml,%3Csvg width='48' height='48' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z' fill='%23EFE08A'/%3E%3Cpath d='M24 34C24 34 32 26 32 20C32 15.5817 28.4183 12 24 12C19.5817 12 16 15.5817 16 20C16 26 24 34 24 34Z' fill='white'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: center;
    }

    #donate_button {
      display: inline-flex;
      padding: 10px 24px;
      background: var(--color-primary);
      color: white;
      border-radius: 4px;
      text-decoration: none;
      font-weight: 600;
    }

    #results_area {
      display: flex;
      flex-direction: column;
      gap: 24px;
      padding-top: 24px;
      overflow-y: auto;
    }

    .results_header {
      font-size: 16px;
      font-weight: 600;
      line-height: 24px;
    }

    .results_no_results_wrap {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .results_no_results_text {
      font-size: 13px;
    }

    .results_no_results_link {
      font-size: 13px;
      color: var(--color-primary);
      cursor: pointer;
      font-weight: 600;
    }

    .result_group_wrap {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .category {
      text-transform: capitalize;
      font-weight: 600;
    }

    .blue_link {
      font-weight: 600;
      color: var(--color-primary);
      cursor: pointer;
      text-decoration: none;
    }

    .blue_link:hover {
      text-decoration: underline;
    }

    .more_results {
      color: var(--color-primary);
      cursor: pointer;
      font-size: 13px;
    }

    .line_separator {
      height: 1px;
      background-color: var(--color-border);
    }
  `]
})
export class GlobalSearchPanelComponent {
  globalSearch = inject(GlobalSearchService);
  private searchService = inject(SearchService);
  private userStore = inject(UserStore);
  private router = inject(Router);
  private translate = inject(TranslateService);
  private configStore = inject(ConfigStore);
  private uiState = inject(UiStateService);

  searchInput = signal('');
  showResults = signal(false);
  noResults = signal(true);
  searchResults = signal<Record<string, any>>({});

  lnkDonate = computed(() => {
    const links = this.configStore.links.donate();
    return links[this.translate.currentLang] || links['en'];
  });

  readonly contexts = ['my', 'public'];
  readonly models = ['topics', 'groups'];

  private searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(str => {
        if (!str || str.length < 3) {
          this.showResults.set(false);
          return of(null);
        }
        const include = this.userStore.isAuthenticated()
          ? ['my.topic', 'my.group', 'public.topic', 'public.group']
          : ['public.topic', 'public.group'];
        return this.searchService.search(str, { include: include.join(','), limit: 2 });
      }),
      takeUntilDestroyed()
    ).subscribe(data => {
      if (!data) return;
      this.searchResults.set(data.results ?? data);
      this.showResults.set(true);
      const total = this.contexts.reduce((sum, ctx) =>
        sum + this.models.reduce((s, m) => s + (this.resultCount(ctx, m)), 0), 0);
      this.noResults.set(total === 0);
    });
  }

  onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchInput.set(value);
    this.searchSubject.next(value);
  }

  clearSearch() {
    this.searchInput.set('');
    this.showResults.set(false);
  }

  resultCount(context: string, model: string): number {
    return this.searchResults()?.[context]?.[model]?.count ?? 0;
  }

  resultRows(context: string, model: string): any[] {
    return this.searchResults()?.[context]?.[model]?.rows ?? [];
  }

  goToView(item: any, context: string) {
    const lang = this.translate.currentLang;
    const isGroup = Object.hasOwn(item, 'name');
    this.globalSearch.showSearch.set(false);
    if (isGroup) {
      this.router.navigate(['/', lang, 'groups', item.id]);
    } else {
      this.router.navigate(['/', lang, 'topics', item.id]);
    }
  }

  viewMore(context: string, model: string) {
    const str = this.searchInput();
    if (!str) return;
    const include = `${context}.${model === 'topics' ? 'topic' : 'group'}`;
    const offset = this.resultRows(context, model).length;
    this.searchService.search(str, { include, limit: 5, offset }).subscribe(data => {
      const more = data.results ?? data;
      this.searchResults.update(prev => {
        const updated = { ...prev };
        if (!updated[context]) updated[context] = {};
        const existing = updated[context][model] ?? { count: 0, rows: [] };
        updated[context][model] = {
          count: more[context]?.[model]?.count ?? existing.count,
          rows: [...existing.rows, ...(more[context]?.[model]?.rows ?? [])]
        };
        return updated;
      });
    });
  }

  toggleHelp() {
    this.globalSearch.showSearch.set(false);
    this.uiState.showHelp.set(true);
  }
}
