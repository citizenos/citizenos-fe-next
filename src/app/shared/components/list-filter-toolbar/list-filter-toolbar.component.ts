import { Component, input, output, signal, computed, model, effect, ChangeDetectionStrategy } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { DropdownComponent } from '../dropdown/dropdown.component';
import { SearchInputComponent } from '../search-input/search-input.component';
import { IconComponent } from '../icon/icon.component';
import { TranslateModule } from '@ngx-translate/core';

export interface FilterOption {
  title: string;
  value: string;
}

export interface FilterConfig {
  key: string;
  placeholder: string;
  selectedValue: string;
  items: FilterOption[];
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-list-filter-toolbar',
  standalone: true,
  imports: [DropdownComponent, SearchInputComponent, IconComponent, TranslateModule],
  template: `
    <div class="list-filter-toolbar" role="toolbar" aria-label="List Filters">
      <div class="options_area mobile_hidden">
        @for (row of mainRows(); track $index) {
          <div class="options_row">
            @for (filter of row; track filter.key) {
              <cos-dropdown
                class="toolbar-dropdown"
                [placeholder]="filter.placeholder | translate">
                <ng-container selection>
                  <span class="selected-item">{{ getActiveFilterText(filter) | translate }}</span>
                </ng-container>
                <ng-container options>
                  @for (option of filter.items; track option.value) {
                    <div class="option" (click)="selectFilter(filter.key, option.value)" (keydown.enter)="selectFilter(filter.key, option.value)" tabindex="0" role="option">
                      {{ option.title | translate }}
                    </div>
                  }
                </ng-container>
              </cos-dropdown>
            }
          </div>
        }

        <div class="extra_area" [@slideInOut]="moreFilters() ? 'open' : 'closed'">
          @for (row of extraRows(); track $index) {
            <div class="options_row">
              @for (item of row; track ($any(item).key || 'search')) {
                @if (item.type === 'search') {
                  <app-search-input
                    class="toolbar-search"
                    [placeholder]="searchPlaceholder()"
                    [value]="searchValue()"
                    (valueChange)="searchValue.set($event)"
                  ></app-search-input>
                } @else {
                  <cos-dropdown
                    class="toolbar-dropdown"
                    [placeholder]="$any(item).placeholder | translate">
                    <ng-container selection>
                      <span class="selected-item">{{ getActiveFilterText($any(item)) | translate }}</span>
                    </ng-container>
                    <ng-container options>
                      @for (option of ($any(item).items); track option.value) {
                        <div class="option" (click)="selectFilter($any(item).key, option.value)" (keydown.enter)="selectFilter($any(item).key, option.value)" tabindex="0" role="option">
                          {{ option.title | translate }}
                        </div>
                      }
                    </ng-container>
                  </cos-dropdown>
                }
              }
            </div>
          }
        </div>
      </div>
      <div class="filter_control_buttons mobile_hidden">
        <button class="btn_big_secondary" (click)="moreFilters.update(v => !v)" aria-label="Toggle Filters">
          <cos-icon [name]="moreFilters() ? 'chevron-up' : 'chevron-down'"></cos-icon>
        </button>
        @if (hasActiveFilters()) {
          <button class="btn_big_secondary" (click)="clearAll()" aria-label="Reset Filters">
            <cos-icon name="refresh"></cos-icon>
          </button>
        }
      </div>

      <!-- MOBILE VIEW: Custom dropdown for filters -->
      <div class="mobile_filters mobile_show">
        <app-search-input
          class="toolbar-search mobile-search-input"
          [placeholder]="searchPlaceholder()"
          [value]="searchValue()"
          (valueChange)="searchValue.set($event)"
        ></app-search-input>
        <div class="dropdown mobile_filters_selection" [class.dropdown_active]="mobileFiltersOpen()">
          <div class="selection" (click)="mobileFiltersOpen.update(v => !v)">
            <div class="selected_item bold">{{ 'COMPONENTS.PUBLIC_TOPICS.LBL_FILTER' | translate | titlecase }}</div>
            <button class="btn_medium_plain icon">
              <cos-icon [name]="mobileFiltersOpen() ? 'chevron-up' : 'chevron-down'" [size]="24" color="#1168A8"></cos-icon>
            </button>
          </div>
          
          @if (mobileFiltersOpen()) {
            <div class="options mobile_filter_wrap">
              @for (filter of allFilters(); track filter.key) {
                <div class="mobile_filter_group">
                  <div class="bold">{{ filter.placeholder | translate }}</div>
                  <div class="mobile_filter_options">
                    @for (option of filter.items; track option.value) {
                      <div class="mobile_filter_option" (click)="selectFilter(filter.key, option.value)">
                        <div class="checkbox" [class.active]="filter.selectedValue === option.value || (filter.selectedValue === '' && option.value === 'all')"></div>
                        <div>{{ option.title | translate }}</div>
                      </div>
                    }
                  </div>
                </div>
              }
              @if (hasActiveFilters()) {
                <div class="mobile_filter_group">
                  <div class="mobile_filter_option clear_filters_btn" (click)="clearAll()">
                    <div>{{ 'VIEWS.GROUP.LNK_CLEAR_FILTERS' | translate }}</div>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  animations: [
    trigger('slideInOut', [
      state('closed', style({
        height: '0px',
        opacity: 0,
        overflow: 'hidden',
        visibility: 'hidden',
        marginTop: '0px'
      })),
      state('open', style({
        height: '*',
        opacity: 1,
        visibility: 'visible',
        marginTop: '16px'
      })),
      transition('open <=> closed', animate('300ms ease-in-out'))
    ])
  ],
  styles: [`
    .list-filter-toolbar {
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      gap: 16px;
      background: var(--color-surfaces);
      border-radius: 16px;
      padding: 16px;
      width: 100%;
      margin-bottom: 24px;
      box-sizing: border-box;
    }
    .options_area {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .options_row {
      width: 100%;
      display: flex;
      flex-flow: row wrap;
      gap: 16px;
      position: relative;
    }
    .toolbar-dropdown {
      flex: 1;
      min-width: calc(25% - 12px);
    }
    .toolbar-search {
      display: flex;
      flex: 2;
      min-width: calc(50% - 12px);
    }
    @media (max-width: 1024px) {
      .toolbar-dropdown, .toolbar-search {
        min-width: calc(50% - 12px);
      }
    }
    .extra_area {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .font-bold {
      font-weight: 600;
    }
    .option {
      padding: 10px 16px;
      cursor: pointer;
      font-size: 14px;
      color: var(--color-text);
    }
    .option:hover {
      background: var(--color-secondary);
    }
    .filter_control_buttons {
      display: flex;
      flex-direction: column;
      gap: 8px;
      flex-shrink: 0;
    }
    .btn_big_secondary {
      background: var(--color-background);
      border: 1px solid var(--color-background);
      border-radius: 50%;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--color-link);
      transition: background 0.2s;
    }
    .btn_big_secondary:hover {
      background: var(--color-background-hover);
    }

    /* Mobile specific filters styling */
    .mobile_filters {
      display: none;
    }
    @media (max-width: 768px) {
      .mobile_hidden {
        display: none !important;
      }
      .mobile_show {
        display: block !important;
      }
      .list-filter-toolbar {
        padding: 0;
        background: transparent;
      }
      .mobile_filters {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .mobile-search-input {
        width: 100%;
      }
      .mobile_filters_selection {
        background: var(--color-surfaces);
        border-radius: 8px;
        position: relative;
      }
      .mobile_filters_selection .selection {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        cursor: pointer;
      }
      .mobile_filter_wrap {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: var(--color-surfaces);
        border-radius: 8px;
        padding: 16px;
        margin-top: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        z-index: 100;
        display: flex;
        flex-direction: column;
        gap: 16px;
        max-height: 400px;
        overflow-y: auto;
      }
      .mobile_filter_group {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .mobile_filter_options {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .mobile_filter_option {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 0;
        cursor: pointer;
      }
      .mobile_filter_option .checkbox {
        width: 16px;
        height: 16px;
        border: 2px solid var(--color-border);
        border-radius: 4px;
        position: relative;
      }
      .mobile_filter_option .checkbox.active {
        background: var(--color-primary);
        border-color: var(--color-primary);
      }
      .mobile_filter_option .checkbox.active::after {
        content: '';
        position: absolute;
        left: 4px;
        top: 0px;
        width: 4px;
        height: 8px;
        border: solid white;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
      }
      .clear_filters_btn {
        color: var(--color-primary);
        font-weight: 600;
      }
    }
  `],
})
export class ListFilterToolbarComponent {
  filters = model<FilterConfig[]>([]);
  filtersExtra = model<FilterConfig[]>([]);
  searchPlaceholder = input<string>('');
  searchValue = model<string>('');
  filterChange = output<{ key: string, value: string }>();
  searchChange = output<string>();

  moreFilters = signal(false);
  mobileFiltersOpen = signal(false);

  allFilters = computed(() => {
    return [...this.filters(), ...this.filtersExtra().map(f => ({...f, type: 'filter'}))] as FilterConfig[];
  });

  constructor() {
    effect(() => this.searchChange.emit(this.searchValue()));
  }

  mainRows = computed(() => {
    const f = this.filters();
    const chunks = [];
    for (let i = 0; i < f.length; i += 4) {
      chunks.push(f.slice(i, i + 4));
    }
    return chunks;
  });

  extraRows = computed(() => {
    const ex = this.filtersExtra();
    const items: (FilterConfig & { type: string } | { type: string })[] = [
      ...ex.map(f => ({ ...f, type: 'filter' })),
      { type: 'search' }
    ];
    const chunks = [];
    for (let i = 0; i < items.length; i += 4) {
      chunks.push(items.slice(i, i + 4));
    }
    return chunks;
  });

  hasActiveFilters = computed(() => {
    const filterActive = [...this.filters(), ...this.filtersExtra()].some(f => f.selectedValue !== '' && f.selectedValue !== 'all');
    return filterActive || this.searchValue() !== '';
  });

  getActiveFilterText(filter: FilterConfig): string {
    const value = filter.selectedValue === '' ? 'all' : filter.selectedValue;
    return filter.items.find(item => item.value === value)?.title || filter.placeholder;
  }

  selectFilter(key: string, value: string) {
    this.filterChange.emit({ key, value });
  }

  clearAll() {
    [...this.filters(), ...this.filtersExtra()].forEach(f => this.filterChange.emit({ key: f.key, value: 'all' }));
    this.searchValue.set('');
  }
}
