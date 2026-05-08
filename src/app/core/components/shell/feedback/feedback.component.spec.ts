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
const mockHttp = { post: vi.fn().mockReturnValue({ subscribe: vi.fn(({ next }) => next && next()) }) };
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

  it('submitFeedback() should set error when message is empty', () => {
    const component = TestBed.runInInjectionContext(() => new FeedbackComponent());
    component.message = '';
    component.submitFeedback();
    expect(component.error()).toBe(true);
    expect(mockHttp.post).not.toHaveBeenCalled();
  });

  it('submitFeedback() should call http.post with message when message is set', () => {
    const component = TestBed.runInInjectionContext(() => new FeedbackComponent());
    component.message = 'Great app!';
    component.submitFeedback();
    expect(mockHttp.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/internal/feedback'),
      expect.objectContaining({ message: expect.stringContaining('Great app!') }),
      expect.any(Object)
    );
  });

  it('submitFeedback() should set isSubmitted to true on success', () => {
    const component = TestBed.runInInjectionContext(() => new FeedbackComponent());
    component.message = 'Test feedback';
    component.submitFeedback();
    expect(component.isSubmitted()).toBe(true);
  });
});
