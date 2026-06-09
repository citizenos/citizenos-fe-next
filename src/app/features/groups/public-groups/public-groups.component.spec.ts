import { TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runInInjectionContext, EnvironmentInjector, signal } from '@angular/core';
import { PublicGroupsComponent } from './public-groups.component';
import { PublicGroupService } from '../../../core/services/public-group.service';
import { UserStore } from '../../../core/state/user.store';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

const mockGroupService: Partial<PublicGroupService> = {
  items: signal([]),
  totalPages: signal(1),
  reset: vi.fn(),
  setParam: vi.fn(),
  loadPage: vi.fn(),
};

const mockUserStore: { isAuthenticated: any; user: any } = {
  isAuthenticated: vi.fn().mockReturnValue(false) as unknown as () => boolean,
  user: vi.fn().mockReturnValue(null) as unknown as () => null,
};

describe('PublicGroupsComponent', () => {
  let injector: EnvironmentInjector;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: PublicGroupService, useValue: mockGroupService },
        { provide: UserStore, useValue: mockUserStore },
      ],
    });
    injector = TestBed.inject(EnvironmentInjector);
  });

  function makeComp(): PublicGroupsComponent {
    return runInInjectionContext(injector, () => new PublicGroupsComponent());
  }

  it('should instantiate', () => {
    expect(makeComp()).toBeTruthy();
  });

  it('filterConfigs has visibility, orderBy, country, language filters', () => {
    const comp = makeComp();
    const keys = comp.filterConfigs().map(c => c.key);
    expect(keys).toContain('visibility');
    expect(keys).toContain('orderBy');
    expect(keys).toContain('country');
    expect(keys).toContain('language');
  });

  it('visibility filter does not include favourite when not authenticated', () => {
    const comp = makeComp();
    const visFilter = comp.filterConfigs().find(c => c.key === 'visibility')!;
    const values = visFilter.items.map(i => i.value);
    expect(values).not.toContain('favourite');
  });

  it('visibility filter includes favourite when authenticated', () => {
    mockUserStore.isAuthenticated.mockReturnValue(true);
    const comp = makeComp();
    const visFilter = comp.filterConfigs().find(c => c.key === 'visibility')!;
    const values = visFilter.items.map(i => i.value);
    expect(values).toContain('favourite');
  });

  it('onSearch sets search param', () => {
    const comp = makeComp();
    comp.onSearch('public');
    expect(mockGroupService.setParam).toHaveBeenCalledWith('search', 'public');
  });

  it('onFilterChange with orderBy sets params', () => {
    const comp = makeComp();
    comp.onFilterChange({ key: 'orderBy', value: 'memberCount' });
    expect(mockGroupService.reset).toHaveBeenCalled();
    expect(mockGroupService.setParam).toHaveBeenCalledWith('orderBy', 'memberCount');
    expect(mockGroupService.setParam).toHaveBeenCalledWith('order', 'desc');
  });

  it('onFilterChange with visibility favourite sets favourite param', () => {
    const comp = makeComp();
    comp.onFilterChange({ key: 'visibility', value: 'favourite' });
    expect(mockGroupService.reset).toHaveBeenCalled();
    expect(mockGroupService.setParam).toHaveBeenCalledWith('favourite', true);
  });

  it('onPageChange updates currentPage and calls loadPage', () => {
    const comp = makeComp();
    comp.onPageChange(3);
    expect(comp.currentPage()).toBe(3);
    expect(mockGroupService.loadPage).toHaveBeenCalledWith(3);
  });
});
