import { Component, input, output, ViewEncapsulation } from '@angular/core';
import { DropdownComponent } from '../dropdown/dropdown.component';
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
  imports: [DropdownComponent, TranslateModule],
  template: `
    <div class="list-filter-toolbar" role="toolbar" aria-label="List Filters">
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
    </div>
  `,
  styles: [`
    .list-filter-toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      align-items: center;
      margin-bottom: 24px;
    }
    .toolbar-dropdown {
      min-width: 200px;
    }
    /* Minimal styling mapped to legacy definitions */
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
  `],
  encapsulation: ViewEncapsulation.None
})
export class ListFilterToolbarComponent {
  filters = input<FilterConfig[]>([]);
  filterChange = output<{ key: string, value: string }>();

  getActiveFilterText(filter: FilterConfig): string {
    const value = filter.selectedValue === '' ? 'all' : filter.selectedValue;
    return filter.items.find(item => item.value === value)?.title || filter.placeholder;
  }

  selectFilter(key: string, value: string) {
    this.filterChange.emit({ key, value });
  }
}
