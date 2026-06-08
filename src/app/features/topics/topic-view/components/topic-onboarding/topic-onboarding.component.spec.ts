import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { OverlayRef } from '@angular/cdk/overlay';
import { DialogRef } from '../../../../../shared/dialog/dialog-ref';
import { TourService } from '../../../../../core/services/tour.service';
import { TopicOnboardingComponent } from './topic-onboarding.component';

const mockOverlayRef = { dispose: () => { return; } } as unknown as OverlayRef;
const mockTourService = { show: vi.fn() };

describe('TopicOnboardingComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: DialogRef, useValue: new DialogRef() },
        { provide: TourService, useValue: mockTourService },
      ]
    });
  });

  it('should create', () => {
    const component = TestBed.runInInjectionContext(() => new TopicOnboardingComponent());
    expect(component).toBeTruthy();
  });

  it('should call tourService.show with topic tour on desktop', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1200, writable: true });
    const component = TestBed.runInInjectionContext(() => new TopicOnboardingComponent());
    component.takeTour();
    expect(mockTourService.show).toHaveBeenCalledWith('topic', 1);
  });

  it('should call tourService.show with topic_mobile tour on mobile', () => {
    Object.defineProperty(window, 'innerWidth', { value: 800, writable: true });
    const component = TestBed.runInInjectionContext(() => new TopicOnboardingComponent());
    component.takeTour();
    expect(mockTourService.show).toHaveBeenCalledWith('topic_mobile', 1);
  });
});
