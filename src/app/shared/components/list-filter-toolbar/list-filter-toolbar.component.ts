import { Component, input, output, signal } from '@angular/core';
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
      <div class="filters-row">
        @for (filter of filters(); track filter.key) {
          <cos-dropdown class="toolbar-dropdown">
            <ng-container selection>
              <div class="selected_item">
                <span class="font-bold">{{ getActiveFilterText(filter) | translate }}</span>
              </div>
            </ng-container>
            <ng-container options>
              @for (option of filter.items; track option.value) {
                <div class="option" (click)="selectFilter(filter.key, option.value)">
                  <span>{{ option.title | translate }}</span>
                </div>
              }
            </ng-container>
          </cos-dropdown>
        }
        <button class="search-btn" [class.active]="showSearch()" (click)="showSearch.update(v => !v)" aria-label="Toggle Search">
          <cos-icon name="search"></cos-icon>
        </button>
      </div>
      @if (showSearch()) {
        <div class="search-row">
          <app-search-input
            [placeholder]="searchPlaceholder()"
            [value]="searchValue()"
            (valueChange)="searchChange.emit($event)"
          ></app-search-input>
        </div>
      }
    </div>
  `,
  styles: [`
    .list-filter-toolbar {
      display: flex;
      flex-direction: column;
      gap: 16px;
      background: var(--color-surfaces);
      border-radius: 16px;
      padding: 16px;
      width: 100%;
      margin-bottom: 24px;
    }
    .filters-row {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      gap: 16px;
      align-items: center;
    }
    .toolbar-dropdown {
      min-width: 200px;
    }
    .selected_item {
      font-size: 14px;
      color: var(--color-text, #2C3B47);
      line-height: 24px;
    }
    .option {
      font-size: 14px;
      color: var(--color-text, #2C3B47);
    }
    .font-bold {
      font-weight: 600;
    }
    .search-btn {
      margin-left: auto;
      background: transparent;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-text-muted);
      transition: background 0.2s;
    }
    .search-btn:hover, .search-btn.active {
      background: var(--color-surface-hover);
      color: var(--color-text);
    }
    .search-row {
      width: 100%;
    }
  `],
})
export class ListFilterToolbarComponent {
  filters = input<FilterConfig[]>([]);
  searchPlaceholder = input<string>('');
  searchValue = input<string>('');
  filterChange = output<{ key: string, value: string }>();
  searchChange = output<string>();

  showSearch = signal(false);

  getActiveFilterText(filter: FilterConfig): string {
    const value = filter.selectedValue === '' ? 'all' : filter.selectedValue;
    return filter.items.find(item => item.value === value)?.title || filter.placeholder;
  }

  selectFilter(key: string, value: string) {
    this.filterChange.emit({ key, value });
  }
}
