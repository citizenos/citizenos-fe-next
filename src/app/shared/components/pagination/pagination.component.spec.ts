import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TranslateModule } from '@ngx-translate/core';
import { PaginationComponent } from './pagination.component';
import { IconComponent } from '../icon/icon.component';

@Component({ selector: 'cos-icon', standalone: true, template: '' })
class MockIconComponent {
  @Input() name = '';
  @Input() size: string | number = 24;
}

describe('PaginationComponent', () => {
  let fixture: ComponentFixture<PaginationComponent>;
  let component: PaginationComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationComponent, TranslateModule.forRoot(), MockIconComponent]
    })
    .overrideComponent(PaginationComponent, {
      remove: { imports: [IconComponent] },
      add: { imports: [MockIconComponent] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaginationComponent);
    component = fixture.componentInstance;
  });

  it('should render pagination when totalPages > 1', () => {
    component.totalPages.set(10);
    component.page.set(1);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.pagination')).toBeTruthy();
  });

  it('should not render when totalPages <= 1', () => {
    component.totalPages.set(1);
    component.page.set(1);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.pagination')).toBeNull();
  });

  it('should compute all pages when total <= 5', () => {
    component.totalPages.set(5);
    component.page.set(1);
    fixture.detectChanges();
    expect(component.pages()).toEqual([1, 2, 3, 4, 5]);
  });

  it('should show pages 1-5 when current page < 4', () => {
    component.totalPages.set(20);
    component.page.set(2);
    fixture.detectChanges();
    expect(component.pages()).toEqual([1, 2, 3, 4, 5]);
  });

  it('should center 5 pages around current page in the middle', () => {
    component.totalPages.set(20);
    component.page.set(10);
    fixture.detectChanges();
    expect(component.pages()).toEqual([8, 9, 10, 11, 12]);
  });

  it('should emit next page on next()', () => {
    component.totalPages.set(10);
    component.page.set(3);
    fixture.detectChanges();
    const spy = vi.fn();
    component.selectPage.subscribe(spy);
    component.next();
    expect(spy).toHaveBeenCalledWith(4);
  });

  it('should not emit below page 1 on prev()', () => {
    component.totalPages.set(10);
    component.page.set(1);
    fixture.detectChanges();
    const spy = vi.fn();
    component.selectPage.subscribe(spy);
    component.prev();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should not emit beyond totalPages on next()', () => {
    component.totalPages.set(5);
    component.page.set(5);
    fixture.detectChanges();
    const spy = vi.fn();
    component.selectPage.subscribe(spy);
    component.next();
    expect(spy).not.toHaveBeenCalled();
  });
});
