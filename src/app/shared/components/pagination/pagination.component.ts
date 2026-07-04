import { Component, output, computed, ChangeDetectionStrategy, ViewEncapsulation, model, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'cos-pagination',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [TranslateModule],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent {
  /**
   * Total number of pages. Supports 2-way binding.
   */
  totalPages = model<number>(0);

  /**
   * Current active page. Supports 2-way binding.
   */
  page = model<number>(1);

  /**
   * Optional CSS class to apply to the pagination container (e.g. 'ideation').
   */
  // eslint-disable-next-line @angular-eslint/no-input-rename
  customClass = input<string | undefined>(undefined, { alias: 'class' });

  /**
   * Emits the selected page number. Original modern name.
   */
  selectPage = output<number>();

  /**
   * Computes the range of page numbers to display (max 5 pages).
   */
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

  /**
   * Navigates to the previous page.
   */
  prev() {
    if (this.page() > 1) {
      this.doSelect(this.page() - 1);
    }
  }

  /**
   * Navigates to the next page.
   */
  next() {
    if (this.page() < this.totalPages()) {
      this.doSelect(this.page() + 1);
    }
  }

  /**
   * Emits the selection and updates the local page model.
   */
  doSelect(p: number) {
    this.page.set(p);
    this.selectPage.emit(p);
  }
}
