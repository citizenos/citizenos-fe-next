import { Component, output, inject, ChangeDetectionStrategy, model } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Topic } from '../../../core/interfaces/topic';
import { TopicService } from '../../../core/services/topic.service';
import { InitialsComponent } from '../initials/initials.component';

export interface TopicMember {
  id: string;
  name: string;
  email?: string;
  imageUrl?: string;
  level?: string;
}

export interface TopicInvite {
  id: string;
  user?: { name?: string; email?: string; imageUrl?: string };
  email?: string;
  level?: string;
}

@Component({
  selector: 'cos-member-editors-panel',
  standalone: true,
  imports: [TranslateModule, InitialsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="members-panel">
      @if ((members().length <= 1) && !invites().length) {
        <div class="no-members">
          <div class="small_heading" translate="VIEWS.TOPIC_CREATE.WRITE_TOGETHER_HEADING"></div>
          <div translate="VIEWS.TOPIC_CREATE.WRITE_TOGETHER_DESC"></div>
        </div>
      } @else {
        <div class="topic_editors_header">
          <div class="title" translate="VIEWS.TOPIC_CREATE.CO_EDITORS_TITLE"></div>
          @if (topicService.canDelete(topic())) {
            <a (click)="manageMembers.emit()" translate="VIEWS.TOPIC_CREATE.CO_EDITORS_LNK_MANAGE"></a>
          }
        </div>

        <div class="topic_members_list_wrap">
          <div class="topic_member">
            <div class="bold" translate="VIEWS.TOPIC_CREATE.CO_EDITORS_LBL_JOINED"></div>
          </div>
          @for (member of members(); track member.id) {
            @if (member.level === 'edit' || member.level === 'admin') {
              <div class="topic_member">
                <div class="profile_image_wrap">
                  @if (member.imageUrl) {
                    <img class="profile_image" [src]="member.imageUrl">
                  } @else {
                    <div class="profile_image_filler small">
                      @if (member.name) {
                        <cos-initials [name]="member.name"></cos-initials>
                      }
                    </div>
                  }
                </div>
                <span>{{ member.name }}</span>
              </div>
            }
          }
        </div>

        @if (invites().length) {
          <div class="topic_members_list_wrap">
            <div class="topic_member">
              <div class="bold" translate="VIEWS.TOPIC_CREATE.CO_EDITORS_LBL_INVITED"></div>
            </div>
            @for (invite of invites(); track invite.id) {
              <div class="topic_member disabled">
                <div class="profile_image_wrap">
                  @if (invite.user?.imageUrl) {
                    <img class="profile_image" [src]="invite.user!.imageUrl">
                  } @else {
                    <div class="profile_image_filler small">
                      @if (invite.user?.name) {
                        <cos-initials [name]="invite.user!.name!"></cos-initials>
                      }
                    </div>
                  }
                </div>
                <span>{{ invite.user?.name || invite.email }}</span>
              </div>
            }
          </div>
        }
      }

      @if (topicService.canDelete(topic())) {
        <button class="btn_medium_secondary bold" (click)="inviteEditors.emit()"
          translate="VIEWS.TOPIC_CREATE.BTN_INVITE_CO_EDITORS"></button>
      }
    </div>
  `,
  styles: [`
    .members-panel {
      width: 100%;
    }

    .no-members {
      text-align: center;
      padding: 32px;
      color: var(--color-text-muted);

      .small_heading {
        font-weight: 600;
        font-size: 16px;
        margin-bottom: 8px;
      }
    }

    .topic_editors_header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;

      .title {
        font-size: 14px;
        font-weight: 600;
      }

      a {
        font-size: 13px;
        color: var(--color-link);
        cursor: pointer;

        &:hover { text-decoration: underline; }
      }
    }

    .topic_members_list_wrap {
      display: flex;
      flex-direction: column;
      margin-bottom: 8px;
    }

    .topic_member {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 0;
      border-bottom: 1px solid var(--color-border);

      &.disabled { opacity: 0.6; }

      .bold {
        font-weight: 600;
        font-size: 13px;
        color: var(--color-text-muted);
      }
    }

    .profile_image_wrap {
      width: 32px;
      height: 32px;
      flex-shrink: 0;
    }

    .profile_image {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
    }

    .profile_image_filler {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--color-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn_medium_secondary {
      margin-top: 16px;
      width: 100%;
    }
  `]
})
export class MemberEditorsPanelComponent {
  topicService = inject(TopicService);

  topic = model.required<Topic>();
  members = model<any[]>([]);
  invites = model<any[]>([]);

  inviteEditors = output<void>();
  manageMembers = output<void>();
}
