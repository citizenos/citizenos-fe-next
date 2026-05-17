import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfigStore } from '../../state/config.store';
import { NavComponent } from './nav/nav.component';
import { GlobalSearchPanelComponent } from './global-search-panel/global-search-panel.component';
import { ActivityFeedComponent } from '../activity-feed/activity-feed.component';
import { HelpComponent } from './help/help.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { OnboardingComponent } from './onboarding/onboarding.component';
import { AccessibilityMenuComponent } from './accessibility-menu/accessibility-menu.component';
import { UiStateService } from '../../services/ui-state.service';
import { TourComponent } from '../../../shared/components/tour/tour.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    NavComponent,
    GlobalSearchPanelComponent,
    ActivityFeedComponent,
    HelpComponent,
    FeedbackComponent,
    OnboardingComponent,
    AccessibilityMenuComponent,
    TourComponent
  ],
  template: `
    <div id="content_root" [class]="uiState.accessibilityClasses()" [class.dark-theme]="configStore.isDarkTheme()">
      <cos-nav />
      <div id="main-content" tabindex="-1">
        <router-outlet></router-outlet>
      </div>
      <cos-global-search-panel></cos-global-search-panel>
      <cos-activity-feed></cos-activity-feed>
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
  uiState = inject(UiStateService);
}
