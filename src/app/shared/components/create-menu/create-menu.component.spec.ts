import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateMenuComponent } from './create-menu.component';
import { of } from 'rxjs';

describe('CreateMenuComponent', () => {
  let fixture: ComponentFixture<CreateMenuComponent>;
  let component: CreateMenuComponent;
  let translateServiceMock: any;

  beforeEach(async () => {
    translateServiceMock = {
      currentLang: 'en',
      get: vi.fn().mockImplementation((key: string) => of(key)),
      onLangChange: of({ lang: 'en', translations: {} }),
      onTranslationChange: of({ lang: 'en', translations: {} }),
      onDefaultLangChange: of({ lang: 'en', translations: {} }),
      getTranslation: vi.fn().mockReturnValue(of({})),
      use: vi.fn().mockReturnValue(of({})),
      instant: vi.fn().mockImplementation((key: string) => key)
    };

    await TestBed.configureTestingModule({
      imports: [CreateMenuComponent],
      providers: [
        provideRouter([]),
        { provide: TranslateService, useValue: translateServiceMock }
      ]
    }).compileComponents();

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
