import { Component } from '@angular/core';

@Component({
  selector: 'app-page-list-header',
  standalone: true,
  imports: [],
  template: `
    <div id="page_header" class="page-list-header">
      <div class="small_heading">
        <ng-content select="[title]"></ng-content>
      </div>
      <div class="header-actions">
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
  `]
})
export class PageListHeaderComponent {}
