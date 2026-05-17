import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageListHeaderComponent } from './page-list-header.component';
import { Component, Input, signal } from '@angular/core';
import { GlobalSearchService } from '../../../core/services/global-search.service';
import { TourItemDirective } from '../../directives/tour-item.directive';
import { By } from '@angular/platform-browser';
import { vi, describe, it, expect, beforeEach } from 'vitest';

@Component({ selector: 'cos-icon', standalone: true, template: '' })
class MockIconComponent {
  @Input() name = '';
  @Input() size: string | number = 24;
}

describe('PageListHeaderComponent', () => {
  let component: PageListHeaderComponent;
  let fixture: ComponentFixture<PageListHeaderComponent>;
  let globalSearch: Partial<GlobalSearchService>;

  beforeEach(async () => {
    globalSearch = {
      showSearch: signal(false)
    };

    await TestBed.configureTestingModule({
      imports: [PageListHeaderComponent, MockIconComponent],
      providers: [
        { provide: GlobalSearchService, useValue: globalSearch }
      ]
    })
    .overrideComponent(PageListHeaderComponent, {
      set: {
        imports: [
          MockIconComponent,
          TourItemDirective
        ]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(PageListHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the search button', () => {
    expect(fixture.nativeElement.querySelector('#show_search')).toBeTruthy();
  });

  it('should emit searchToggle and toggle globalSearch.showSearch on click', () => {
    const spy = vi.fn();
    component.searchToggle.subscribe(spy);

    const searchBtn = fixture.debugElement.query(By.css('#show_search'));
    searchBtn.triggerEventHandler('click', null);

    expect((globalSearch as unknown as { showSearch: () => boolean }).showSearch()).toBe(true);
    expect(spy).toHaveBeenCalled();
  });

  it('second click should toggle showSearch back to false', () => {
    const searchBtn = fixture.debugElement.query(By.css('#show_search'));
    searchBtn.triggerEventHandler('click', null);
    searchBtn.triggerEventHandler('click', null);
    expect((globalSearch as unknown as { showSearch: () => boolean }).showSearch()).toBe(false);
  });

  it('should have a slot for title content projection', () => {
    expect(fixture.nativeElement.querySelector('.small_heading')).toBeTruthy();
  });
});
