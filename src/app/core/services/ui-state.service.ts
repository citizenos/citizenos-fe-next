import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UiStateService {
  showHelp = signal(false);
  showFeedback = signal(false);
  showOnboarding = signal(false);
  showAccessibility = signal(false);

  toggleHelp() {
    this.showHelp.update(v => !v);
  }

  toggleFeedback() {
    this.showFeedback.update(v => !v);
  }

  toggleOnboarding() {
    this.showOnboarding.update(v => !v);
  }

  toggleAccessibility() {
    this.showAccessibility.update(v => !v);
  }
}
