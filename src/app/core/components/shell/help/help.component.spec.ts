import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UiStateService } from '../../../services/ui-state.service';
import { ConfigStore } from '../../../state/config.store';
import { NotificationService } from '../../../services/notification.service';
import { TourService } from '../../../services/tour.service';
import { HelpComponent } from './help.component';

@Component({ template: '', standalone: true })
class EmptyComponent {}

const mockUiState = { showHelp: signal(false) };
const mockConfigStore = { api: { baseUrl: signal('http://test') }, links: { help: signal({ en: 'http://help.test' }) } };
const mockNotification = { showRaw: vi.fn() };
const mockTourService = { show: vi.fn() };
const mockHttp = { post: vi.fn(), get: vi.fn() };
const mockSanitizer = { bypassSecurityTrustResourceUrl: vi.fn((url: string) => url) };
const mockTranslate = { instant: vi.fn((k: string) => k), currentLang: 'en', onLangChange: { subscribe: vi.fn() } };

describe('HelpComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        provideRouter([{ path: '**', component: EmptyComponent }]),
        { provide: UiStateService, useValue: mockUiState },
        { provide: ConfigStore, useValue: mockConfigStore },
        { provide: NotificationService, useValue: mockNotification },
        { provide: TourService, useValue: mockTourService },
        { provide: HttpClient, useValue: mockHttp },
        { provide: DomSanitizer, useValue: mockSanitizer },
        { provide: TranslateService, useValue: mockTranslate }
      ]
    });
  });

  it('should create', () => {
    const component = TestBed.runInInjectionContext(() => new HelpComponent());
    expect(component).toBeTruthy();
  });

  it('toggleHelp() should set showHelp to true when it was false', () => {
    mockUiState.showHelp.set(false);
    const component = TestBed.runInInjectionContext(() => new HelpComponent());
    component.toggleHelp();
    expect(mockUiState.showHelp()).toBe(true);
  });

  it('toggleHelp() should set showHelp to false when it was true', () => {
    mockUiState.showHelp.set(true);
    const component = TestBed.runInInjectionContext(() => new HelpComponent());
    component.toggleHelp();
    expect(mockUiState.showHelp()).toBe(false);
  });

  it('startTour() should toggle help closed', () => {
    mockUiState.showHelp.set(true);
    const component = TestBed.runInInjectionContext(() => new HelpComponent());
    component.startTour();
    expect(mockUiState.showHelp()).toBe(false);
  });
});
