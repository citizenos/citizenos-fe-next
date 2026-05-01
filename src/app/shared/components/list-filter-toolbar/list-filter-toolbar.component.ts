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
      @if (moreFilters()) {
        <div class="options_area">
          <div class="options_row">
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
            <div class="input_area">
              <app-search-input
                [placeholder]="searchPlaceholder()"
                [value]="searchValue()"
                (valueChange)="searchChange.emit($event)"
              ></app-search-input>
            </div>
          </div>
        </div>
      }
      <div class="filter_control_buttons">
        <button class="btn_big_secondary" [class.flip]="moreFilters()" (click)="moreFilters.update(v => !v)" aria-label="Toggle Filters">
          <div class="btn_icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 10L12 15L7 10" stroke="#1168A8" stroke-width="2" stroke-linecap="round" />
            </svg>
          </div>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .list-filter-toolbar {
      display: flex;
      flex-direction: column;
      background: var(--color-surfaces);
      border-radius: 16px;
      width: 100%;
      margin-bottom: 24px;
      overflow: hidden;
    }
    .options_area {
      padding: 16px 16px 0 16px;
    }
    .options_row {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      gap: 16px;
      align-items: flex-start;
    }
    .toolbar-dropdown {
      min-width: 200px;
    }
    .input_area {
      flex: 1;
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
    .filter_control_buttons {
      display: flex;
      justify-content: center;
      padding: 8px;
    }
    .btn_big_secondary {
      background: var(--color-background);
      border: 1px solid var(--color-primary, #1168A8);
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: transform 0.2s;
    }
    .btn_big_secondary.flip {
      transform: rotate(180deg);
    }
    .btn_big_secondary:hover {
      background: var(--color-surface-hover);
    }
    .btn_icon {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `],
})
export class ListFilterToolbarComponent {
  filters = input<FilterConfig[]>([]);
  searchPlaceholder = input<string>('');
  searchValue = input<string>('');
  filterChange = output<{ key: string, value: string }>();
  searchChange = output<string>();

  moreFilters = signal(false);

  getActiveFilterText(filter: FilterConfig): string {
    const value = filter.selectedValue === '' ? 'all' : filter.selectedValue;
    return filter.items.find(item => item.value === value)?.title || filter.placeholder;
  }

  selectFilter(key: string, value: string) {
    this.filterChange.emit({ key, value });
  }
}
