import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
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
import { SiteNotificationComponent } from '../../../shared/components/site-notification/site-notification.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    TourComponent,
    SiteNotificationComponent
  ],
  template: `
    <div id="content_root" [class]="uiState.accessibilityClasses()" [class.dark-theme]="configStore.isDarkTheme()">
      <cos-site-notification></cos-site-notification>
      <cos-nav />
      <div id="main-content" tabindex="-1">
        <router-outlet></router-outlet>
      </div>
      @defer (on idle) {
        <cos-global-search-panel></cos-global-search-panel>
      }
      @defer (on idle) {
        <cos-activity-feed></cos-activity-feed>
      }
      @defer (when uiState.showHelp()) {
        <cos-help></cos-help>
      }
      @defer (when uiState.showFeedback()) {
        <cos-feedback></cos-feedback>
      }
      @defer (when uiState.showOnboarding()) {
        <cos-onboarding></cos-onboarding>
      }
      @defer (when uiState.showAccessibility()) {
        <cos-accessibility-menu></cos-accessibility-menu>
      }
      @defer (on idle) {
        <cos-tour></cos-tour>
      }
    </div>
  `,
  styleUrl: './shell.component.scss'
})
export class ShellComponent {
  configStore = inject(ConfigStore);
  uiState = inject(UiStateService);
}
