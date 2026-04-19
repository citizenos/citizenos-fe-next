import { Component, input, output, computed, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'cos-pagination',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    @if (totalPages() > 1) {
      <div class="pagination">
        <button
          class="pagination-btn icon"
          [disabled]="page() === 1"
          (click)="prev()"
          aria-label="Previous page"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M10.4533 6.31262C10.8529 5.89579 11.5009 5.89579 11.9006 6.31262C12.3003 6.72945 12.3003 7.40527 11.9006 7.8221L8.91837 11L19 11C19.5652 11 20 11.4108 20 12.0003C20 12.5897 19.5652 12.9824 19 12.9824L8.91837 12.9824L11.9006 16.1779C12.3003 16.5947 12.3003 17.2705 11.9006 17.6874C11.5009 18.1042 10.8529 18.1042 10.4533 17.6874L5 12L10.4533 6.31262Z" fill="currentColor"/>
          </svg>
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
          aria-label="Next page"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M14.5467 6.31262C14.1471 5.89579 13.4991 5.89579 13.0994 6.31262C12.6997 6.72945 12.6997 7.40527 13.0994 7.8221L16.0816 11H6C5.43478 11 5 11.4108 5 12.0003C5 12.5897 5.43478 12.9824 6 12.9824H16.0816L13.0994 16.1779C12.6997 16.5947 12.6997 17.2705 13.0994 17.6874C13.4991 18.1042 14.1471 18.1042 14.5467 17.6874L20 12L14.5467 6.31262Z" fill="currentColor"/>
          </svg>
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
      border: 1px solid var(--color-border);
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
  totalPages = input<number>(0);
  page = input<number>(1);

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
