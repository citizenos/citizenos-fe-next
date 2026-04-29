import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentRef } from '@angular/core';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TranslateModule } from '@ngx-translate/core';
import { PaginationComponent } from './pagination.component';

describe('PaginationComponent', () => {
  let fixture: ComponentFixture<PaginationComponent>;
  let component: PaginationComponent;
  let ref: ComponentRef<PaginationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PaginationComponent, TranslateModule.forRoot()] }).compileComponents();
    fixture = TestBed.createComponent(PaginationComponent);
    ref = fixture.componentRef;
    component = fixture.componentInstance;
  });

  it('should render pagination when totalPages > 1', () => {
    ref.setInput('totalPages', 10);
    ref.setInput('page', 1);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.pagination')).toBeTruthy();
  });

  it('should not render when totalPages <= 1', () => {
    ref.setInput('totalPages', 1);
    ref.setInput('page', 1);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.pagination')).toBeNull();
  });

  it('should compute all pages when total <= 5', () => {
    ref.setInput('totalPages', 5);
    ref.setInput('page', 1);
    fixture.detectChanges();
    expect(component.pages()).toEqual([1, 2, 3, 4, 5]);
  });

  it('should show pages 1-5 when current page < 4', () => {
    ref.setInput('totalPages', 20);
    ref.setInput('page', 2);
    fixture.detectChanges();
    expect(component.pages()).toEqual([1, 2, 3, 4, 5]);
  });

  it('should center 5 pages around current page in the middle', () => {
    ref.setInput('totalPages', 20);
    ref.setInput('page', 10);
    fixture.detectChanges();
    expect(component.pages()).toEqual([8, 9, 10, 11, 12]);
  });

  it('should emit next page on next()', () => {
    ref.setInput('totalPages', 10);
    ref.setInput('page', 3);
    fixture.detectChanges();
    const spy = vi.fn();
    component.select.subscribe(spy);
    component.next();
    expect(spy).toHaveBeenCalledWith(4);
  });

  it('should not emit below page 1 on prev()', () => {
    ref.setInput('totalPages', 10);
    ref.setInput('page', 1);
    fixture.detectChanges();
    const spy = vi.fn();
    component.select.subscribe(spy);
    component.prev();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should not emit beyond totalPages on next()', () => {
    ref.setInput('totalPages', 5);
    ref.setInput('page', 5);
    fixture.detectChanges();
    const spy = vi.fn();
    component.select.subscribe(spy);
    component.next();
    expect(spy).not.toHaveBeenCalled();
  });
});
