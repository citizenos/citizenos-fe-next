import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ConfigStore } from '../../../core/state/config.store';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'cos-site-notification',
  standalone: true,
  imports: [TranslateModule, IconComponent],
  template: `
    @if (showNotification()) {
      <div class="notification_top warning">
        <div class="icon_notification">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="40" height="40" rx="20" fill="#F39129" />
            <path d="M19.0645 8C18.4876 8 18.0304 8.48668 18.0664 9.06238L18.9414 23.0624C18.9743 23.5894 19.4114 24 19.9395 24H20.0605C20.5886 24 21.0257 23.5894 21.0586 23.0624L21.9336 9.06238C21.9696 8.48668 21.5124 8 20.9355 8H19.0645Z" fill="white" />
            <path d="M20 31C21.1046 31 22 30.1046 22 29C22 27.8954 21.1046 27 20 27C18.8954 27 18 27.8954 18 29C18 30.1046 18.8954 31 20 31Z" fill="white" />
          </svg>
        </div>
        <div class="message">
          <div class="title">{{ 'MSG_ISSUE_NOTIFICATION_TITLE' | translate }}</div>
          <div class="content">{{ 'MSG_ISSUE_NOTIFICATION' | translate }}</div>
        </div>
        <button class="btn_medium_nav icon" (click)="close()">
          <cos-icon name="close" [size]="24"></cos-icon>
        </button>
      </div>
    }
  `,
  styleUrls: ['./site-notification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiteNotificationComponent implements OnInit {
  showNotification = signal(false);
  private configStore = inject(ConfigStore);

  ngOnInit() {
    const isIssueNotificationEnabled = this.configStore.showIssueNotification ? this.configStore.showIssueNotification() : false;
    const isCookieSet = localStorage.getItem('show-issue-notification') === 'true';

    if (isIssueNotificationEnabled && !isCookieSet) {
      this.showNotification.set(true);
    }
  }

  close() {
    this.showNotification.set(false);
    localStorage.setItem('show-issue-notification', 'true');
  }
}