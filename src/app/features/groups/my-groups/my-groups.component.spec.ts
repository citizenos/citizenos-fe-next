import { TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runInInjectionContext, EnvironmentInjector } from '@angular/core';
import { MyGroupsComponent } from './my-groups.component';
import { UserGroupService } from '../../../core/services/user-group.service';
import { UserStore } from '../../../core/state/user.store';
import { of, BehaviorSubject } from 'rxjs';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

const mockGroupService = {
  items$: of([]),
  totalPages: new BehaviorSubject(1),
  reset: vi.fn(),
  setParam: vi.fn(),
  loadPage: vi.fn(),
};

const mockUserStore = {
  user: vi.fn().mockReturnValue({ id: 'user1' }),
};

describe('MyGroupsComponent', () => {
  let injector: EnvironmentInjector;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: UserGroupService, useValue: mockGroupService },
        { provide: UserStore, useValue: mockUserStore },
      ],
    });
    injector = TestBed.inject(EnvironmentInjector);
  });

  function makeComp(): MyGroupsComponent {
    return runInInjectionContext(injector, () => new MyGroupsComponent());
  }

  it('should instantiate', () => {
    expect(makeComp()).toBeTruthy();
  });

  it('filterConfigs has all required filter keys', () => {
    const comp = makeComp();
    const keys = comp.filterConfigs().map(c => c.key);
    expect(keys).toContain('visibility');
    expect(keys).toContain('engagement');
    expect(keys).toContain('orderBy');
    expect(keys).toContain('country');
    expect(keys).toContain('language');
  });

  it('onFilterChange with visibility favourite sets favourite param', () => {
    const comp = makeComp();
    comp.onFilterChange({ key: 'visibility', value: 'favourite' });
    expect(mockGroupService.reset).toHaveBeenCalled();
    expect(mockGroupService.setParam).toHaveBeenCalledWith('favourite', true);
  });

  it('onFilterChange with engagement iCreated sets creatorId param', () => {
    const comp = makeComp();
    comp.onFilterChange({ key: 'engagement', value: 'iCreated' });
    expect(mockGroupService.setParam).toHaveBeenCalledWith('creatorId', 'user1');
  });

  it('onSearch sets search param', () => {
    const comp = makeComp();
    comp.onSearch('test');
    expect(comp.searchValue()).toBe('test');
    expect(mockGroupService.setParam).toHaveBeenCalledWith('search', 'test');
  });

  it('onPageChange updates currentPage and calls loadPage', () => {
    const comp = makeComp();
    comp.onPageChange(2);
    expect(comp.currentPage()).toBe(2);
    expect(mockGroupService.loadPage).toHaveBeenCalledWith(2);
  });

  it('toggleCreate updates showCreate signal', () => {
    const comp = makeComp();
    expect(comp.showCreate()).toBe(false);
    comp.toggleCreate();
    expect(comp.showCreate()).toBe(true);
    comp.toggleCreate();
    expect(comp.showCreate()).toBe(false);
  });
});
