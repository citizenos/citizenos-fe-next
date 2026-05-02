import { TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runInInjectionContext, EnvironmentInjector } from '@angular/core';
import { PublicTopicsComponent } from './public-topics.component';
import { PublicTopicService } from '../../../core/services/public-topic.service';
import { of, BehaviorSubject } from 'rxjs';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SeoService } from '../../../core/services/seo.service';

const mockService = {
  items$: of([]),
  totalPages: new BehaviorSubject(1),
  reset: vi.fn(),
  setParam: vi.fn(),
  loadPage: vi.fn(),
};

describe('PublicTopicsComponent', () => {
  let injector: EnvironmentInjector;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: PublicTopicService, useValue: mockService },
        SeoService
      ],
    });
    injector = TestBed.inject(EnvironmentInjector);
  });

  function makeComp(): PublicTopicsComponent {
    return runInInjectionContext(injector, () => new PublicTopicsComponent());
  }

  it('should instantiate', () => {
    expect(makeComp()).toBeTruthy();
  });

  it('filterConfigs has status, category, and orderBy filters', () => {
    const comp = makeComp();
    const keys = comp.filterConfigs().map(c => c.key);
    expect(keys).toContain('status');
    expect(keys).toContain('category');
    expect(keys).toContain('orderBy');
  });

  it('status filter includes showModerated option', () => {
    const comp = makeComp();
    const statusFilter = comp.filterConfigs().find(c => c.key === 'status')!;
    expect(statusFilter.items.map(i => i.value)).toContain('showModerated');
  });

  it('onFilterChange with showModerated calls setParam showModerated', () => {
    const comp = makeComp();
    comp.onFilterChange({ key: 'status', value: 'showModerated' });
    expect(mockService.setParam).toHaveBeenCalledWith('showModerated', 'showModerated');
  });

  it('onFilterChange with a regular status sets statuses param', () => {
    const comp = makeComp();
    comp.onFilterChange({ key: 'status', value: 'voting' });
    expect(mockService.setParam).toHaveBeenCalledWith('statuses', ['voting']);
  });

  it('onPageChange updates currentPage and calls loadPage', () => {
    const comp = makeComp();
    comp.onPageChange(2);
    expect(comp.currentPage()).toBe(2);
    expect(mockService.loadPage).toHaveBeenCalledWith(2);
  });

  it('onSearch sets search param and updates searchValue', () => {
    const comp = makeComp();
    comp.onSearch('test query');
    expect(comp.searchValue()).toBe('test query');
    expect(mockService.setParam).toHaveBeenCalledWith('search', 'test query');
  });
});
