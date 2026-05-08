import { Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { UiStateService } from '../../../services/ui-state.service';
import { TourService } from '../../../services/tour.service';
import { UserStore } from '../../../state/user.store';

@Component({
  selector: 'cos-onboarding',
  standalone: true,
  imports: [TranslateModule],
  template: `
    @if (uiState.showOnboarding()) {
      <div class="feedback_overlay_root">
        <div class="dialog_wrap">
          <div class="dialog">
            <div class="dialog_header">
              <div class="header_image">
                <svg width="61" height="114" viewBox="0 0 61 114" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M46.7719 33.1501C46.7719 41.7481 40.0655 48.7186 31.7925 48.7186C23.5194 48.7186 16.8131 41.7481 16.8131 33.1501C16.8131 24.5521 23.5194 17.5815 31.7925 17.5815C40.0655 17.5815 46.7719 24.5521 46.7719 33.1501Z" fill="#2C3B47"/>
                  <path d="M12.6875 64.0156L47.0375 59.5356L32.0233 132.99C30.9583 138.298 32.4583 141.311 36.5833 141.311C39.4933 141.311 43.8733 140.218 46.8733 137.47L45.5533 143.965C41.2483 149.366 31.7533 153.301 23.5783 153.301C13.0333 153.301 8.54833 146.712 11.4583 132.709L22.5283 78.5668C23.4883 73.9922 22.6183 72.3371 18.2083 71.2443L11.4583 69.9486L12.6875 64.0156Z" fill="#2C3B47"/>
                </svg>
              </div>
              <div class="header_line_bottom"></div>
            </div>
            <div class="dialog_content">
              <div class="title_wrap">
                <div id="hello" translate="MODALS.ONBOARDING_HELLO" [translateParams]="{name: userStore.user()?.name}"></div>
                <div id="title" translate="MODALS.ONBOARDING_TITLE"></div>
              </div>
              <div class="content" translate="MODALS.ONBOARDING_CONTENT"></div>
              <div class="button_wrap">
                <button class="btn_big_submit" type="button" (click)="takeTour()">{{ 'MODALS.ONBOARDING_BTN_TOUR' | translate }}</button>
              </div>
              <div class="button_wrap">
                <button type="button" class="btn_link blue_link" (click)="uiState.showOnboarding.set(false)">{{ 'MODALS.ONBOARDING_LNK_SKIP' | translate }}</button>
              </div>
            </div>
          </div>
        </div>
        <div id="close_lightbox" role="button" [attr.aria-label]="'CONTROL.CLOSE' | translate" tabindex="0" (click)="uiState.showOnboarding.set(false)" (keydown.enter)="uiState.showOnboarding.set(false)"></div>
      </div>
    }
  `,
  styles: [`
    @use "mixins";

    .feedback_overlay_root {
      position: fixed;
      inset: 0;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(44, 59, 71, 0.8);
    }

    .dialog_wrap {
      z-index: 10000;
      position: relative;
    }

    .dialog {
      background: white;
      width: 560px;
      max-width: 90vw;
      border-radius: 16px;
      overflow: hidden;
      display: flex;
      flex-direction: column;

      .dialog_header {
        background-color: #ffefd6;
        height: 160px;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        align-items: center;
        position: relative;

        .header_image {
          margin-bottom: -10px;
        }

        .header_line_bottom {
          width: 100%;
          height: 4px;
          background: linear-gradient(90deg, #fca997 0.02%, #eabfbc 34.65%, #ffefd6 66.94%, #f9e1a7 100%);
        }
      }

      .dialog_content {
        padding: 32px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 24px;

        .title_wrap {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        #hello {
          font-weight: 600;
          font-size: 14px;
          color: #727c84;
        }

        #title {
          font-size: 24px;
          font-weight: 600;
          color: #2c3b47;
        }

        .content {
          font-size: 16px;
          line-height: 24px;
          color: #4d5c6a;
        }

        .button_wrap {
          width: 100%;
          display: flex;
          justify-content: center;

          button {
            width: 100%;
            max-width: 300px;
            padding: 12px 24px;
            background: #1168a8;
            color: white;
            border: none;
            border-radius: 40px;
            font-weight: 600;
            cursor: pointer;

            &:hover {
              background: #0d5489;
            }
          }
        }

        .blue_link {
          color: #1168a8;
          cursor: pointer;
          font-weight: 600;
          text-decoration: none;

          &:hover {
            text-decoration: underline;
          }
        }
      }
    }

    #close_lightbox {
      position: absolute;
      inset: 0;
      z-index: 9999;
    }
  `]
})
export class OnboardingComponent {
  public uiState = inject(UiStateService);
  public userStore = inject(UserStore);
  private tourService = inject(TourService);

  takeTour() {
    this.uiState.showOnboarding.set(false);
    let tour = 'dashboard';
    if (window.innerWidth <= 1024 && window.innerWidth > 560) {
      tour = 'dashboard_tablet';
    } else if (window.innerWidth < 560) {
      tour = 'dashboard_mobile';
    }
    this.tourService.show(tour, 1);
  }
}
