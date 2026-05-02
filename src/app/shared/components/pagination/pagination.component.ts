import { Component, input, output, computed, ChangeDetectionStrategy, ViewEncapsulation, model } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'cos-pagination',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [IconComponent, TranslateModule],
  template: `
    @if (totalPages() > 1) {
      <div class="pagination">
        <button
          class="pagination-btn icon"
          [disabled]="page() === 1"
          (click)="prev()"
          [attr.aria-label]="'COMPONENTS.ACCESSIBILITY.PAGINATION_PREV' | translate"
        >
          <cos-icon name="arrow-left"></cos-icon>
        </button>

        @for (p of pages(); track p) {
          <button
            class="pagination-btn"
            [class.active]="p === page()"
            (click)="select.emit(p)"
          >{{ p }}</button>
        }

        <button
          class="pagination-btn icon"
          [disabled]="page() === totalPages()"
          (click)="next()"
          [attr.aria-label]="'COMPONENTS.ACCESSIBILITY.PAGINATION_NEXT' | translate"
        >
          <cos-icon name="arrow-right"></cos-icon>
        </button>
      </div>
    }
  `,
  styles: [`
    cos-pagination .pagination {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 8px;
    }

    cos-pagination .pagination-btn {
      width: 40px;
      height: 40px;
      border: 1px solid var(--color-border-bold);
      border-radius: var(--radius-sm);
      background: var(--color-surfaces);
      cursor: pointer;
      font-size: 14px;
      font-family: var(--font-family-base);
      color: var(--color-text);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast);

      &:hover:not(:disabled) {
        border-color: var(--color-link);
        color: var(--color-link);
      }

      &.active {
        background: var(--color-primary);
        color: white;
        border-color: var(--color-primary);
      }

      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
    }
  `]
})
export class PaginationComponent {
  totalPages = model<number>(0);
  page = model<number>(1);

  select = output<number>();

  pages = computed(() => {
    const total = this.totalPages();
    const current = this.page();
    const arr: number[] = [];

    if (total <= 5) {
      for (let i = 1; i <= total; i++) arr.push(i);
    } else if (current < 4) {
      for (let i = 1; i < 6; i++) arr.push(i);
    } else if (total - current >= 2) {
      for (let i = -2; i < 3; i++) arr.push(current + i);
    } else {
      for (let i = -4; i < 1; i++) arr.push(total + i);
    }

    return arr;
  });

  prev() {
    if (this.page() > 1) this.select.emit(this.page() - 1);
  }

  next() {
    if (this.page() < this.totalPages()) this.select.emit(this.page() + 1);
  }
}
