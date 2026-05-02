import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { UiStateService } from '../../../services/ui-state.service';
import { AccessibilityMenuComponent } from './accessibility-menu.component';

const mockUiState = { showAccessibility: signal(false) };

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
});
