import { Component, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router, PRIMARY_OUTLET } from '@angular/router';
import { DialogRef, DialogCloseDirective } from '../../../../shared/dialog';
import { UserStore } from '../../../state/user.store';
import { UserService } from '../../../services/user.service';
import { firstValueFrom } from 'rxjs';

const LANGUAGES: Record<string, string> = {
  et: 'Eesti',
  en: 'English',
  ru: 'Русский',
  fi: 'Suomi',
  pl: 'Polski',
  de: 'Deutsch',
  fr: 'Français',
  uk: 'Українська',
  lt: 'Lietuvių',
  lv: 'Latviešu',
  cs: 'Čeština',
  sl: 'Slovenščina',
  hu: 'Magyar',
  bg: 'Български',
  ca: 'Català',
  es: 'Español',
  hr: 'Hrvatski',
  it: 'Italiano',
  nl: 'Nederlands',
  ro: 'Română',
  sk: 'Slovenčina',
  sv: 'Svenska',
  tr: 'Türkçe',
};

@Component({
  selector: 'cos-language-select',
  standalone: true,
  imports: [DialogCloseDirective, TranslateModule],
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
              <span>{{ 'MODALS.LANGUAGES_MODAL_HELP_US_TRANSLATE' | translate }}</span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M14.5467 6.31262C14.1471 5.89579 13.4991 5.89579 13.0994 6.31262C12.6997 6.72945 12.6997 7.40527 13.0994 7.8221L16.0816 11H6C5.43478 11 5 11.4108 5 12.0003C5 12.5897 5.43478 12.9824 6 12.9824H16.0816L13.0994 16.1779C12.6997 16.5947 12.6997 17.2705 13.0994 17.6874C13.4991 18.1042 14.1471 18.1042 14.5467 17.6874L20 12L14.5467 6.31262Z" fill="currentColor"/>
              </svg>
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
      width: 400px;
      max-width: 90vw;
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
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .language_item {
      display: block;
      width: 100%;
      text-align: left;
      padding: 10px 12px;
      background: none;
      border: none;
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-size: 14px;
      color: var(--color-text);
      font-family: var(--font-family-base);

      &:hover { background: var(--color-surface-hover); }
      &.active {
        color: var(--color-primary);
        font-weight: 600;
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
      gap: 8px;
      color: var(--color-link);
      text-decoration: none;
      font-size: 14px;

      &:hover { text-decoration: underline; }
    }
  `]
})
export class LanguageSelectComponent {
  readonly translate = inject(TranslateService);
  private readonly router = inject(Router);
  private readonly dialogRef = inject(DialogRef<LanguageSelectComponent>);
  private readonly userStore = inject(UserStore);
  private readonly userService = inject(UserService);

  readonly languageEntries = Object.entries(LANGUAGES).map(([key, value]) => ({ key, value }));

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
