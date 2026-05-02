import { Component, input, output, signal, computed, model, effect } from '@angular/core';
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
  selector: 'app-list-filter-toolbar',
  standalone: true,
  imports: [DropdownComponent, SearchInputComponent, IconComponent, TranslateModule],
  template: `
    <div class="list-filter-toolbar" role="toolbar" aria-label="List Filters">
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
                    <div class="option" (click)="selectFilter(filter.key, option.value)">
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
              @for (item of row; track (item.key || 'search')) {
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
                    [placeholder]="item.placeholder | translate">
                    <ng-container selection>
                      <span class="selected-item">{{ getActiveFilterText(item) | translate }}</span>
                    </ng-container>
                    <ng-container options>
                      @for (option of item.items; track option.value) {
                        <div class="option" (click)="selectFilter(item.key, option.value)">
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
    }
    .toolbar-search {
      display: flex;
      flex: 2;
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
    const items: any[] = [
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
