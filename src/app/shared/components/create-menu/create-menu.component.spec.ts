import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateMenuComponent } from './create-menu.component';

(globalThis as any).ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('CreateMenuComponent', () => {
  let fixture: ComponentFixture<CreateMenuComponent>;
  let component: CreateMenuComponent;
  let translateServiceMock: any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateMenuComponent, TranslateModule.forRoot()],
      providers: [
        provideRouter([])
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
    const emitSpy = vi.spyOn(component.onClose, 'emit');
    const firstItem = fixture.nativeElement.querySelector('.create_menu_item');
    if (firstItem) {
      firstItem.click();
      expect(emitSpy).toHaveBeenCalled();
    }
  });
});
