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

  it('should apply custom class to the container', () => {
    component.totalPages.set(10);
    fixture.componentRef.setInput('class', 'ideation');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.pagination.ideation')).toBeTruthy();
  });

  it('should compute all pages when total <= 5', () => {
    component.totalPages.set(5);
    component.page.set(1);
    fixture.detectChanges();
    expect(component.pages()).toEqual([1, 2, 3, 4, 5]);
  });

  it('should emit selection via aliased select output', () => {
    component.totalPages.set(10);
    component.page.set(3);
    fixture.detectChanges();
    const spy = vi.fn();
    component.selectPage.subscribe(spy);
    component.doSelect(5);
    expect(spy).toHaveBeenCalledWith(5);
    expect(component.page()).toBe(5);
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

  it('should use legacy class names in template', () => {
    component.totalPages.set(10);
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('button.btn_medium_pagination');
    expect(buttons.length).toBeGreaterThan(0);
  });
});
