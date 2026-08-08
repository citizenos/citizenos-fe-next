import { Component, input, output, signal, computed, model, effect, ChangeDetectionStrategy } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { DropdownComponent } from '../dropdown/dropdown.component';
import { SearchInputComponent } from '../search-input/search-input.component';
import { IconComponent } from '../icon/icon.component';
import { TranslateModule } from '@ngx-translate/core';
import { NgClass, TitleCasePipe } from '@angular/common';

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
  imports: [DropdownComponent, SearchInputComponent, IconComponent, TranslateModule, NgClass, TitleCasePipe],
  template: `
    <div class="list-filter-toolbar mobile_hidden tablet_hidden" role="toolbar" aria-label="List Filters">
      <div class="options_area">
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
                    <div class="option" (click)="selectFilter(filter.key, option.value)" (keydown.enter)="selectFilter(filter.key, option.value)" tabindex="0" role="option" [attr.aria-selected]="filter.selectedValue === option.value">
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
                        <div class="option" (click)="selectFilter($any(item).key, option.value)" (keydown.enter)="selectFilter($any(item).key, option.value)" tabindex="0" role="option" [attr.aria-selected]="$any(item).selectedValue === option.value">
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
      <div class="filter_control_buttons">
        <button class="btn_big_secondary" (click)="moreFilters.update(v => !v)" aria-label="Toggle Filters">
          <cos-icon [name]="moreFilters() ? 'chevron-up' : 'chevron-down'"></cos-icon>
        </button>
        @if (hasActiveFilters()) {
          <button class="btn_big_secondary" (click)="clearAll()" aria-label="Reset Filters">
            <cos-icon name="refresh"></cos-icon>
          </button>
        }
      </div>
    </div>

    <!-- Mobile specific filters styling matching citizenos-fe -->
    <div class="mobile_show tablet_show" id="mobile_filters">
      <div class="dropdown mobile_filters_selection" [ngClass]="{'dropdown_active': mobileFiltersOpen()}">
        <div class="selection" tabindex="0" (click)="mobileFiltersOpen.set(!mobileFiltersOpen())" (keydown.enter)="mobileFiltersOpen.set(!mobileFiltersOpen())">
          <div class="selected_item">{{ 'COMPONENTS.PUBLIC_TOPICS.LBL_FILTER' | translate | titlecase }}</div>
          <button class="btn_medium_plain icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 10L12 15L7 10" stroke="#2C3B47" stroke-width="2" stroke-linecap="round" />
            </svg>
          </button>
        </div>
        
        <div class="options filter_options">
          @for (filter of allFilters(); track filter.key) {
            <div class="filter_option" tabindex="0" (click)="activeMobileFilter.set(filter.key)" (keydown.enter)="activeMobileFilter.set(filter.key)">
              <span>{{ filter.placeholder | translate }}</span>
              <a class="bold">
                @if (filter.selectedValue === 'all' || filter.selectedValue === '') {
                  <span>{{ 'VIEWS.GROUP.FILTER_ALL' | translate }}</span>
                }
                @if (filter.selectedValue !== 'all' && filter.selectedValue !== '') {
                  <span>{{ getActiveFilterText(filter) | translate }}</span>
                }
                <cos-icon name="chevron-right" [size]="24"></cos-icon>
              </a>
            </div>
          }
        </div>
      </div>

      @if (activeMobileFilter() !== null) {
        <div class="overlay" tabindex="0" (click)="activeMobileFilter.set(null)" (keydown.enter)="activeMobileFilter.set(null)"></div>
        <div class="mobile_filters_wrap active">
          <div class="options button_options">
            <label class="checkbox" tabindex="0" (click)="selectFilter(activeMobileFilter()!, 'all')" (keydown.enter)="selectFilter(activeMobileFilter()!, 'all')">
              <span>{{ 'TXT_TOPIC_STATUS_ALL' | translate | titlecase }}</span>
              <input type="radio" [name]="activeMobileFilter()" [checked]="getActiveFilter(activeMobileFilter()!)?.selectedValue === 'all' || getActiveFilter(activeMobileFilter()!)?.selectedValue === ''">
              <span class="checkmark"></span>
            </label>
            @if (getActiveFilter(activeMobileFilter()!); as activeF) {
              @for (option of activeF.items; track option.value) {
                <label class="checkbox" tabindex="0" (click)="selectFilter(activeF.key, option.value)" (keydown.enter)="selectFilter(activeF.key, option.value)">
                  <span>{{ option.title | translate }}</span>
                  <input type="radio" [name]="activeF.key" [checked]="activeF.selectedValue === option.value">
                  <span class="checkmark"></span>
                </label>
              }
            }
            <button type="button" class="btn_medium_secondary" (click)="activeMobileFilter.set(null)">{{ 'COMPONENTS.PUBLIC_TOPICS.BTN_APPLY' | translate }}</button>
          </div>
        </div>
      }
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

    @media (max-width: 1024px) {
      .toolbar-dropdown, .toolbar-search {
        min-width: calc(50% - 12px);
      }
    }

    /* Mobile specific filters styling matching citizenos-fe */
    .filter_dropdown {
      display: none;
      margin-bottom: 24px;
    }
    @media (max-width: 1023px) {
      .mobile_hidden {
        display: none !important;
      }
      .mobile_show {
        display: block !important;
      }
      .filter_dropdown {
        display: block;
      }
      .mobile_filters_selection {
        background: var(--color-surfaces);
        border-radius: 8px;
        position: relative;
      }
      .mobile_filters_selection.dropdown_active .options {
        display: block;
      }
      .mobile_filters_selection.dropdown_active .selection svg {
        transform: rotate(180deg);
      }
      .mobile_filters_selection .selection {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        cursor: pointer;
        font-weight: 600;
      }
      .mobile_filters_selection .selection .btn_medium_plain {
        background: none;
        border: none;
        cursor: pointer;
      }
      .filter_options {
        display: none;
        padding: 0 16px 16px;
      }
      .filter_option {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid var(--color-border);
      }
      .filter_option:last-child {
        border-bottom: none;
      }
      .filter_option .bold {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        cursor: pointer;
        color: var(--color-link);
      }
      
      .overlay {
        position: fixed;
        cursor: pointer;
        z-index: 9999;
        background-color: rgba(44, 59, 71, 0.8);
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
      }
      .mobile_filters_wrap {
        display: flex;
        position: fixed;
        bottom: -200px;
        padding: 16px;
        left: 0;
        background-color: var(--color-surfaces);
        z-index: 9999999;
        width: 100%;
        max-height: 100%;
        box-sizing: border-box;
        border-radius: 16px 16px 0 0;
        box-shadow: 0px 8px 20px 0px rgba(220, 231, 240, 0.3),
          0px 12px 16px 0px rgba(50, 85, 112, 0.1);
        transition: bottom 0.2s ease-in;
        visibility: hidden;
      }
      .mobile_filters_wrap.active {
        bottom: 0;
        visibility: visible;
      }
      .mobile_filter {
        background: var(--color-surfaces);
        border-radius: 8px;
        margin-top: 16px;
        padding: 16px;
      }
      .button_options {
        display: flex;
        flex-direction: column;
        gap: 16px;
        width: 100%;
        max-height: 80vh;
        overflow-y: auto;
      }
      .checkbox {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 8px;
        position: relative;
        cursor: pointer;
        user-select: none;
        min-height: 24px;
        flex-direction: row-reverse;
        flex-wrap: wrap;
        width: 100%;
      }
      .checkbox span {
        max-width: calc(100% - 40px);
      }
      .checkbox input {
        position: absolute !important;
        opacity: 0;
        cursor: pointer;
        height: 0;
        width: 0;
      }
      .checkmark {
        height: 24px;
        width: 24px;
        min-width: 24px;
        border: 1px solid var(--color-border);
        border-radius: 8px;
        position: relative;
      }
      .checkbox:hover input ~ .checkmark {
        background-color: var(--color-background-hover);
      }
      .checkbox input:checked ~ .checkmark {
        background-color: var(--color-primary);
        border-color: var(--color-primary);
      }
      .checkmark:after {
        content: "";
        position: absolute;
        display: none;
      }
      .checkbox input:checked ~ .checkmark:after {
        display: block;
      }
      .checkbox .checkmark:after {
        left: 7px;
        top: 3px;
        width: 5px;
        height: 10px;
        border: solid white;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
      }
    }
  `]
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
  activeMobileFilter = signal<string | null>(null);

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

  getActiveFilter(key: string): FilterConfig | undefined {
    return this.allFilters().find(f => f.key === key);
  }

  selectFilter(key: string, value: string) {
    this.filterChange.emit({ key, value });
  }

  clearAll() {
    [...this.filters(), ...this.filtersExtra()].forEach(f => this.filterChange.emit({ key: f.key, value: 'all' }));
    this.searchValue.set('');
  }
}
