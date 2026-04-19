import { Component, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router, PRIMARY_OUTLET } from '@angular/router';
import { DialogRef, DialogCloseDirective } from '../../../../shared/dialog';
import { UserStore } from '../../../state/user.store';
import { UserService } from '../../../services/user.service';
import { firstValueFrom } from 'rxjs';
import { SELECTED_LANGUAGES } from '../../../constants/languages';

import { IconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'cos-language-select',
  standalone: true,
  imports: [DialogCloseDirective, TranslateModule, IconComponent],
  template: `
    <div class="dialog_wrap">
      <div class="dialog">
        <div class="dialog_header">
          <div class="header_text">
            <h4 class="title">{{ 'MODALS.LANGUAGES_MODAL_HEADING' | translate }}</h4>
            <div class="dialog_close">
              <button class="btn_dialog_close icon" dialogClose aria-label="Close">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M7.72152 6.29537C7.3277 5.90154 6.68919 5.90154 6.29537 6.29537C5.90154 6.68919 5.90154 7.3277 6.29537 7.72153L10.5738 12L6.29541 16.2785C5.90159 16.6723 5.90159 17.3108 6.29541 17.7046C6.68923 18.0985 7.32774 18.0985 7.72156 17.7046L12 13.4262L16.2784 17.7046C16.6723 18.0985 17.3108 18.0985 17.7046 17.7046C18.0984 17.3108 18.0984 16.6723 17.7046 16.2785L13.4262 12L17.7046 7.72153C18.0985 7.3277 18.0985 6.68919 17.7046 6.29537C17.3108 5.90154 16.6723 5.90154 16.2785 6.29537L12 10.5739L7.72152 6.29537Z" fill="currentColor"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div class="dialog_content">
          <div class="language_list">
            @for (entry of languageEntries; track entry.key) {
              <button
                class="language_item"
                [class.active]="entry.key === translate.currentLang"
                (click)="switchLanguage(entry.key)"
              >
                {{ entry.value }}
              </button>
            }
          </div>
        </div>
        <div class="dialog_info_wrap">
          <div class="dialog_info">
            <a href="https://citizenos.com/get-involved/volunteer-translator" target="_blank" class="help_us_box">
              <div class="help_us_left">
                <cos-icon name="translation" [size]="48"></cos-icon>
                <span class="help_us_text">{{ 'MODALS.LANGUAGES_MODAL_HELP_US_TRANSLATE' | translate }}</span>
              </div>
              <cos-icon name="arrow-next" [size]="24" class="arrow_icon"></cos-icon>
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dialog_wrap {
      background: var(--color-surfaces);
      border-radius: var(--radius-md);
      width: 560px;
      margin: auto; // Center in panel
      max-height: 80vh;
      display: flex;
      flex-direction: column;
    }

    .dialog_header {
      padding: 24px 24px 16px;
      border-bottom: 1px solid var(--color-border);
    }

    .header_text {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .title {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }

    .btn_dialog_close {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      color: var(--color-text);
      border-radius: var(--radius-sm);

      &:hover { background: var(--color-surface-hover); }
    }

    .dialog_content {
      padding: 16px 24px;
      overflow-y: auto;
      flex: 1;
    }

    .language_list {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 32px;
      padding: 8px 0;
    }

    .language_item {
      display: block;
      width: 100%;
      text-align: left;
      padding: 12px 16px;
      background: none;
      border: none;
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-size: 16px;
      color: var(--color-link);
      font-family: inherit;

      &:hover { color: var(--color-link-hover); }
      &.active {
        color: var(--color-primary);
        font-weight: 600;
        pointer-events: none;
      }
    }

    .dialog_info_wrap {
      padding: 16px 24px;
      border-top: 1px solid var(--color-border);
    }

    .help_us_box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 12px 16px;
      background: var(--color-surface-contrast);
      border-radius: var(--radius-md);
      text-decoration: none;
      color: var(--color-text);
      transition: background var(--transition-fast);

      &:hover {
        background: var(--color-surface-hover);
      }

      .help_us_left {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .help_us_text {
        font-size: 14px;
        font-weight: 600;
        line-height: 1.4;
      }

      .arrow_icon {
        color: var(--color-text);
        opacity: 0.8;
      }
    }
  `]
})
export class LanguageSelectComponent {
  readonly translate = inject(TranslateService);
  private readonly router = inject(Router);
  private readonly dialogRef = inject(DialogRef<LanguageSelectComponent>);
  private readonly userStore = inject(UserStore);
  private readonly userService = inject(UserService);

  readonly languageEntries = Object.entries(SELECTED_LANGUAGES).map(([key, value]) => ({ key, value }));

  async switchLanguage(lang: string) {
    this.translate.use(lang);
    const parsedUrl = this.router.parseUrl(this.router.url);
    const outlet = parsedUrl.root.children[PRIMARY_OUTLET];
    const segments = outlet?.segments.map(s => s.path) ?? [''];
    segments[0] = lang;

    if (this.userStore.isAuthenticated()) {
      try {
        await firstValueFrom(this.userService.updateLanguage(lang));
      } catch {}
    }

    this.router.navigate(segments, {
      queryParams: parsedUrl.queryParams,
      fragment: parsedUrl.fragment || undefined,
    });
    this.dialogRef.close();
  }
}
