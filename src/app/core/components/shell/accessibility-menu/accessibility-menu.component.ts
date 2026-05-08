import { Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { UiStateService } from '../../../services/ui-state.service';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'cos-accessibility-menu',
  standalone: true,
  imports: [TranslateModule, IconComponent],
  template: `
    @if (uiState.showAccessibility()) {
      <div class="feedback_overlay_root">
        <div class="dialog_wrap">
          <div class="dialog">
            <div class="dialog_header">
              <div class="header_text">
                <h4 class="title" translate="COMPONENTS.ACCESSIBILITY.MODAL_HEADING"></h4>
                <div class="dialog_close">
                  <button class="btn_dialog_close" (click)="uiState.showAccessibility.set(false)">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="#2C3B47"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div class="dialog_content">
              <div class="accessibility_options_wrap">
                <h4 translate="COMPONENTS.ACCESSIBILITY.HEADING_CONTRAST"></h4>

                <div class="radio_wrap" (click)="setContrast('default')">
                  <div class="radio_text_wrap">
                    <div class="radio_lable_wrap">
                      <label class="radio_box">
                        <input type="radio" [checked]="uiState.accessibility().contrast === 'default'" name="contrast" value="default">
                        <span class="radio"></span>
                        <div class="radio_lable" translate="COMPONENTS.ACCESSIBILITY.OPT_CONTRAST_DEFAULT"></div>
                      </label>
                    </div>
                  </div>
                  <div class="radio_icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="3" width="9" height="9" fill="#5C9CD0" />
                      <rect x="3" y="12" width="9" height="9" fill="#E9D519" />
                      <rect x="12" y="3" width="9" height="9" fill="#DA7AB1" />
                      <rect x="12" y="12" width="9" height="9" fill="#5AB467" />
                      <rect x="0.5" y="0.5" width="23" height="23" rx="2.5" stroke="#2C3B47" />
                    </svg>
                  </div>
                </div>
                
                <div class="radio_wrap" (click)="setContrast('high_contrast')">
                  <div class="radio_text_wrap">
                    <div class="radio_lable_wrap">
                      <label class="radio_box">
                        <input type="radio" [checked]="uiState.accessibility().contrast === 'high_contrast'" name="contrast" value="high_contrast">
                        <span class="radio"></span>
                        <div class="radio_lable" translate="COMPONENTS.ACCESSIBILITY.OPT_CONTRAST_HIGH"></div>
                      </label>
                    </div>
                  </div>
                  <div class="radio_icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="3" width="9" height="18" fill="#2C3B47" />
                      <rect x="12" y="3" width="9" height="18" fill="#FFF500" />
                      <rect x="0.5" y="0.5" width="23" height="23" rx="2.5" stroke="#2C3B47" />
                    </svg>
                  </div>
                </div>

                <h4 translate="COMPONENTS.ACCESSIBILITY.HEADING_TEXT_SIZE"></h4>

                <div class="radio_wrap" (click)="setTextSize('')">
                  <div class="radio_text_wrap">
                    <div class="radio_lable_wrap">
                      <label class="radio_box">
                        <input type="radio" [checked]="uiState.accessibility().text === ''" name="textSize" value="">
                        <span class="radio"></span>
                        <div class="radio_lable" translate="COMPONENTS.ACCESSIBILITY.OPT_TEXT_SIZE_DEFAULT"></div>
                      </label>
                    </div>
                  </div>
                  <div class="radio_icon">
                    <div class="icon_text_size text_default">A</div>
                  </div>
                </div>

                <div class="radio_wrap" (click)="setTextSize('large')">
                  <div class="radio_text_wrap">
                    <div class="radio_lable_wrap">
                      <label class="radio_box">
                        <input type="radio" [checked]="uiState.accessibility().text === 'large'" name="textSize" value="large">
                        <span class="radio"></span>
                        <div class="radio_lable" translate="COMPONENTS.ACCESSIBILITY.OPT_TEXT_SIZE_LARGE"></div>
                      </label>
                    </div>
                  </div>
                  <div class="radio_icon">
                    <div class="icon_text_size large">A</div>
                  </div>
                </div>

                <div class="radio_wrap" (click)="setTextSize('extra_large')">
                  <div class="radio_text_wrap">
                    <div class="radio_lable_wrap">
                      <label class="radio_box">
                        <input type="radio" [checked]="uiState.accessibility().text === 'extra_large'" name="textSize" value="extra_large">
                        <span class="radio"></span>
                        <div class="radio_lable" translate="COMPONENTS.ACCESSIBILITY.OPT_TEXT_SIZE_EXTRA_LARGE"></div>
                      </label>
                    </div>
                  </div>
                  <div class="radio_icon">
                    <div class="icon_text_size extra_large">A</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="dialog_info_wrap">
              <div class="dialog_info">
                <div class="bold" translate="COMPONENTS.ACCESSIBILITY.HEADING_HAVING_ISSUES"></div>
                <div class="row">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 12V14L19 11.5L15 9V11H6V12H15Z" fill="#2C3B47" />
                  </svg>
                  <a href="https://citizenos.com/contact/" target="_blank" translate="COMPONENTS.ACCESSIBILITY.READ_STATEMENT"></a>
                </div>
                <div class="row">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 12V14L19 11.5L15 9V11H6V12H15Z" fill="#2C3B47" />
                  </svg>
                  <a href="https://citizenos.com/contact/" target="_blank" translate="COMPONENTS.ACCESSIBILITY.CONTACT_US"></a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div id="close_lightbox" (click)="uiState.showAccessibility.set(false)"></div>
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
    }

    .dialog_header {
      padding: 16px 24px;
      background: #f1f7fc;
      border-bottom: 1px solid #ddd;
    }

    .header_text {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .title {
      font-size: 18px;
      font-weight: 600;
      margin: 0;
    }

    .btn_dialog_close {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
    }

    .accessibility_options_wrap {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;

      h4 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }
    }

    .radio_wrap {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      border: 1px solid #eee;
      border-radius: 8px;
      cursor: pointer;

      &:hover {
        background: #f9f9f9;
      }
    }

    .radio_box {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
    }

    .radio_lable {
      font-size: 14px;
    }

    .icon_text_size {
      font-weight: 600;
      &.text_default { font-size: 14px; }
      &.large { font-size: 18px; }
      &.extra_large { font-size: 24px; }
    }

    .dialog_info_wrap {
      padding: 16px 24px;
      background: #f9f9f9;
      border-top: 1px solid #eee;
    }

    .dialog_info {
      display: flex;
      flex-direction: column;
      gap: 8px;
      font-size: 14px;

      .row {
        display: flex;
        align-items: center;
        gap: 8px;
        a {
          color: #1168a8;
          text-decoration: none;
          &:hover { text-decoration: underline; }
        }
      }
    }

    #close_lightbox {
      position: absolute;
      inset: 0;
      z-index: 9999;
    }
    
    .bold {
      font-weight: 600;
    }
  `]
})
export class AccessibilityMenuComponent {
  public uiState = inject(UiStateService);

  setContrast(contrast: string) {
    const acc = this.uiState.accessibility();
    this.uiState.accessibility.set({ ...acc, contrast });
  }

  setTextSize(size: string) {
    const acc = this.uiState.accessibility();
    this.uiState.accessibility.set({ ...acc, text: size });
  }
}
