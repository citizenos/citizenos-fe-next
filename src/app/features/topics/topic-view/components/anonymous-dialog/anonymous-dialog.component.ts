import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { DialogCloseDirective } from '../../../../../shared/dialog/dialog-ref';

@Component({
  selector: 'cos-anonymous-dialog',
  standalone: true,
  imports: [TranslateModule, IconComponent, DialogCloseDirective],
  template: `
    <div id="anonymous_dialog" class="modals-base">
      <div class="modal-header">
        <div class="header-text">
          @if (type === 'draft') {
            {{ 'MODALS.TOPIC_IDEA_POSTING_DRAFT_ANONYMOUSLY' | translate }}
          } @else {
            {{ 'MODALS.TOPIC_IDEA_ANONYMOUS_MODAL_HEADING' | translate }}
          }
        </div>
        <div dialogClose class="close-icon-container">
          <cos-icon name="nav-close"></cos-icon>
        </div>
      </div>
      <div class="modal-content">
        <div class="info-content-container">
          <div class="icon-container">
            <!-- Colored circle with white icon - domain-like illustration exception for inline SVG -->
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="20" fill="#1168A8" />
              <path
                d="M23 11.5292C23 12.926 21.9255 14.0583 20.6 14.0583C19.2745 14.0583 18 12.926 18 11.5292C18 10.1323 19.2745 9 20.6 9C21.9255 9 23 10.1323 23 11.5292Z"
                fill="white"
              />
              <path
                d="M17.3359 16.5357L22.8319 15.8098L20.4295 27.7096C20.2591 28.5695 20.4991 29.0576 21.1591 29.0576C21.6247 29.0576 22.3255 28.8806 22.8055 28.4354L22.5943 29.4876C21.9055 30.3626 20.3863 31 19.0783 31C17.3911 31 16.6735 29.9327 17.1391 27.664L18.9103 18.8929C19.0639 18.1518 18.9247 17.8837 18.2191 17.7067L17.1391 17.4968L17.3359 16.5357Z"
                fill="white"
              />
            </svg>
          </div>
          <div class="text-container">
            @if (type === 'idea') {
              <div class="bold-text">
                {{ 'MODALS.TOPIC_IDEA_ANONYMOUS_MODAL_TITLE' | translate }}
              </div>
              <div class="light-text">
                {{ 'MODALS.TOPIC_IDEA_ANONYMOUS_MODAL_TXT' | translate }}
              </div>
            } @else {
              <div class="bold-text">
                {{ 'MODALS.TOPIC_IDEA_POSTING_DRAFT_ANONIMOUSLY_TEXT_1' | translate }}
              </div>
              <div class="light-text">
                {{ 'MODALS.TOPIC_IDEA_POSTING_DRAFT_ANONIMOUSLY_TEXT_2' | translate }}
              </div>
            }
          </div>
        </div>
        <div class="footer-buttons-container">
          @if (type === 'draft') {
            <button class="btn-clear no-bg" [dialogClose]="true">
              {{ 'MODALS.TOPIC_IDEA_POSTING_DRAFT_ANONIMOUSLY_BTN_GOT_IT' | translate }}
            </button>
          } @else {
            <button class="btn-clear" dialogClose>
              {{ 'MODALS.TOPIC_IDEA_ANONYMOUS_MODAL_BTN_CANCEL' | translate }}
            </button>
            <button class="btn-clear no-bg" [dialogClose]="true">
              {{ 'MODALS.TOPIC_IDEA_ANONYMOUS_MODAL_BTN_CONTINUE' | translate }}
            </button>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modals-base {
      padding: 0;
      max-width: 600px;
      background: white;
      border-radius: 4px;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px 32px;
      border-bottom: 1px solid #e7e9eb;

      .header-text {
        font-size: 20px;
        font-weight: 700;
        color: #2c3b47;
      }

      .close-icon-container {
        cursor: pointer;
        color: #727c84;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
          color: #2c3b47;
        }
      }
    }

    .modal-content {
      padding: 32px;

      .info-content-container {
        display: flex;
        gap: 24px;
        margin-bottom: 32px;

        .icon-container {
          flex-shrink: 0;
        }

        .text-container {
          display: flex;
          flex-direction: column;
          gap: 16px;

          .bold-text {
            font-size: 16px;
            font-weight: 700;
            color: #2c3b47;
          }

          .light-text {
            font-size: 16px;
            color: #2c3b47;
          }
        }
      }

      .footer-buttons-container {
        display: flex;
        justify-content: flex-end;
        gap: 16px;

        .btn-clear {
          background: none;
          border: none;
          cursor: pointer;
          color: #2c3b47;
          padding: 12px 24px;
          font-weight: 600;
          font-size: 14px;

          &.no-bg {
            color: #1168a8;
            
            &:hover {
              background-color: rgba(17, 104, 168, 0.05);
            }
          }
        }
      }
    }

    @media (max-width: 600px) {
      .modal-header {
        padding: 16px 24px;
      }

      .modal-content {
        padding: 24px;

        .info-content-container {
          gap: 16px;
        }
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnonymousDialogComponent {
  /**
   * Type of dialog:
   * - 'idea': Standard anonymous idea posting info
   * - 'draft': Info when saving a draft anonymously
   */
  @Input() type: 'idea' | 'draft' = 'idea';
}
