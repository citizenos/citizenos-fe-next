import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TypeaheadComponent, TypeaheadItemData, TypeaheadItemDirective, TypeaheadSelectDirective } from './typeahead.component';
import { TranslateModule } from '@ngx-translate/core';
import { Component } from '@angular/core';

@Component({
  standalone: true,
  imports: [TypeaheadComponent, TypeaheadItemDirective, TypeaheadSelectDirective],
  template: `
    <cos-typeahead [label]="'Search'" (search)="onSearch($event)" (select)="onSelect($event)">
      @for (item of items; track item.id) {
        <div [typeaheadItem]="item" [typeaheadSelect]="item" class="test-item">{{ item['name'] }}</div>
      }
    </cos-typeahead>
  `
})
class TestHostComponent {
  items: TypeaheadItemData[] = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' }
  ];
  onSearch = vi.fn();
  onSelect = vi.fn();
}

describe('TypeaheadComponent', () => {
  let component: TypeaheadComponent;
  let fixture: ComponentFixture<TypeaheadComponent>;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [TypeaheadComponent, TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TypeaheadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with empty term', () => {
    expect(component.term()).toBe('');
  });

  it('should emit search on onQuery()', () => {
    const spy = vi.fn();
    component.search.subscribe(spy);
    component.term.set('alice');
    component.onQuery();
    expect(spy).toHaveBeenCalledWith('alice');
  });

  it('should set focused on onFocus()', () => {
    component.onFocus();
    expect(component.focused()).toBe(true);
  });

  it('should clear term and emit select on doSelect()', () => {
    const spy = vi.fn();
    component.select.subscribe(spy);
    component.term.set('test');
    const item: TypeaheadItemData = { id: '1', name: 'Alice' };
    component.doSelect(item);
    expect(spy).toHaveBeenCalledWith(item);
    expect(component.term()).toBe('');
  });

  it('should emit enterAction on doEnterAction()', () => {
    const spy = vi.fn();
    component.enterAction.subscribe(spy);
    component.term.set('multi word');
    component.doEnterAction();
    expect(spy).toHaveBeenCalledWith({ text: 'multi word', limit: true });
  });

  it('should register items via registerItem()', () => {
    const item: TypeaheadItemData = { id: 'a', name: 'Alice' };
    component.registerItem(item);
    expect(component.items()).toHaveLength(1);
  });

  it('should show enter hint for multi-word input', () => {
    component.term.set('hello world');
    component.onQuery();
    expect(component.showEnterHint()).toBe(true);
  });

  it('should not show enter hint for single word', () => {
    component.term.set('hello');
    component.onQuery();
    expect(component.showEnterHint()).toBe(false);
  });

  it('should render input element', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('input')).toBeTruthy();
  });

  it('should handle keyboard navigation (ArrowDown)', () => {
    const item1: TypeaheadItemData = { id: 1, name: 'Item 1' };
    const item2: TypeaheadItemData = { id: 2, name: 'Item 2' };
    component.registerItem(item1);
    component.registerItem(item2);

    component.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    expect(component.active()).toEqual(item1);

    component.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    expect(component.active()).toEqual(item2);

    component.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    expect(component.active()).toEqual(item1); // Wrap around
  });

  it('should handle keyboard navigation (ArrowUp)', () => {
    const item1: TypeaheadItemData = { id: 1, name: 'Item 1' };
    const item2: TypeaheadItemData = { id: 2, name: 'Item 2' };
    component.registerItem(item1);
    component.registerItem(item2);

    component.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    expect(component.active()).toEqual(item2); // Wrap around to last

    component.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    expect(component.active()).toEqual(item1);
  });

  it('should select active item on Enter key', () => {
    const item: TypeaheadItemData = { id: 1, name: 'Item 1' };
    component.registerItem(item);
    component.activate(item);
    const spy = vi.fn();
    component.select.subscribe(spy);

    component.onKeyup(new KeyboardEvent('keyup', { key: 'Enter' }));
    expect(spy).toHaveBeenCalledWith(item);
  });

  it('should reset on Escape key', () => {
    component.term.set('searching...');
    component.registerItem({ id: 1, name: 'Item 1' });

    component.onKeyup(new KeyboardEvent('keyup', { key: 'Escape' }));
    expect(component.term()).toBe('');
    expect(component.items()).toHaveLength(0);
  });

  it('should handle blur with delay', async () => {
    component.onFocus();
    expect(component.focused()).toBe(true);
    component.onBlur();
    expect(component.focused()).toBe(true); // Still true before timeout
    await new Promise(resolve => setTimeout(resolve, 200));
    expect(component.focused()).toBe(false);
  });

  describe('Integration with directives', () => {
    let hostComponent: TestHostComponent;
    let hostFixture: ComponentFixture<TestHostComponent>;

    beforeEach(async () => {
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [TestHostComponent, TranslateModule.forRoot()]
      }).compileComponents();

      hostFixture = TestBed.createComponent(TestHostComponent);
      hostComponent = hostFixture.componentInstance;
      hostFixture.detectChanges();
    });

    it('should register items through TypeaheadItemDirective', () => {
      const typeahead = hostFixture.debugElement.query(p => p.componentInstance instanceof TypeaheadComponent).componentInstance as TypeaheadComponent;
      expect(typeahead.items()).toHaveLength(2);
    });

    it('should activate item on mouseover', () => {
      const typeahead = hostFixture.debugElement.query(p => p.componentInstance instanceof TypeaheadComponent).componentInstance as TypeaheadComponent;
      const itemEl = hostFixture.nativeElement.querySelector('.test-item');
      itemEl.dispatchEvent(new MouseEvent('mouseover'));
      expect(typeahead.active()).toEqual(hostComponent.items[0]);
    });

    it('should select item on click', () => {
      const typeahead = hostFixture.debugElement.query(p => p.componentInstance instanceof TypeaheadComponent).componentInstance as TypeaheadComponent;
      const spy = vi.fn();
      typeahead.select.subscribe(spy);
      const itemEl = hostFixture.nativeElement.querySelector('.test-item');
      itemEl.click();
      expect(spy).toHaveBeenCalledWith(hostComponent.items[0]);
    });
  });
});
