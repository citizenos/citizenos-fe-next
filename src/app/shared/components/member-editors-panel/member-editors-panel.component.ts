import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { UpperCasePipe } from '@angular/common';
import { Topic } from '../../../core/interfaces/topic';
import { IconComponent } from '../icon/icon.component';

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
  imports: [TranslateModule, UpperCasePipe, IconComponent],
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
          <cos-icon name="plus" [size]="24"></cos-icon>
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
