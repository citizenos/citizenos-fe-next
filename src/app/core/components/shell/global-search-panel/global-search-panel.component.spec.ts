import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { Component } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { GlobalSearchService } from '../../../services/global-search.service';
import { SearchService } from '../../../services/search.service';
import { UserStore } from '../../../state/user.store';
import { ConfigStore } from '../../../state/config.store';
import { UiStateService } from '../../../services/ui-state.service';
import { GlobalSearchPanelComponent } from './global-search-panel.component';

@Component({ template: '', standalone: true })
class EmptyComponent {}

const mockGlobalSearch = { showSearch: signal(false) };
const mockSearchService = { search: vi.fn() };
const mockUserStore = { isAuthenticated: signal(false), user: signal(null) };
const mockConfigStore = { links: { donate: signal({ en: 'http://donate.test' }) } };
const mockUiState = {};
const mockTranslate = { instant: vi.fn((k: string) => k), currentLang: 'en', onLangChange: { subscribe: vi.fn() } };

describe('GlobalSearchPanelComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        provideRouter([{ path: '**', component: EmptyComponent }]),
        { provide: GlobalSearchService, useValue: mockGlobalSearch },
        { provide: SearchService, useValue: mockSearchService },
        { provide: UserStore, useValue: mockUserStore },
        { provide: ConfigStore, useValue: mockConfigStore },
        { provide: UiStateService, useValue: mockUiState },
        { provide: TranslateService, useValue: mockTranslate }
      ]
    });
  });

  it('should create', () => {
    const component = TestBed.runInInjectionContext(() => new GlobalSearchPanelComponent());
    expect(component).toBeTruthy();
  });

  it('should expose globalSearch service', () => {
    const component = TestBed.runInInjectionContext(() => new GlobalSearchPanelComponent());
    expect(component.globalSearch).toBe(mockGlobalSearch);
  });

  it('should initialize with empty searchInput', () => {
    const component = TestBed.runInInjectionContext(() => new GlobalSearchPanelComponent());
    expect(component.searchInput()).toBe('');
  });
});
