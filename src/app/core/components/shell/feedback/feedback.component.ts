import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ConfigStore } from '../../../state/config.store';
import { UiStateService } from '../../../services/ui-state.service';
import { NotificationService } from '../../../services/notification.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

@Component({
  selector: 'cos-feedback',
  standalone: true,
  imports: [FormsModule, TranslateModule, ButtonComponent],
  template: `
    @if (uiState.showFeedback()) {
      <div id="root_lightbox" class="feedback_overlay_root">
        <div id="lightbox" class="wide_lightbox">
          <div id="lightbox_wrap">
            <div id="lightbox_header">
              <div id="lightbox_header_text">
                <div class="title">{{ 'MODALS.GIVE_FEEDBACK_HEADING' | translate }}</div>
                <div class="description">{{ 'MODALS.GIVE_FEEDBACK_DESC' | translate }}</div>
              </div>
              <div id="lightbox_close">
                <button type="button" class="btn_dialog_close" (click)="uiState.showFeedback.set(false)" [attr.aria-label]="'CONTROL.CLOSE' | translate">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="#2C3B47"/>
                  </svg>
                </button>
              </div>
              <div class="line lightest_line"></div>
            </div>

            <div class="lightbox_content">
              <div class="line_wrap">
                <div class="line lightest_line"></div>
              </div>

              @if (!isSubmitted()) {
                <div class="lightbox_section">
                  <label class="bold" for="feedback_name">{{ 'MODALS.GIVE_FEEDBACK_LBL_NAME' | translate }}</label>
                  <input id="feedback_name" class="feedback_input" [(ngModel)]="name">
                  
                  <label class="bold" for="feedback_email">{{ 'MODALS.GIVE_FEEDBACK_LBL_EMAIL' | translate }}</label>
                  <input id="feedback_email" class="feedback_input" [(ngModel)]="email">
                  
                  <label class="bold" for="feedback_org">{{ 'MODALS.GIVE_FEEDBACK_LBL_GROUP_OR_ORG' | translate }}</label>
                  <input id="feedback_org" class="feedback_input" [(ngModel)]="org">
                  
                  <label class="bold" for="feedback_message">{{ 'MODALS.GIVE_FEEDBACK_QUESTION_1' | translate }}</label>
                  <textarea id="feedback_message" class="feedback_info_textarea" [class.error_input]="error() && !message" [(ngModel)]="message"
                    [placeholder]="'MODALS.GIVE_FEEDBACK_PLACEHOLDER_TEXTAREA' | translate"></textarea>

                  <div class="bold">{{ 'MODALS.GIVE_FEEDBACK_QUESTION_2' | translate }}</div>

                  <label class="checkcontainer">
                    <input type="checkbox" class="checkbox" [checked]="allowContact" (change)="allowContact = !allowContact">
                    <span class="option_checkbox"></span>
                    <span class="bold">{{ 'MODALS.GIVE_FEEDBACK_LBL_CHECKBOX' | translate }}</span>
                  </label>
                  
                  <p class="feedback_info_text" [innerHtml]="'MODALS.GIVE_FEEDBACK_BE_CAREFULL' | translate"></p>
                  <p class="feedback_info_text" [innerHtml]="'MODALS.GIVE_FEEDBACK_BE_GDPR' | translate"></p>
                  <p class="feedback_info_text" [innerHtml]="'MODALS.GIVE_FEEDBACK_BE_VIEW_MORE_LEGAL' | translate"></p>
                </div>
              } @else {
                <div class="lightbox_section">
                  <div class="feedback_icon_wrap">
                    <div class="feedback_icon_circle">
                      <div class="icon_checkmark_white">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="white"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div class="feedback_submitted_title" [innerHtml]="'MODALS.GIVE_FEEDBACK_TITLE_THANK_YOU' | translate"></div>
                  <div class="feedback_info_text thank_you" [innerHtml]="'MODALS.GIVE_FEEDBACK_TEXT_THANK_YOU' | translate"></div>
                </div>
              }
            </div>

            <div class="lightbox_footer">
              <div class="line lightest_line"></div>
              <div class="lightbox_section">
                <div class="footer_button_wrap right">
                  @if (!isSubmitted()) {
                    <cos-button variant="ghost" (clicked)="uiState.showFeedback.set(false)">{{ 'MODALS.GIVE_FEEDBACK_BTN_CANCEL' | translate }}</cos-button>
                    <cos-button variant="primary" (clicked)="submitFeedback()">{{ 'MODALS.GIVE_FEEDBACK_BTN_SUBMIT' | translate }}</cos-button>
                  } @else {
                    <cos-button variant="primary" (clicked)="uiState.showFeedback.set(false)">{{ 'MODALS.GIVE_FEEDBACK_BTN_CLOSE' | translate }}</cos-button>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
        <div id="close_lightbox" (click)="uiState.showFeedback.set(false)" (keydown.enter)="uiState.showFeedback.set(false)" role="button" tabindex="0" [attr.aria-label]="'CONTROL.CLOSE' | translate"></div>
      </div>
    }
  `,
  styles: [`
    .feedback_overlay_root {
      position: fixed;
      inset: 0;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(44, 59, 71, 0.8);
    }

    #lightbox {
      background: white;
      width: 600px;
      max-width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      border-radius: 8px;
      position: relative;
      z-index: 10000;
      box-shadow: 0 12px 24px rgba(0,0,0,0.2);
    }

    #lightbox_header {
      padding: 24px;
      position: relative;
    }

    #lightbox_header_text .title {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    #lightbox_header_text .description {
      color: #727c84;
      font-size: 14px;
    }

    #lightbox_close {
      position: absolute;
      top: 24px;
      right: 24px;
      cursor: pointer;
    }

    .lightbox_content {
      padding: 0 24px 24px;
    }

    .lightbox_section {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .feedback_input {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .feedback_info_textarea {
      width: 100%;
      height: 120px;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      resize: vertical;
    }

    .error_input {
      border-color: var(--color-error);
    }

    .checkcontainer {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }

    .feedback_info_text {
      font-size: 12px;
      color: #727c84;
      margin: 0;
    }

    .lightbox_footer {
      padding: 24px;
      border-top: 1px solid #eee;
    }

    .footer_button_wrap {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 16px;
    }

    .blue_link {
      color: #1168a8;
      cursor: pointer;
      font-weight: 600;
    }

    .blue_button {
      background: #1168a8;
      color: white;
      padding: 12px 24px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
    }

    #close_lightbox {
      position: absolute;
      inset: 0;
      z-index: 9999;
    }

    .feedback_icon_wrap {
      display: flex;
      justify-content: center;
      padding: 24px 0;
    }

    .feedback_icon_circle {
      width: 64px;
      height: 64px;
      background: #4caf50;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .feedback_submitted_title {
      text-align: center;
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 16px;
    }

    .feedback_info_text.thank_you {
      text-align: center;
      font-size: 14px;
    }
  `]
})
export class FeedbackComponent {
  private http = inject(HttpClient);
  private translate = inject(TranslateService);
  private configStore = inject(ConfigStore);
  private notification = inject(NotificationService);
  public uiState = inject(UiStateService);

  name = '';
  email = '';
  org = '';
  message = '';
  allowContact = false;
  error = signal(false);
  isSubmitted = signal(false);

  submitFeedback() {
    this.error.set(false);
    if (!this.message) {
      this.error.set(true);
      return;
    }

    const q1 = this.translate.instant('MODALS.GIVE_FEEDBACK_QUESTION_1');
    const q2 = this.translate.instant('MODALS.GIVE_FEEDBACK_QUESTION_2');
    const path = `${this.configStore.api.baseUrl()}/api/internal/feedback`;
    
    const finalMessage = `
Name: ${this.name}
Email: ${this.email}
Group/Organization: ${this.org}
${q1}
${this.message}
${q2}
${this.allowContact ? 'Yes' : 'No'}
    `;

    this.http.post(path, { message: finalMessage }, { withCredentials: true }).subscribe({
      next: () => {
        this.isSubmitted.set(true);
      },
      error: (err: HttpErrorResponse) => {
        this.notification.error(err.message);
      }
    });
  }
}
