import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfigStore } from '../../state/config.store';
import { NavComponent } from './nav/nav.component';
import { GlobalSearchPanelComponent } from './global-search-panel/global-search-panel.component';
import { HelpComponent } from './help/help.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { OnboardingComponent } from './onboarding/onboarding.component';
import { AccessibilityMenuComponent } from './accessibility-menu/accessibility-menu.component';
import { TourComponent } from '../../../shared/components/tour/tour.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    NavComponent,
    GlobalSearchPanelComponent,
    HelpComponent,
    FeedbackComponent,
    OnboardingComponent,
    AccessibilityMenuComponent,
    TourComponent
  ],
  template: `
    <div id="content_root" [class.dark-theme]="configStore.isDarkTheme()">
      <cos-nav />
      <div id="main-content" tabindex="-1">
        <router-outlet></router-outlet>
      </div>
      <cos-global-search-panel></cos-global-search-panel>
      <cos-help></cos-help>
      <cos-feedback></cos-feedback>
      <cos-onboarding></cos-onboarding>
      <cos-accessibility-menu></cos-accessibility-menu>
      <cos-tour></cos-tour>
    </div>
  `,
  styleUrl: './shell.component.scss'
})
export class ShellComponent {
  configStore = inject(ConfigStore);
}
