import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageListHeaderComponent } from './page-list-header.component';
import { Component, Input, output, signal } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { GlobalSearchService } from '../../../core/services/global-search.service';
import { TourItemDirective } from '../../directives/tour-item.directive';
import { By } from '@angular/platform-browser';
import { vi, describe, it, expect, beforeEach } from 'vitest';

@Component({ selector: 'cos-icon', standalone: true, template: '' })
class MockIconComponent {
  @Input() name = '';
  @Input() size: any;
}

describe('PageListHeaderComponent', () => {
  let component: PageListHeaderComponent;
  let fixture: ComponentFixture<PageListHeaderComponent>;
  let globalSearch: any;

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

  it('should emit searchToggle and update globalSearch on click', () => {
    const spy = vi.fn();
    component.searchToggle.subscribe(spy);
    
    const searchBtn = fixture.debugElement.query(By.css('#show_search'));
    searchBtn.triggerEventHandler('click', null);
    
    expect(globalSearch.showSearch()).toBe(true);
    expect(spy).toHaveBeenCalled();
  });
});
