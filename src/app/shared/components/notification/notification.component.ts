import { Component, inject, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { NotificationService, type Notification } from '../../../core/services/notification.service';

@Component({
  selector: 'cos-notifications',
  standalone: true,
  imports: [TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="cos-notifications" aria-live="polite" aria-atomic="false">
      @for (n of notifications(); track n.id) {
        <div class="cos-notification" [class]="'cos-notification--' + n.level">
          <div class="cos-notification-icon" aria-hidden="true">
            @if (n.level === 'success') {
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <rect width="40" height="40" rx="20" fill="#5ab467"/>
                <path d="M16 20.5l3 3 6-6" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            } @else if (n.level === 'error') {
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <rect width="40" height="40" rx="20" fill="#ef4025"/>
                <path d="M14 14l12 12M26 14L14 26" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
              </svg>
            } @else if (n.level === 'info') {
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <rect width="40" height="40" rx="20" fill="#5C9CD0"/>
                <path d="M20 18v10M20 13v2" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
              </svg>
            } @else {
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <rect width="40" height="40" rx="20" fill="#F39129"/>
                <path d="M19.065 8C18.488 8 18.03 8.487 18.066 9.062L18.941 23.062C18.974 23.59 19.411 24 19.94 24H20.06C20.589 24 21.026 23.59 21.059 23.062L21.934 9.062C21.97 8.487 21.512 8 20.935 8H19.065Z" fill="white"/>
                <path d="M20 31a2 2 0 100-4 2 2 0 000 4z" fill="white"/>
              </svg>
            }
          </div>

          <div class="cos-notification-body">
            @if (n.titleKey) {
              <div class="cos-notification-title" [translate]="n.titleKey"></div>
            }
            @if (n.messageKey) {
              <div class="cos-notification-message" [translate]="n.messageKey"></div>
            } @else if (n.message) {
              <div class="cos-notification-message">{{ n.message }}</div>
            }
          </div>

          <button
            class="cos-notification-close"
            (click)="dismiss(n.id)"
            aria-label="Dismiss"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M6.7 5.3a1 1 0 00-1.4 1.4L10.6 12l-5.3 5.3a1 1 0 001.4 1.4L12 13.4l5.3 5.3a1 1 0 001.4-1.4L13.4 12l5.3-5.3a1 1 0 00-1.4-1.4L12 10.6 6.7 5.3z" fill="currentColor"/>
            </svg>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .cos-notifications {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      pointer-events: none;
    }

    .cos-notification {
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      gap: 16px;
      padding: 12px 16px 16px;
      background: var(--color-surfaces);
      box-shadow: 0 8px 20px rgba(220, 231, 240, 0.3), 0 12px 16px rgba(50, 85, 112, 0.1);
      border-top: 4px solid transparent;
      pointer-events: all;
      position: relative;

      &--success { border-top-color: #5ab467; }
      &--error   { border-top-color: #ef4025; }
      &--warning { border-top-color: #f39129; }
      &--info    { border-top-color: #5C9CD0; }

      &:last-child {
        border-bottom-left-radius: 16px;
        border-bottom-right-radius: 16px;
      }
    }

    .cos-notification-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding-right: 32px;
    }

    .cos-notification-title {
      font-size: 16px;
      font-weight: 700;
      line-height: 20px;
      color: var(--color-text);
    }

    .cos-notification-message {
      font-size: 14px;
      line-height: 20px;
      color: var(--color-text-muted);
    }

    .cos-notification-close {
      position: absolute;
      right: 16px;
      top: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border: none;
      background: transparent;
      cursor: pointer;
      color: var(--color-text-muted);
      border-radius: var(--radius-sm);
      transition: background var(--transition-fast);

      &:hover { background: var(--color-border); }
    }
  `]
})
export class NotificationComponent {
  private notificationService = inject(NotificationService);
  readonly notifications = this.notificationService.notifications;

  dismiss(id: string) {
    this.notificationService.dismiss(id);
  }
}
