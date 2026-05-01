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
    <div class="overlay" dialogClose></div>
    <div class="dialog_wrap">
      <div class="dialog">
        <div class="dialog_header">
          <div class="header_text">
            <h4 class="title" translate="MODALS.LANGUAGES_MODAL_HEADING"></h4>
            <div class="dialog_close">
              <button class="btn_dialog_close icon" dialogClose>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M7.72152 6.29537C7.3277 5.90154 6.68919 5.90154 6.29537 6.29537C5.90154 6.68919 5.90154 7.3277 6.29537 7.72153L10.5738 12L6.29541 16.2785C5.90159 16.6723 5.90159 17.3108 6.29541 17.7046C6.68923 18.0985 7.32774 18.0985 7.72156 17.7046L12 13.4262L16.2784 17.7046C16.6723 18.0985 17.3108 18.0985 17.7046 17.7046C18.0984 17.3108 18.0984 16.6723 17.7046 16.2785L13.4262 12L17.7046 7.72153C18.0985 7.3277 18.0985 6.68919 17.7046 6.29537C17.3108 5.90154 16.6723 5.90154 16.2785 6.29537L12 10.5739L7.72152 6.29537Z"
                    fill="#2C3B47" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div class="dialog_content">
          <div class="language_list">
            @for (entry of languageEntries; track entry.key) {
              <a class="language_item" [class.active]="entry.key === translate.currentLang" (click)="switchLanguage(entry.key)">
                {{ entry.value }}
              </a>
            }
          </div>
        </div>
        <div class="dialog_info_wrap">
          <div id="help_us_box_wrap" class="dialog_info">
            <a href="https://citizenos.com/get-involved/volunteer-translator" target="_blank" class="help_us_box">
              <div class="illustration_who_politics">
                <svg width="51" height="48" viewBox="0 0 51 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M16.7144 31.1427C24.6042 31.1427 31.0001 24.7468 31.0001 16.857C31.0001 8.96722 24.6042 2.57129 16.7144 2.57129C8.82464 2.57129 2.42871 8.96722 2.42871 16.857C2.42871 19.6682 3.24072 22.2898 4.64298 24.4999L2.42871 31.1427L9.07152 28.9284C11.2817 30.3307 13.9032 31.1427 16.7144 31.1427Z" fill="white"/>
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M14.5714 29.0001C22.4611 29.0001 28.8571 22.6042 28.8571 14.7144C28.8571 6.82464 22.4611 0.428711 14.5714 0.428711C6.68158 0.428711 0.285645 6.82464 0.285645 14.7144C0.285645 17.5256 1.09765 20.1472 2.49991 22.3573L0.285645 29.0001L6.92845 26.7859C9.1386 28.1881 11.7602 29.0001 14.5714 29.0001Z" fill="#E9D519"/>
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M16.7141 3.35756C9.25823 3.35756 3.21407 9.40172 3.21407 16.8576C3.21407 19.5153 3.98131 21.9915 5.30607 24.0795L5.50608 24.3948L3.67068 29.901L9.17687 28.0656L9.4921 28.2656C11.5801 29.5903 14.0563 30.3576 16.7141 30.3576C24.1699 30.3576 30.2141 24.3134 30.2141 16.8576C30.2141 9.40172 24.1699 3.35756 16.7141 3.35756ZM1.64264 16.8576C1.64264 8.53384 8.39035 1.78613 16.7141 1.78613C25.0378 1.78613 31.7855 8.53384 31.7855 16.8576C31.7855 25.1813 25.0378 31.929 16.7141 31.929C13.8843 31.929 11.2347 31.1484 8.97124 29.7905L1.18604 32.3856L3.7811 24.6004C2.42324 22.3369 1.64264 19.6873 1.64264 16.8576Z" fill="#2C3B47"/>
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M17.4261 10.096C17.297 9.8194 17.0194 9.64258 16.7141 9.64258C16.4089 9.64258 16.1312 9.8194 16.0021 10.096L11.0021 20.8103C10.8186 21.2035 10.9886 21.6711 11.3819 21.8546C11.7751 22.0381 12.2426 21.8681 12.4261 21.4748L13.8812 18.3569H19.5471L21.0021 21.4748C21.1856 21.8681 21.6532 22.0381 22.0464 21.8546C22.4396 21.6711 22.6096 21.2035 22.4261 20.8103L17.4261 10.096ZM18.8137 16.7854L16.7141 12.2863L14.6145 16.7854H18.8137Z" fill="#2C3B47"/>
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M35.2856 46.1427C27.3958 46.1427 20.9999 39.7468 20.9999 31.857C20.9999 23.9672 27.3958 17.5713 35.2856 17.5713C43.1754 17.5713 49.5713 23.9672 49.5713 31.857C49.5713 34.6682 48.7593 37.2898 47.357 39.4999L49.5713 46.1427L42.9285 43.9284C40.7183 45.3307 38.0968 46.1427 35.2856 46.1427Z" fill="white"/>
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M36.7143 44.0001C28.8245 44.0001 22.4286 37.6042 22.4286 29.7144C22.4286 21.8246 28.8245 15.4287 36.7143 15.4287C44.6041 15.4287 51 21.8246 51 29.7144C51 32.5256 50.188 35.1472 48.7857 37.3573L51 44.0001L44.3572 41.7859C42.147 43.1881 39.5255 44.0001 36.7143 44.0001Z" fill="#E3A8CC"/>
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M35.2859 18.3576C42.7418 18.3576 48.7859 24.4017 48.7859 31.8576C48.7859 34.5153 48.0187 36.9915 46.6939 39.0795L46.4939 39.3948L48.3293 44.9009L42.8231 43.0656L42.5079 43.2656C40.4199 44.5903 37.9437 45.3576 35.2859 45.3576C27.8301 45.3576 21.7859 39.3134 21.7859 31.8576C21.7859 24.4017 27.8301 18.3576 35.2859 18.3576ZM50.3574 31.8576C50.3574 23.5338 43.6096 16.7861 35.2859 16.7861C26.9622 16.7861 20.2145 23.5338 20.2145 31.8576C20.2145 40.1813 26.9622 46.929 35.2859 46.929C38.1157 46.929 40.7653 46.1484 43.0288 44.7905L50.814 47.3856L48.2189 39.6004C49.5768 37.3369 50.3574 34.6873 50.3574 31.8576Z" fill="#2C3B47"/>
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M36.0709 26.857C36.0709 26.4231 35.7191 26.0713 35.2852 26.0713C34.8512 26.0713 34.4994 26.4231 34.4994 26.857V28.2141H30.2857C29.8518 28.2141 29.5 28.5659 29.5 28.9999C29.5 29.4338 29.8518 29.7856 30.2857 29.7856H32.3569C32.3729 31.7531 33.0493 33.5765 34.1694 34.9705C33.257 35.6684 32.1604 36.0713 31 36.0713C30.5661 36.0713 30.2143 36.4231 30.2143 36.857C30.2143 37.2909 30.5661 37.6427 31 37.6427C32.6204 37.6427 34.0966 37.0646 35.2854 36.0965C36.4743 37.0646 37.9504 37.6427 39.5709 37.6427C40.0048 37.6427 40.3566 37.2909 40.3566 36.857C40.3566 36.4231 40.0048 36.0713 39.5709 36.0713C38.4104 36.0713 37.3139 35.6684 36.4014 34.9705C37.5216 33.5765 38.198 31.7531 38.214 29.7856H40.2857C40.7197 29.7856 41.0714 29.4338 41.0714 28.9999C41.0714 28.5659 40.7197 28.2141 40.2857 28.2141H36.0709V26.857ZM35.2854 33.8498C34.4568 32.7656 33.9435 31.3562 33.9284 29.7856H36.6425C36.6274 31.3562 36.1141 32.7656 35.2854 33.8498Z" fill="#2C3B47"/>
                </svg>
              </div>
              <div class="help_us_text" translate="MODALS.LANGUAGES_MODAL_HELP_US_TRANSLATE"></div>
              <div>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M14.5467 6.31262C14.1471 5.89579 13.4991 5.89579 13.0994 6.31262C12.6997 6.72945 12.6997 7.40527 13.0994 7.8221L16.0816 11H6C5.43478 11 5 11.4108 5 12.0003C5 12.5897 5.43478 12.9824 6 12.9824H16.0816L13.0994 16.1779C12.6997 16.5947 12.6997 17.2705 13.0994 17.6874C13.4991 18.1042 14.1471 18.1042 14.5467 17.6874L20 12L14.5467 6.31262Z"
                    fill="#2C3B47" />
                </svg>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @use "mixins";

    .overlay {
      background: transparent;
      position: fixed;
      z-index: 9999;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      width: 100%;
      height: 100%;
    }

    .dialog_wrap {
      display: flex;
      align-items: center;
      flex-direction: column;
      gap: 32px;
      position: absolute;
      padding: 0 0 40px 0;
      top: 0;
      left: 0;
      width: 100%;
      min-height: 100%;
      justify-content: center;
      
      @include mixins.mobile {
        padding: 0;
      }
    }

    .dialog {
      display: flex;
      align-self: center;
      justify-self: center;
      flex-direction: column;
      z-index: 9999;
      position: relative;
      width: 560px;
      height: max-content;
      border-radius: 16px;
      margin-left: auto;
      margin-right: auto;
      margin-top: auto;
      margin-bottom: auto;
      background-color: var(--color-surfaces);

      @include mixins.mobile {
        min-width: initial;
        max-width: 100%;
        width: 100%;
        position: absolute;
        z-index: 9999999;
        padding: 0;
        left: 0;
        top: 0;
        flex: 1 1;
        background-color: var(--color-surfaces);
        min-height: 100%;
        border-radius: 0;
      }

      .dialog_header {
        position: relative;
        display: flex;
        flex-direction: row;
        width: 100%;
        min-height: 56px;
        background-color: var(--color-dialog);
        border-radius: 16px 16px 0 0;
        justify-content: space-between;

        @include mixins.mobile {
          border-radius: 16px 16px 0 0;
          text-align: center;
        }

        .header_text {
          display: flex;
          padding-left: 20px;
          width: 100%;
          align-items: center;
          justify-content: space-between;
          gap: 16px;

          .title {
            font-size: 16px;
            font-weight: 600;
            line-height: 24px;
            margin: 0;
          }
        }

        .dialog_close {
          display: flex;
          justify-content: center;
          height: 100%;
          align-items: center;

          .btn_dialog_close {
            border: none;
            background: none;
            border-radius: 50vh;
            height: 48px;
            width: 48px;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: var(--color-text);
            transition: background-color 0.2s ease-in-out;

            &:hover {
              background-color: var(--color-surface-contrast);
            }
          }
        }
      }

      .dialog_content {
        width: 100%;
        display: flex;
        flex-direction: column;
        background-color: var(--color-dialog-background);
        padding: 0;
      }

      .language_list {
        display: flex;
        position: relative;
        flex-direction: row;
        flex-flow: wrap;
        width: 560px;
        padding: 16px;
        background-color: var(--color-surfaces);

        @include mixins.mobile {
          width: 100%;
          padding: 16px;
        }

        .language_item {
          cursor: pointer;
          font-family: "Noto Sans";
          font-style: normal;
          font-weight: 400;
          font-size: 16px;
          line-height: 24px;
          padding: 8px;
          width: calc(50% - 16px);
          text-align: left;
          display: flex;
          justify-content: flex-start;
          color: var(--color-link);
          text-decoration: none;

          &:hover {
            color: var(--color-link-hover);
          }

          &.active {
            color: var(--color-primary);
            font-weight: 600;
            pointer-events: none;
          }
        }
      }

      .dialog_info_wrap {
        padding: 0;
        background-color: var(--color-dialog-background);
        border-radius: 0 0 16px 16px;

        #help_us_box_wrap {
          background-color: initial;
          padding: 16px;
        }

        .help_us_box {
          cursor: pointer;
          padding: 16px 20px;
          display: flex;
          flex-direction: row;
          width: 100%;
          align-items: center;
          justify-content: space-around;
          border-radius: 8px;
          background-color: var(--color-surface-contrast);
          text-decoration: none;

          .help_us_text {
            color: var(--color-text);
            font-size: 16px;
            font-style: normal;
            font-weight: 600;
            line-height: 24px;
            flex-grow: 2;
            margin-left: 20px;
          }

          @include mixins.mobile {
            flex-direction: column;
            text-align: center;
            :nth-child(3) {
              display: none;
            }
          }
        }
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
