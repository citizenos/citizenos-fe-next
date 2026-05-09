import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CosTabsComponent, TabItem } from './tabs.component';
import { TranslateModule } from '@ngx-translate/core';
import { Component, Input } from '@angular/core';

@Component({ selector: 'cos-icon', standalone: true, template: '' })
class MockIconComponent { @Input() name = ''; @Input() size: string | number = 24; }

const TABS: TabItem[] = [
  { id: 'tab1', label: 'TAB_ONE' },
  { id: 'tab2', label: 'TAB_TWO', icon: 'home' },
];

describe('CosTabsComponent', () => {
  let component: CosTabsComponent;
  let fixture: ComponentFixture<CosTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CosTabsComponent, TranslateModule.forRoot()]
    })
    .overrideComponent(CosTabsComponent, {
      set: { imports: [TranslateModule, MockIconComponent] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(CosTabsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('tabs', TABS);
    fixture.componentRef.setInput('activeTab', 'tab1');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render one tab item per tab', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelectorAll('.tab_item').length).toBe(2);
  });

  it('should apply active class to current tab', () => {
    const el: HTMLElement = fixture.nativeElement;
    const active = el.querySelector('.tab_item.active');
    expect(active).toBeTruthy();
  });

  it('should emit select when tab clicked', () => {
    const spy = vi.fn();
    component.selectTab.subscribe(spy);
    const el: HTMLElement = fixture.nativeElement;
    const tabs = el.querySelectorAll<HTMLElement>('.tab_item');
    tabs[1].click();
    expect(spy).toHaveBeenCalledWith('tab2');
  });

  it('should render icon when tab has icon', () => {
    const el: HTMLElement = fixture.nativeElement;
    const iconTabs = el.querySelectorAll('cos-icon');
    expect(iconTabs.length).toBe(1);
  });

  it('should not render icon when tab has no icon', () => {
    const el: HTMLElement = fixture.nativeElement;
    const firstTab = el.querySelectorAll('.tab_item')[0];
    expect(firstTab.querySelector('cos-icon')).toBeFalsy();
  });
});
