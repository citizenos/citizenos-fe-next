import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UiStateService {
  showHelp = signal(false);
  showFeedback = signal(false);
  showOnboarding = signal(false);
  showAccessibility = signal(false);
  onboardingContext = signal<'dashboard' | 'topic'>('dashboard');

  accessibility = signal({
    contrast: 'default',
    text: ''
  });

  accessibilityClasses = computed(() => {
    const acc = this.accessibility();
    const classes: string[] = [];
    if (acc.contrast && acc.contrast !== 'default') classes.push(acc.contrast);
    if (acc.text) classes.push(acc.text);
    return classes.join(' ');
  });

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
