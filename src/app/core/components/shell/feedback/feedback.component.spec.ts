import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UiStateService } from '../../../services/ui-state.service';
import { ConfigStore } from '../../../state/config.store';
import { NotificationService } from '../../../services/notification.service';
import { FeedbackComponent } from './feedback.component';

const mockUiState = { showFeedback: signal(false) };
const mockConfigStore = { api: { baseUrl: signal('http://test') } };
const mockNotification = { showRaw: vi.fn() };
const mockHttp = { post: vi.fn() };
const mockTranslate = { instant: vi.fn((k: string) => k), currentLang: 'en', onLangChange: { subscribe: vi.fn() } };

describe('FeedbackComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: UiStateService, useValue: mockUiState },
        { provide: ConfigStore, useValue: mockConfigStore },
        { provide: NotificationService, useValue: mockNotification },
        { provide: HttpClient, useValue: mockHttp },
        { provide: TranslateService, useValue: mockTranslate }
      ]
    });
  });

  it('should create', () => {
    const component = TestBed.runInInjectionContext(() => new FeedbackComponent());
    expect(component).toBeTruthy();
  });

  it('should expose uiState', () => {
    const component = TestBed.runInInjectionContext(() => new FeedbackComponent());
    expect(component.uiState).toBe(mockUiState);
  });
});
