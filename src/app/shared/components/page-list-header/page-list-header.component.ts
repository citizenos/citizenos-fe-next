import { Component, output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-page-list-header',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div id="page_header" class="page-list-header">
      <div class="small_heading">
        <ng-content select="[title]"></ng-content>
      </div>
      <div class="header-actions">
        <!-- Search icon toggle, commonly used to expand search bar on mobile/desktop -->
        <button class="icon_btn" id="show_search" (click)="searchToggle.emit()" aria-label="Toggle Search">
          <cos-icon name="search"></cos-icon>
        </button>
        <!-- Slot for activities button or other custom actions -->
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
      margin-bottom: 24px;
      min-height: 40px;
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .icon_btn {
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
    .icon_btn:hover {
      background: var(--color-surface-hover);
      color: var(--color-text);
    }
  `]
})
export class PageListHeaderComponent {
  searchToggle = output<void>();
}
