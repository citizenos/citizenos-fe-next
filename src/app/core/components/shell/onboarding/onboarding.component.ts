import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TourService } from '../../../services/tour.service';
import { UiStateService } from '../../../services/ui-state.service';
import { UserStore } from '../../../state/user.store';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'cos-onboarding',
  standalone: true,
  imports: [CommonModule, TranslateModule, IconComponent],
  template: `
    @if (uiState.showOnboarding()) {
      <div id="onboarding_wrap">
        <div class="onboarding_content">
          <button class="onboarding_close" (click)="uiState.showOnboarding.set(false)">
            <cos-icon name="close" [size]="24"></cos-icon>
          </button>
          
          <div class="onboarding_icon_wrap">
             <div class="illustration_onboarding"></div>
          </div>

          <div class="onboarding_text">
            <h2 translate="COMPONENTS.ONBOARDING.HEADING"></h2>
            <p translate="COMPONENTS.ONBOARDING.TEXT"></p>
          </div>

          <div class="onboarding_actions">
            <button class="btn_big_submit" (click)="takeTour()" translate="COMPONENTS.ONBOARDING.BTN_TOUR"></button>
            <button class="btn_big_submit_ghost" (click)="uiState.showOnboarding.set(false)" translate="COMPONENTS.ONBOARDING.BTN_SKIP"></button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    #onboarding_wrap {
      position: fixed;
      inset: 0;
      z-index: 1000;
      background: rgba(44, 59, 71, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .onboarding_content {
      background: var(--color-background);
      width: 100%;
      max-width: 500px;
      padding: 40px;
      border-radius: 12px;
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 24px;
    }

    .onboarding_close {
      position: absolute;
      top: 16px;
      right: 16px;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--color-text-muted);
    }

    .onboarding_icon_wrap {
      width: 120px;
      height: 120px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .illustration_onboarding {
       width: 100%;
       height: 100%;
       background-image: url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='120' height='120' rx='60' fill='%23A7D1F3'/%3E%3Cpath d='M60 30L80 50H40L60 30Z' fill='white'/%3E%3Crect x='45' y='50' width='30' height='40' fill='white'/%3E%3C/svg%3E");
       background-repeat: no-repeat;
       background-position: center;
    }

    .onboarding_text h2 {
      margin-bottom: 12px;
      font-size: 24px;
      font-weight: 700;
    }

    .onboarding_text p {
      color: var(--color-text-muted);
      line-height: 1.6;
    }

    .onboarding_actions {
      display: flex;
      flex-direction: column;
      width: 100%;
      gap: 12px;
    }

    .btn_big_submit, .btn_big_submit_ghost {
      width: 100%;
      padding: 14px;
      font-size: 16px;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      border: none;
    }

    .btn_big_submit {
      background: var(--color-primary);
      color: white;
    }

    .btn_big_submit_ghost {
      background: transparent;
      color: var(--color-primary);
      border: 1px solid var(--color-primary);
    }
  `]
})
export class OnboardingComponent {
  private tourService = inject(TourService);
  public uiState = inject(UiStateService);
  public auth = inject(UserStore);

  takeTour() {
    this.uiState.showOnboarding.set(false);
    let tour = 'dashboard';
    const width = window.innerWidth;
    if (width <= 1024 && width > 560) {
      tour = 'dashboard_tablet';
    } else if (width < 560) {
      tour = 'dashboard_mobile';
    }
    this.tourService.show(tour, 1);
  }
}
