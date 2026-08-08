import { Service, signal, computed } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';

export interface ListParams {
  page: number;
  offset: number;
  limit: number;
  order?: string | null;
  orderBy?: string | null;
  sourcePartnerId?: string | null;
  search?: string | null;
  [key: string]: unknown;
}

@Service()
export abstract class ItemsListService<T extends ListParams = ListParams, U = unknown> {
  protected defaultParams: T = {
    page: 1,
    offset: 0,
    limit: 10,
    order: null,
    orderBy: null,
    sourcePartnerId: null,
    search: null
  } as T;

  params = signal<T>({ ...this.defaultParams });
  page = signal<number>(1);
  
  private resource = rxResource<{ rows: U[], countTotal?: number, count?: unknown }, { page: number, params: T }>({
    params: () => ({ page: this.page(), params: this.params() }),
    stream: ({ params }) => {
      const { page, params: requestParams } = params;
      const offset = (page - 1) * requestParams.limit;
      return this.getItems({ ...requestParams, offset, page } as T) as Observable<{ rows: U[], countTotal?: number, count?: unknown }>;
    }
  });

  items = computed(() => this.resource.value()?.rows ?? []);
  countTotal = computed(() => {
    const res = this.resource.value();
    return res?.countTotal || (typeof res?.count === 'number' ? res.count : 0);
  });

  totalPages = computed(() => {
    const count = this.countTotal();
    const limit = this.params().limit;
    return Math.ceil(count / limit) || 1;
  });

  hasMore = computed(() => {
    const total = this.totalPages();
    const currentPage = this.page();
    return total > 0 && currentPage < total;
  });

  isLoading = this.resource.isLoading;
  error = this.resource.error;
  protected setDefaults(defaults: Partial<T>) {
    this.defaultParams = { ...this.defaultParams, ...defaults };
    this.params.set({ ...this.defaultParams });
  }

  abstract getItems(params: T): Observable<{ rows: U[]; countTotal?: number; count?: unknown }>;

  setParam<K extends keyof T>(param: K, value: T[K]) {
    this.params.update(p => ({ ...p, [param]: value }));
    this.page.set(1); // Reset to first page on param change
  }

  loadPage(page: number) {
    this.page.set(page);
  }

  doOrder(orderBy: string, order = 'ASC') {
    this.params.update(p => ({ ...p, orderBy, order: order.toUpperCase() }));
    this.page.set(1);
  }

  reset() {
    this.params.set({ ...this.defaultParams });
    this.page.set(1);
  }

  reload() {
    this.resource.reload();
  }
}
