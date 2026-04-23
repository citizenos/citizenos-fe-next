import { Component, input, output, inject, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { UpperCasePipe } from '@angular/common';
import { Topic } from '../../../core/interfaces/topic';

export interface TopicMember {
  id: string;
  name: string;
  email?: string;
  imageUrl?: string;
  level?: string;
}

export interface TopicInvite {
  id: string;
  user?: { name: string; email?: string };
  email?: string;
  level?: string;
}

@Component({
  selector: 'cos-member-editors-panel',
  standalone: true,
  imports: [TranslateModule, UpperCasePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="members-panel">
      <div class="members-header">
        <h3 translate="VIEWS.TOPIC_CREATE.HEADING_EDITORS"></h3>
        <button
          id="invite_editors_btn"
          class="btn-invite"
          (click)="inviteEditors.emit()"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd"
              d="M18 13H13V18C13 18.55 12.55 19 12 19C11.45 19 11 18.55 11 18V13H6C5.45 13 5 12.55 5 12C5 11.45 5.45 11 6 11H11V6C11 5.45 11.45 5 12 5C12.55 5 13 5.45 13 6V11H18C18.55 11 19 11.45 19 12C19 12.55 18.55 13 18 13Z"
              fill="#1168A8" />
          </svg>
          <span translate="VIEWS.TOPIC_CREATE.BTN_INVITE_EDITORS"></span>
        </button>
      </div>

      @if (members().length === 0 && invites().length === 0) {
        <div class="no-members">
          <p translate="VIEWS.TOPIC_CREATE.NO_EDITORS_HEADING"></p>
          <p translate="VIEWS.TOPIC_CREATE.NO_EDITORS_DESCRIPTION"></p>
        </div>
      }

      @if (members().length) {
        <div class="members-list">
          @for (member of members(); track member.id) {
            <div class="member-row">
              <div class="member-info">
                <div class="member-name">{{ member.name }}</div>
                @if (member.email) {
                  <div class="member-email">{{ member.email }}</div>
                }
              </div>
              <span class="member-level" translate="VIEWS.TOPIC_CREATE.LEVEL_{{ member.level || 'edit' | uppercase }}"></span>
            </div>
          }
        </div>
      }

      @if (invites().length) {
        <div class="invites-section">
          <h4 translate="VIEWS.TOPIC_CREATE.HEADING_INVITES"></h4>
          @for (invite of invites(); track invite.id) {
            <div class="member-row invite-row">
              <div class="member-info">
                <div class="member-name">{{ invite.user?.name || invite.email }}</div>
              </div>
              <span class="invite-badge" translate="VIEWS.TOPIC_CREATE.LABEL_PENDING"></span>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .members-panel {
      width: 100%;
    }

    .members-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;

      h3 {
        font-size: 16px;
        font-weight: 600;
        margin: 0;
      }
    }

    .btn-invite {
      display: flex;
      align-items: center;
      gap: 8px;
      background: none;
      border: 1px solid var(--color-primary);
      border-radius: var(--radius-md);
      padding: 8px 16px;
      cursor: pointer;
      color: var(--color-primary);
      font-weight: 500;
      font-size: 14px;

      &:hover {
        background: rgba(17, 104, 168, 0.05);
      }
    }

    .no-members {
      text-align: center;
      padding: 32px;
      color: var(--color-text-muted);
      p:first-child { font-weight: 600; }
    }

    .members-list, .invites-section {
      display: flex;
      flex-direction: column;
    }

    .member-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid var(--color-border);
    }

    .member-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .member-name { font-weight: 500; }

    .member-email {
      font-size: 13px;
      color: var(--color-text-muted);
    }

    .member-level {
      font-size: 12px;
      text-transform: uppercase;
      color: var(--color-text-muted);
    }

    .invites-section {
      margin-top: 16px;

      h4 {
        font-size: 14px;
        font-weight: 600;
        margin: 0 0 8px;
      }
    }

    .invite-badge {
      font-size: 12px;
      padding: 2px 8px;
      background: var(--color-secondary);
      border-radius: 8px;
      color: var(--color-text-muted);
    }
  `]
})
export class MemberEditorsPanelComponent {
  topic = input<Topic>({} as Topic);
  members = input<TopicMember[]>([]);
  invites = input<TopicInvite[]>([]);

  inviteEditors = output<void>();
  manageMembers = output<void>();
}
