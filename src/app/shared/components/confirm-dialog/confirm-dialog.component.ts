import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { DialogCloseDirective, DialogRef } from '../../dialog';
import { DIALOG_DATA } from '../../dialog/dialog-tokens';

export type DialogLevel = 'warn' | 'delete' | 'info' | 'voting';

export interface ConfirmDialogData {
  title?: string;
  heading?: string;
  level?: DialogLevel;
  closeBtn?: string;
  confirmBtn?: string;
  description?: string;
  info?: string;
  points?: string[];
  sections?: { heading: string; points: string[] }[];
  svg?: string;
}

@Component({
  selector: 'cos-confirm-dialog',
  standalone: true,
  imports: [TranslateModule, DialogCloseDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="cos-dialog-overlay" dialogClose></div>

    <div class="cos-dialog-wrap">
      <div class="cos-dialog">
        <!-- Header -->
        <div class="cos-dialog-header" [class]="'level-' + data.level">
          <div class="cos-dialog-header-inner">
            <div class="cos-dialog-icon">
              @if (safeIcon) {
                <span [innerHTML]="safeIcon"></span>
              } @else if (data.level === 'warn' || data.level === 'delete') {
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <rect width="40" height="40" rx="20" fill="#F39129"/>
                  <path d="M19.065 8C18.488 8 18.03 8.487 18.066 9.062L18.941 23.062C18.974 23.59 19.411 24 19.94 24H20.06C20.589 24 21.026 23.59 21.059 23.062L21.934 9.062C21.97 8.487 21.512 8 20.935 8H19.065Z" fill="white"/>
                  <path d="M20 31a2 2 0 100-4 2 2 0 000 4z" fill="white"/>
                </svg>
              } @else if (data.level === 'info') {
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <rect width="40" height="40" rx="20" fill="#5C9CD0"/>
                  <path d="M23 11.53a2.4 2.4 0 11-4.8 0 2.4 2.4 0 014.8 0z" fill="white"/>
                  <path d="M17.336 16.536l5.496-.726L20.43 27.71c-.17.86.07 1.348.73 1.348.465 0 1.165-.177 1.645-.623l-.21 1.052C21.905 30.363 20.386 31 19.078 31c-1.687 0-2.405-1.067-1.94-3.336l1.772-8.771c.153-.741.014-1.01-.692-1.186l-1.08-.21.198-.96z" fill="white"/>
                </svg>
              }
            </div>
            @if (data.heading) {
              <h4 class="cos-dialog-title" [translate]="data.heading"></h4>
            }
          </div>

          <button class="cos-dialog-close" [dialogClose]="undefined" aria-label="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M7.72 6.295a1 1 0 00-1.414 1.415L10.586 12l-4.28 4.28a1 1 0 001.414 1.414L12 13.414l4.278 4.28a1 1 0 001.414-1.414L13.414 12l4.278-4.29a1 1 0 00-1.414-1.414L12 10.586 7.72 6.295z" fill="currentColor"/>
            </svg>
          </button>
        </div>

        <!-- Description -->
        @if (data.description) {
          <div class="cos-dialog-content">
            <div
              class="cos-dialog-description"
              [class.center]="!data.sections && !data.info && !data.points?.length"
              [translate]="data.description"
            ></div>
          </div>
        }

        <!-- Sections / Info / Points -->
        @if (data.sections?.length || data.info || data.points?.length) {
          <div class="cos-dialog-content">
            <div class="cos-dialog-info-wrap">
              @for (section of data.sections; track section.heading) {
                <div class="cos-dialog-section-heading" [translate]="section.heading"></div>
                <div class="cos-dialog-points">
                  @for (point of section.points; track point) {
                    <div class="cos-dialog-point">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M9.386 14.809L17.526 6l1.474 1.596L9.386 18 5 13.253l1.474-1.595 2.912 3.151z" fill="currentColor"/>
                      </svg>
                      <span [translate]="point"></span>
                    </div>
                  }
                </div>
              }

              @if (data.info) {
                <div class="cos-dialog-info-text" [translate]="data.info"></div>
              }

              @for (point of data.points; track point) {
                <div class="cos-dialog-point">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M9.386 14.809L17.526 6l1.474 1.596L9.386 18 5 13.253l1.474-1.595 2.912 3.151z" fill="currentColor"/>
                  </svg>
                  <span [translate]="point"></span>
                </div>
              }
            </div>
          </div>
        }

        <!-- Actions -->
        <div class="cos-dialog-actions">
          @if (data.confirmBtn) {
            <button class="cos-dialog-confirm" [dialogClose]="true" [translate]="data.confirmBtn"></button>
          }
          @if (data.closeBtn) {
            <button class="cos-dialog-cancel" [dialogClose]="false" [translate]="data.closeBtn"></button>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cos-dialog-overlay {
      position: fixed;
      inset: 0;
      z-index: 0;
    }

    .cos-dialog-wrap {
      position: relative;
      z-index: 1;
    }

    .cos-dialog {
      background: var(--color-surfaces);
      border-radius: var(--radius-lg);
      width: 100%;
      max-width: 560px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
      overflow: hidden;
    }

    .cos-dialog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 24px;
      gap: 12px;

      &.level-warn, &.level-delete {
        background: #fff8f0;
      }
      &.level-info, &.level-voting {
        background: #f0f7ff;
      }
    }

    .cos-dialog-header-inner {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }

    .cos-dialog-title {
      margin: 0;
      font-size: 18px;
      font-weight: 700;
      color: var(--color-text);
    }

    .cos-dialog-close {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border: none;
      background: transparent;
      cursor: pointer;
      color: var(--color-text);
      border-radius: var(--radius-sm);
      flex-shrink: 0;
      transition: background var(--transition-fast);

      &:hover { background: var(--color-border); }
    }

    .cos-dialog-content {
      padding: 16px 24px;
    }

    .cos-dialog-description {
      font-size: 14px;
      line-height: 20px;
      color: var(--color-text);

      &.center { text-align: center; }
    }

    .cos-dialog-info-wrap {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .cos-dialog-section-heading {
      font-weight: 600;
      font-size: 14px;
      margin-top: 8px;
    }

    .cos-dialog-points {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .cos-dialog-point {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      font-size: 14px;
      color: var(--color-text);

      svg { flex-shrink: 0; margin-top: 2px; }
    }

    .cos-dialog-info-text {
      font-size: 14px;
      color: var(--color-text-muted);
    }

    .cos-dialog-actions {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 24px 24px;
    }

    .cos-dialog-confirm {
      height: 48px;
      padding: 0 24px;
      background: var(--color-primary);
      color: white;
      border: none;
      border-radius: var(--radius-md);
      font-size: 16px;
      font-family: var(--font-family-base);
      font-weight: 600;
      cursor: pointer;
      transition: background var(--transition-fast);

      &:hover { background: var(--color-primary-hover); }
    }

    .cos-dialog-cancel {
      height: 48px;
      padding: 0;
      background: none;
      border: none;
      font-size: 14px;
      font-family: var(--font-family-base);
      color: var(--color-text-muted);
      cursor: pointer;
      text-decoration: underline;

      &:hover { color: var(--color-text); }
    }
  `]
})
export class ConfirmDialogComponent {
  data = inject<ConfirmDialogData>(DIALOG_DATA);
  safeIcon: SafeHtml | null = null;

  private sanitizer = inject(DomSanitizer);

  constructor() {
    if (!this.data.level) this.data.level = 'warn';
    if (this.data.svg) {
      this.safeIcon = this.sanitizer.bypassSecurityTrustHtml(this.data.svg);
    }
  }
}
