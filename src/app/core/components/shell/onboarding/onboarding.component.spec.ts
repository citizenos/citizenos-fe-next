import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { UiStateService } from '../../../services/ui-state.service';
import { TourService } from '../../../services/tour.service';
import { UserStore } from '../../../state/user.store';
import { OnboardingComponent } from './onboarding.component';

const mockUiState = { showOnboarding: signal(false) };
const mockTourService = { show: vi.fn() };
const mockUserStore = { user: signal(null) };

describe('OnboardingComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: UiStateService, useValue: mockUiState },
        { provide: TourService, useValue: mockTourService },
        { provide: UserStore, useValue: mockUserStore }
      ]
    });
  });

  it('should create', () => {
    const component = TestBed.runInInjectionContext(() => new OnboardingComponent());
    expect(component).toBeTruthy();
  });

  it('should call tourService.show and hide onboarding on takeTour (desktop)', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1200, writable: true });
    const component = TestBed.runInInjectionContext(() => new OnboardingComponent());
    component.takeTour();
    expect(mockUiState.showOnboarding()).toBe(false);
    expect(mockTourService.show).toHaveBeenCalledWith('dashboard', 1);
  });
});
