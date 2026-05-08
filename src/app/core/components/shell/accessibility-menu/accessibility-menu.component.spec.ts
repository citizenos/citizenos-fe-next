import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { UiStateService } from '../../../services/ui-state.service';
import { AccessibilityMenuComponent } from './accessibility-menu.component';

const mockUiState = {
  showAccessibility: signal(false),
  accessibility: signal({ contrast: 'default', text: '' }),
};

describe('AccessibilityMenuComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: UiStateService, useValue: mockUiState }
      ]
    });
  });

  it('should create', () => {
    const component = TestBed.runInInjectionContext(() => new AccessibilityMenuComponent());
    expect(component).toBeTruthy();
  });

  it('should expose uiState', () => {
    const component = TestBed.runInInjectionContext(() => new AccessibilityMenuComponent());
    expect(component.uiState).toBe(mockUiState);
  });

  it('setContrast() should update accessibility contrast', () => {
    const component = TestBed.runInInjectionContext(() => new AccessibilityMenuComponent());
    component.setContrast('high_contrast');
    expect(mockUiState.accessibility().contrast).toBe('high_contrast');
  });

  it('setContrast() should preserve other accessibility settings', () => {
    mockUiState.accessibility.set({ contrast: 'default', text: 'large' });
    const component = TestBed.runInInjectionContext(() => new AccessibilityMenuComponent());
    component.setContrast('high_contrast');
    expect(mockUiState.accessibility().text).toBe('large');
  });

  it('setTextSize() should update accessibility text size', () => {
    const component = TestBed.runInInjectionContext(() => new AccessibilityMenuComponent());
    component.setTextSize('extra_large');
    expect(mockUiState.accessibility().text).toBe('extra_large');
  });
});
