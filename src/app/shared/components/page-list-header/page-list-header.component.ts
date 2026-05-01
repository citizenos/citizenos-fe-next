import { Component, inject } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { GlobalSearchService } from '../../../core/services/global-search.service';
import { TourItemDirective } from '../../directives/tour-item.directive';

@Component({
  selector: 'app-page-list-header',
  standalone: true,
  imports: [IconComponent, TourItemDirective],
  template: `
    <div id="page_header" class="page-list-header">
      <div class="small_heading">
        <ng-content select="[title]"></ng-content>
      </div>
      <div class="header-actions">
        <button id="show_search" class="btn_medium_close icon" (click)="globalSearch.showSearch.update(v => !v)" aria-label="Toggle Search"
          [cosTourItem]="{tourid: 'dashboard', index: 1, position: 'right'}">
          <cos-icon name="search"></cos-icon>
        </button>
        <ng-content select="[activities]"></ng-content>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: contents;
    }
    .page-list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .btn_medium_close.icon {
      background: transparent;
      border: none;
      padding: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      color: var(--color-text-muted);
      transition: background 0.2s;
    }
    .btn_medium_close.icon:hover {
      background: var(--color-surface-hover);
      color: var(--color-text);
    }
  `]
})
export class PageListHeaderComponent {
  globalSearch = inject(GlobalSearchService);
}
