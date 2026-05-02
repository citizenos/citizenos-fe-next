import { TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runInInjectionContext, EnvironmentInjector } from '@angular/core';
import { MyTopicsComponent } from './my-topics.component';
import { UserTopicService } from '../../../core/services/user-topic.service';
import { of, BehaviorSubject } from 'rxjs';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SeoService } from '../../../core/services/seo.service';
import { TOPIC_STATUSES } from '../../../core/constants/topic.constants';

const mockService = {
  items$: of([]),
  totalPages: new BehaviorSubject(1),
  reset: vi.fn(),
  setParam: vi.fn(),
  loadPage: vi.fn(),
};

describe('MyTopicsComponent', () => {
  let injector: EnvironmentInjector;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: UserTopicService, useValue: mockService },
        SeoService
      ],
    });
    injector = TestBed.inject(EnvironmentInjector);
  });

  function makeComp(): MyTopicsComponent {
    return runInInjectionContext(injector, () => new MyTopicsComponent());
  }

  it('should instantiate', () => {
    expect(makeComp()).toBeTruthy();
  });

  it('filterConfigs has all required filter keys', () => {
    const comp = makeComp();
    const keys = comp.filterConfigs().map(c => c.key);
    expect(keys).toContain('visibility');
    expect(keys).toContain('status');
    expect(keys).toContain('category');
    expect(keys).toContain('engagement');
    expect(keys).toContain('orderBy');
  });

  it('status filter contains all topic statuses', () => {
    const comp = makeComp();
    const statusConfig = comp.filterConfigs().find(c => c.key === 'status')!;
    const values = statusConfig.items.map(i => i.value);
    for (const status of Object.keys(TOPIC_STATUSES)) {
      expect(values).toContain(status);
    }
  });

  it('onFilterChange with status calls setParam with statuses array', () => {
    const comp = makeComp();
    comp.onFilterChange({ key: 'status', value: 'inProgress' });
    expect(mockService.reset).toHaveBeenCalled();
    expect(mockService.setParam).toHaveBeenCalledWith('statuses', ['inProgress']);
  });

  it('onFilterChange with all does not set statuses param', () => {
    const comp = makeComp();
    comp.onFilterChange({ key: 'status', value: 'all' });
    expect(mockService.reset).toHaveBeenCalled();
    expect(mockService.setParam).not.toHaveBeenCalledWith('statuses', expect.anything());
  });

  it('onPageChange updates currentPage and calls loadPage', () => {
    const comp = makeComp();
    comp.onPageChange(3);
    expect(comp.currentPage()).toBe(3);
    expect(mockService.loadPage).toHaveBeenCalledWith(3);
  });

  it('onSearch sets search param', () => {
    const comp = makeComp();
    comp.onSearch('angular');
    expect(comp.searchValue()).toBe('angular');
    expect(mockService.setParam).toHaveBeenCalledWith('search', 'angular');
  });

  it('onSearch with empty string passes null', () => {
    const comp = makeComp();
    comp.onSearch('');
    expect(mockService.setParam).toHaveBeenCalledWith('search', null);
  });

  it('onFilterChange with favourite sets favourite param', () => {
    const comp = makeComp();
    comp.onFilterChange({ key: 'visibility', value: 'favourite' });
    expect(mockService.setParam).toHaveBeenCalledWith('favourite', 'favourite');
  });

  it('onFilterChange with showModerated sets showModerated param', () => {
    const comp = makeComp();
    comp.onFilterChange({ key: 'visibility', value: 'showModerated' });
    expect(mockService.setParam).toHaveBeenCalledWith('showModerated', 'showModerated');
  });
});
