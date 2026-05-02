import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListFilterToolbarComponent, FilterConfig } from './list-filter-toolbar.component';
import { TranslateModule } from '@ngx-translate/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ComponentRef, Component, Input } from '@angular/core';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { DropdownComponent } from '../dropdown/dropdown.component';
import { IconComponent } from '../icon/icon.component';
import { SearchInputComponent } from '../search-input/search-input.component';

@Component({ selector: 'cos-dropdown', standalone: true, template: '<ng-content></ng-content>' })
class MockDropdownComponent { @Input() placeholder = ''; }

@Component({ selector: 'cos-icon', standalone: true, template: '' })
class MockIconComponent { @Input() name = ''; @Input() size = 24; }

@Component({ selector: 'app-search-input', standalone: true, template: '' })
class MockSearchInputComponent { @Input() placeholder = ''; @Input() value = ''; }

describe('ListFilterToolbarComponent', () => {
  let component: ListFilterToolbarComponent;
  let fixture: ComponentFixture<ListFilterToolbarComponent>;
  let componentRef: ComponentRef<ListFilterToolbarComponent>;

  const mockFilters: FilterConfig[] = [
    {
      key: 'status',
      placeholder: 'Status',
      selectedValue: '',
      items: [
        { title: 'All', value: 'all' },
        { title: 'Active', value: 'active' },
        { title: 'Closed', value: 'closed' }
      ]
    },
    {
      key: 'type',
      placeholder: 'Type',
      selectedValue: 'public',
      items: [
        { title: 'All', value: 'all' },
        { title: 'Public', value: 'public' },
        { title: 'Private', value: 'private' }
      ]
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListFilterToolbarComponent, TranslateModule.forRoot(), MockDropdownComponent, MockIconComponent, MockSearchInputComponent],
      providers: [provideAnimationsAsync()]
    })
    .overrideComponent(ListFilterToolbarComponent, {
      remove: { imports: [DropdownComponent, IconComponent, SearchInputComponent] },
      add: { imports: [MockDropdownComponent, MockIconComponent, MockSearchInputComponent] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListFilterToolbarComponent);
    component = fixture.componentInstance; 
    componentRef = fixture.componentRef;
    component.filters.set(mockFilters);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.filters().length).toBe(2);
  });

  it('should render the correct number of dropdown filters', () => {
    const dropdowns = fixture.nativeElement.querySelectorAll('cos-dropdown');
    expect(dropdowns.length).toBe(2);
  });

  it('should return correct active filter text', () => {
    const statusText = component.getActiveFilterText(mockFilters[0]);
    expect(statusText).toBe('All'); // '' maps to 'all'

    const typeText = component.getActiveFilterText(mockFilters[1]);
    expect(typeText).toBe('Public');
  });

  it('should emit filterChange when an option is clicked', () => {
    vi.spyOn(component.filterChange, 'emit');
    // We can directly call the function since clicking cos-dropdown options in tests requires more setup
    component.selectFilter('status', 'active');
    expect(component.filterChange.emit).toHaveBeenCalledWith({ key: 'status', value: 'active' });
  });
});
