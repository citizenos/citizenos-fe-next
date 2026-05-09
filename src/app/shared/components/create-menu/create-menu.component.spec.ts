import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateMenuComponent } from './create-menu.component';
import { Component } from '@angular/core';

@Component({ template: '', standalone: true })
class EmptyComponent {}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).ResizeObserver = class {
  observe() { return; }
  unobserve() { return; }
  disconnect() { return; }
};

describe('CreateMenuComponent', () => {
  let fixture: ComponentFixture<CreateMenuComponent>;
  let component: CreateMenuComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateMenuComponent, TranslateModule.forRoot()],
      providers: [
        provideRouter([{ path: '**', component: EmptyComponent }])
      ]
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.use('en');

    fixture = TestBed.createComponent(CreateMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render all menu items', () => {
    const items = fixture.nativeElement.querySelectorAll('.create_menu_item');
    expect(items.length).toBe(4);
  });

  it('should emit onClose when a menu item is clicked', () => {
    const emitSpy = vi.spyOn(component.closeMenu, 'emit');
    const firstItem = fixture.nativeElement.querySelector('.create_menu_item');
    if (firstItem) {
      firstItem.click();
      expect(emitSpy).toHaveBeenCalled();
    }
  });
});
