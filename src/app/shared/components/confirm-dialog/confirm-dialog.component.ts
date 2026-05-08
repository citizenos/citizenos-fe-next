import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { NgClass } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { A11yModule } from '@angular/cdk/a11y';
import { DialogCloseDirective } from '../../dialog';
import { DIALOG_DATA } from '../../dialog/dialog-tokens';
import { IconComponent } from '../icon/icon.component';

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
  imports: [NgClass, TranslateModule, DialogCloseDirective, A11yModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="overlay" dialogClose></div>

    <div class="dialog_wrap">
      <div class="dialog" cdkTrapFocus [cdkTrapFocusAutoCapture]="true" role="dialog" aria-modal="true" [attr.aria-labelledby]="data.heading ? 'dialog-title' : null">
        <!-- Header -->
        <div class="dialog_header" [ngClass]="{
          'warning': data.level === 'warn',
          'error': data.level === 'delete',
          'info': data.level === 'info',
          'voting': data.level === 'voting'
        }">
          <div class="header_with_icon">
            <div class="icon_notification">
              @if (safeIcon) {
                <div [innerHTML]="safeIcon"></div>
              } @else if (data.level === 'warn' || data.level === 'delete') {
                <cos-icon name="warning-filled" [size]="40"></cos-icon>
              } @else if (data.level === 'info' || data.level === 'voting') {
                <cos-icon name="info-filled" [size]="40"></cos-icon>
              }
            </div>
            @if (data.heading) {
              <h4 id="dialog-title" class="title">{{ data.heading | translate }}</h4>
            }
          </div>

          <div class="dialog_close">
            <button class="btn_dialog_close" [dialogClose]="undefined" [attr.aria-label]="'BTN_CLOSE' | translate">
              <cos-icon name="nav-close"></cos-icon>
            </button>
          </div>
        </div>

        <!-- Description -->
        <div class="dialog_content">
          <div class="info_row" [class.center]="(!data.sections && !data.info && !data.points?.length)" [translate]="data.description ?? ''"></div>
        </div>

        <!-- Sections / Info / Points -->
        @if (data.sections?.length || data.info || data.points?.length) {
          <div class="dialog_content">
            <div class="dialog_info_wrap">
              @for (section of data.sections; track section.heading) {
                <div class="small_heading" [translate]="section.heading"></div>
                <div class="dialog_info">
                  @for (point of section.points; track point) {
                    <div class="info_row">
                      <cos-icon name="check-box" [size]="24"></cos-icon>
                      <span [translate]="point"></span>
                    </div>
                  }
                </div>
              }

              @if (data.info) {
                <div class="info_row" [translate]="data.info"></div>
              }

              @for (point of data.points; track point) {
                <div class="info_row">
                  <cos-icon name="check-box" [size]="24"></cos-icon>
                  <span [translate]="point"></span>
                </div>
              }
            </div>
          </div>
        }

        <!-- Actions -->
        <div class="dialog_content no_footer">
          <div class="button_wrap">
            @if (data.confirmBtn) {
              <button class="btn_big_submit" [dialogClose]="true">{{ data.confirmBtn | translate }}</button>
            }
            @if (data.closeBtn) {
              <a [dialogClose]="false">{{ data.closeBtn | translate }}</a>
            }
          </div>
        </div>
        
        <div class="dialog_footer"></div>
      </div>
    </div>
  `,
  styles: [`
    .dialog {
      /* Reset some cos-dialog defaults if any, but rely on global .dialog */
      max-width: 560px;
    }

    .center {
      text-align: center;
      justify-content: center;
    }

    .button_wrap {
       display: flex;
       flex-direction: row;
       align-items: center;
       gap: 16px;
       justify-content: center;

       a {
         cursor: pointer;
         text-decoration: underline;
         color: var(--color-text-muted);
         &:hover {
           color: var(--color-text);
         }
       }
    }

    .dialog_info_wrap {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .dialog_info {
      display: flex;
      flex-direction: column;
      gap: 8px;
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
