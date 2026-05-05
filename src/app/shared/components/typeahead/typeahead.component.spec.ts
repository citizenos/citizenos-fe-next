import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TypeaheadComponent, TypeaheadItem } from './typeahead.component';
import { TranslateModule } from '@ngx-translate/core';

describe('TypeaheadComponent', () => {
  let component: TypeaheadComponent;
  let fixture: ComponentFixture<TypeaheadComponent>;

  beforeEach(async () => {
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
    const item: TypeaheadItem = { id: '1', name: 'Alice' };
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
    const item: TypeaheadItem = { id: 'a', name: 'Alice' };
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

  it('should render label when provided', async () => {
    fixture.componentRef.setInput('label', 'Search users');
    fixture.detectChanges();
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.typeahead-label')?.textContent?.trim()).toBe('Search users');
  });
});
