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

  it('takeTour() on desktop should call tourService.show with dashboard tour and hide onboarding', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1200, writable: true });
    const component = TestBed.runInInjectionContext(() => new OnboardingComponent());
    component.takeTour();
    expect(mockUiState.showOnboarding()).toBe(false);
    expect(mockTourService.show).toHaveBeenCalledWith('dashboard', 1);
  });

  it('takeTour() on tablet should use dashboard_tablet tour', () => {
    Object.defineProperty(window, 'innerWidth', { value: 768, writable: true });
    const component = TestBed.runInInjectionContext(() => new OnboardingComponent());
    component.takeTour();
    expect(mockTourService.show).toHaveBeenCalledWith('dashboard_tablet', 1);
  });

  it('takeTour() on mobile should use dashboard_mobile tour', () => {
    Object.defineProperty(window, 'innerWidth', { value: 400, writable: true });
    const component = TestBed.runInInjectionContext(() => new OnboardingComponent());
    component.takeTour();
    expect(mockTourService.show).toHaveBeenCalledWith('dashboard_mobile', 1);
  });
});
