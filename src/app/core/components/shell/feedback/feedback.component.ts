import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { ConfigStore } from '../../../state/config.store';
import { UiStateService } from '../../../services/ui-state.service';
import { NotificationService } from '../../../services/notification.service';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'cos-feedback',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, IconComponent],
  template: `
    @if (uiState.showFeedback()) {
      <div class="feedback_overlay" (click)="uiState.showFeedback.set(false)"></div>
      <div id="feedback_panel" class="open">
        <div class="feedback_header">
          <div class="feedback_title" translate="MODALS.GIVE_FEEDBACK_TITLE"></div>
          <button class="feedback_close" (click)="uiState.showFeedback.set(false)">
            <cos-icon name="close" [size]="24"></cos-icon>
          </button>
        </div>

        <div class="feedback_content">
          @if (!isSubmitted()) {
            <div class="feedback_intro" translate="MODALS.GIVE_FEEDBACK_INTRO"></div>
            <div class="form_group">
              <label translate="MODALS.GIVE_FEEDBACK_LBL_NAME"></label>
              <input type="text" [(ngModel)]="name" [placeholder]="'MODALS.GIVE_FEEDBACK_PLACEHOLDER_NAME' | translate">
            </div>
            <div class="form_group">
              <label translate="MODALS.GIVE_FEEDBACK_LBL_EMAIL"></label>
              <input type="email" [(ngModel)]="email" [placeholder]="'MODALS.GIVE_FEEDBACK_PLACEHOLDER_EMAIL' | translate">
            </div>
            <div class="form_group">
              <label translate="MODALS.GIVE_FEEDBACK_LBL_ORGANIZATION"></label>
              <input type="text" [(ngModel)]="org" [placeholder]="'MODALS.GIVE_FEEDBACK_PLACEHOLDER_ORGANIZATION' | translate">
            </div>
            <div class="form_group">
              <label translate="MODALS.GIVE_FEEDBACK_QUESTION_1"></label>
              <textarea [(ngModel)]="message" [placeholder]="'MODALS.GIVE_FEEDBACK_PLACEHOLDER_MESSAGE' | translate" required></textarea>
              @if (error() && !message) {
                <div class="error_text" translate="MODALS.GIVE_FEEDBACK_ERROR_MESSAGE_REQUIRED"></div>
              }
            </div>
            <div class="form_group checkbox">
              <label>
                <input type="checkbox" [(ngModel)]="allowContact">
                <span translate="MODALS.GIVE_FEEDBACK_QUESTION_2"></span>
              </label>
            </div>
            <button class="btn_medium_submit" (click)="submitFeedback()" translate="MODALS.GIVE_FEEDBACK_BTN_SUBMIT"></button>
          } @else {
            <div class="success_message">
              <div class="success_icon">
                <cos-icon name="check" [size]="48"></cos-icon>
              </div>
              <div class="success_title" translate="MODALS.GIVE_FEEDBACK_SUCCESS_TITLE"></div>
              <div class="success_text" translate="MODALS.GIVE_FEEDBACK_SUCCESS_TEXT"></div>
              <button class="btn_medium_submit" (click)="uiState.showFeedback.set(false)" translate="MODALS.GIVE_FEEDBACK_BTN_CLOSE"></button>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .feedback_overlay {
      position: fixed;
      inset: 0;
      z-index: 99;
      background-color: rgba(44, 59, 71, 0.8);
    }

    #feedback_panel {
      position: fixed;
      right: -400px;
      top: 0;
      width: 400px;
      height: 100%;
      background: var(--color-background);
      z-index: 100;
      display: flex;
      flex-direction: column;
      transition: right 0.3s ease;
      box-shadow: -2px 0 10px rgba(0,0,0,0.1);
    }

    #feedback_panel.open {
      right: 0;
    }

    .feedback_header {
      display: flex;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid var(--color-border);
      gap: 16px;
    }

    .feedback_title {
      flex: 1;
      font-weight: 600;
      font-size: 18px;
    }

    .feedback_close {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      color: var(--color-text);
      display: flex;
      align-items: center;
    }

    .feedback_content {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .feedback_intro {
      color: var(--color-text-muted);
      line-height: 1.5;
    }

    .form_group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form_group label {
      font-weight: 600;
      font-size: 14px;
    }

    .form_group input, .form_group textarea {
      width: 100%;
      padding: 10px;
      border: 1px solid var(--color-border);
      border-radius: 4px;
      background: var(--color-background);
      color: var(--color-text);
    }

    .form_group textarea {
      height: 120px;
      resize: vertical;
    }

    .form_group.checkbox label {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      font-weight: normal;
      cursor: pointer;
    }

    .form_group.checkbox input {
      width: auto;
      margin-top: 4px;
    }

    .error_text {
      color: var(--color-error);
      font-size: 12px;
    }

    .btn_medium_submit {
      padding: 10px 24px;
      background: var(--color-primary);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      align-self: flex-start;
    }

    .success_message {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 16px;
      padding-top: 40px;
    }

    .success_icon {
      color: var(--color-success);
    }

    .success_title {
      font-weight: 600;
      font-size: 20px;
    }

    @media (max-width: 560px) {
      #feedback_panel {
        width: 100%;
        right: -100%;
      }
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
      error: (err) => {
        this.notification.error(err.message);
      }
    });
  }
}
