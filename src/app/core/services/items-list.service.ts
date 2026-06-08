import { Service  } from '@angular/core';
import { BehaviorSubject, shareReplay, switchMap, map, combineLatest, Observable, debounceTime, tap, catchError } from 'rxjs';

export interface ListParams {
  page: number;
  offset: number;
  limit: number;
  order?: string | null;
  orderBy?: string | null;
  sourcePartnerId?: string | null;
  search?: string | null;
  [key: string]: any;
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

  params = new BehaviorSubject<T>({ ...this.defaultParams });
  page = new BehaviorSubject<number>(1);
  
  countTotal = new BehaviorSubject<number>(0);
  totalPages = new BehaviorSubject<number>(1);
  hasMore = new BehaviorSubject<boolean>(false);
  isLoading$ = new BehaviorSubject<boolean>(false);

  items$: Observable<U[]>;

  constructor() {
    this.items$ = this.loadItems();
  }

  protected setDefaults(defaults: Partial<T>) {
    this.defaultParams = { ...this.defaultParams, ...defaults };
    this.params.next({ ...this.defaultParams });
  }

  public loadItems(): Observable<U[]> {
    return combineLatest([this.page, this.params]).pipe(
      debounceTime(0),
      switchMap(([page, paramsValue]) => {
        this.isLoading$.next(true);
        const offset = (page - 1) * paramsValue.limit;
        return this.getItems({ ...paramsValue, offset, page } as T).pipe(
          tap(() => this.isLoading$.next(false)),
          catchError((err) => {
            this.isLoading$.next(false);
            throw err;
          })
        );
      }),
      map((res: { rows: U[]; countTotal?: number; count?: unknown }) => {
        const count = res.countTotal || (typeof res.count === 'number' ? res.count : 0);
        this.countTotal.next(count);
        const limit = this.params.value.limit;
        const total = Math.ceil(count / limit);
        this.totalPages.next(total);
        
        const currentPage = this.page.value;
        this.hasMore.next(total > 0 && currentPage < total);
        
        return Array.isArray(res.rows) ? res.rows : [];
      }),
      shareReplay(1)
    );
  }

  abstract getItems(params: T): Observable<{ rows: U[]; countTotal?: number; count?: unknown }>;

  setParam<K extends keyof T>(param: K, value: T[K]) {
    const current = this.params.value;
    this.params.next({ ...current, [param]: value });
    this.page.next(1); // Reset to first page on param change
  }

  loadPage(page: number) {
    this.page.next(page);
  }

  doOrder(orderBy: string, order = 'ASC') {
    const current = this.params.value;
    this.params.next({ ...current, orderBy, order: order.toUpperCase() });
    this.page.next(1);
  }

  reset() {
    this.params.next({ ...this.defaultParams });
    this.page.next(1);
  }

  reload() {
    this.page.next(this.page.value);
  }
}
