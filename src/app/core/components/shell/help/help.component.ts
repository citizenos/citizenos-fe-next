import { Component, ElementRef, inject, signal, computed, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule, UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { ConfigStore } from '../../../state/config.store';
import { UiStateService } from '../../../services/ui-state.service';
import { TourService } from '../../../services/tour.service';
import { NotificationService } from '../../../services/notification.service';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { TermsLinksComponent } from '../../../../shared/components/terms-links/terms-links.component';

@Component({
  selector: 'cos-help',
  standalone: true,
  imports: [TranslateModule, FormsModule, ReactiveFormsModule, IconComponent, TermsLinksComponent],
  template: `
    @if (uiState.showHelp() || helptooltip()) {
      <div id="dark_overlay" class="help_overlay" (click)="toggleHelp()"></div>
    }

    @if (uiState.showHelp()) {
      <div class="help_widget">
        <div class="help_header_wrap">
          <div></div>
          <div class="help_title_text_wrapper">
            <div class="help_title_text" translate="HELP_WIDGET.HEADER_TITLE"></div>
          </div>
          <button class="btn_small_plain icon" (click)="toggleHelp()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M5.29289 17.2929C4.90237 17.6834 4.90237 18.3166 5.29289 18.7071C5.68342 19.0976 6.31658 19.0976 6.70711 18.7071L12 13.4142L17.2929 18.7071C17.6834 19.0976 18.3166 19.0976 18.7071 18.7071C19.0976 18.3166 19.0976 17.6834 18.7071 17.2929L13.4142 12L18.7071 6.70711C19.0976 6.31658 19.0976 5.68342 18.7071 5.29289C18.3166 4.90237 17.6834 4.90237 17.2929 5.29289L12 10.5858L6.70711 5.29289C6.31658 4.90237 5.68342 4.90237 5.29289 5.29289C4.90237 5.68342 4.90237 6.31658 5.29289 6.70711L10.5858 12L5.29289 17.2929Z"
                fill="#2C3B47" />
            </svg>
          </button>
        </div>

        @if (showTourBox()) {
          <div id="mobile_tour_info_wrap">
            <div class="title_wrap">
              <div>
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="40" height="40" rx="20" fill="#5C9CD0" />
                  <path
                    d="M23 11.5292C23 12.926 21.9255 14.0583 20.6 14.0583C19.2745 14.0583 18 12.926 18 11.5292C18 10.1323 19.2745 9 20.6 9C21.9255 9 23 10.1323 23 11.5292Z"
                    fill="white" />
                  <path
                    d="M17.3359 16.5357L22.8319 15.8098L20.4295 27.7096C20.2591 28.5695 20.4991 29.0576 21.1591 29.0576C21.6247 29.0576 22.3255 28.8806 22.8055 28.4354L22.5943 29.4876C21.9055 30.3626 20.3863 31 19.0783 31C17.3911 31 16.6735 29.9327 17.1391 27.664L18.9103 18.8929C19.0639 18.1518 18.9247 17.8837 18.2191 17.7067L17.1391 17.4968L17.3359 16.5357Z"
                    fill="white" />
                </svg>
              </div>
              <div class="small_heading" translate="HELP_WIDGET.EXTRA_INFO_TOUR_HEADING"></div>
            </div>
            <div class="description" translate="HELP_WIDGET.EXTRA_INFO_TOUR_DESCRIPTION"></div>
            <button (click)="startTour()" class="start_btn" translate="HELP_WIDGET.EXTRA_INFO_TOUR_BTN_START"></button>
          </div>
        }

        <div class="help_content">
          <form id="help_form" [formGroup]="helpForm" (ngSubmit)="sendHelpRequest()">
            <div class="help_form_text_wrap">
              <div class="help_form_heading small_heading" translate="HELP_WIDGET.TITLE"></div>
              <div class="help_form_heading" translate="HELP_WIDGET.DESCRIPTION"></div>
            </div>
            <div class="help_form_input_wrap">
              <textarea formControlName="description"
                [placeholder]="'HELP_WIDGET.PLACEHOLDER_WRITE_YOUR_MESSAGE' | translate" [maxlength]="2048"
                rows="5"></textarea>
              
              <div class="bold" translate="HELP_WIDGET.WANT_A_RESPONCE"></div>
              <input formControlName="email" type="email"
                placeholder="{{'HELP_WIDGET.PLACEHOLDER_WRITE_YOUR_EMAIL' | translate}}" [maxlength]="254">
              
              <button type="submit" [disabled]="helpForm.invalid"
                class="btn_big_submit" translate="HELP_WIDGET.BTN_SEND"></button>
            </div>
          </form>
        </div>

        <div class="links_content">
          <div class="bold links_content_title" translate="HELP_WIDGET.LINKS_TITLE"></div>
          <cos-terms-links />
        </div>
      </div>
    }

    <div id="help_bubble" (click)="toggleHelp();">
      <svg width="76" height="76" viewBox="0 0 76 76" fill="none" xmlns="http://www.w3.org/2000/svg">
        <title>icon_bubble_help</title>
        <g filter="url(#filter0_dd_7017_69077)">
          <circle cx="38" cy="34" r="30" fill="#1168A8" />
        </g>
        <circle cx="38" cy="34" r="16" fill="white" stroke="white" />
        <path fill-rule="evenodd" clip-rule="evenodd"
          d="M36.138 38H39.5181V37.222C39.5181 35.2986 43 34.78 43 31.2358C43 28.4479 40.5362 27 38.2557 27C35.5271 27 34 28.7937 34 28.7937L35.9548 31.3222C35.9548 31.3222 36.9118 30.3929 37.8891 30.3929C38.6629 30.3929 39.3348 30.9332 39.3348 31.668C39.3348 33.4833 36.138 34.002 36.138 36.9194V38ZM36 42H40V39H36V42Z"
          fill="#1168A8" />
        <defs>
          <filter id="filter0_dd_7017_69077" x="0" y="0" width="76" height="76" filterUnits="userSpaceOnUse"
            color-interpolation-filters="sRGB">
            <feFlood flood-opacity="0" result="BackgroundImageFix" />
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha" />
            <feOffset dy="2" />
            <feGaussianBlur stdDeviation="2" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.14 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_7017_69077" />
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha" />
            <feOffset dy="4" />
            <feGaussianBlur stdDeviation="4" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
            <feBlend mode="normal" in2="effect1_dropShadow_7017_69077" result="effect2_dropShadow_7017_69077" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_7017_69077" result="shape" />
          </filter>
        </defs>
      </svg>
    </div>
  `,
  styles: [`
    @use "mixins";

    #help_bubble {
      z-index: 999;
      width: 60px;
      height: 60px;
      position: fixed;
      right: 20px;
      bottom: 20px;
      cursor: pointer;

      @include mixins.tablet {
        bottom: 120px;
        display: none;
      }
    }

    .help_widget {
      z-index: 999999;
      width: 400px;
      position: fixed;
      right: 0px;
      top: 0px;
      height: 100%;
      border-radius: 4px;
      background: var(--color-surfaces);
      box-shadow: 0 0 8px 0 #727c84;
      overflow-y: auto;
      overflow-x: hidden;
      display: flex;
      flex-direction: column;

      @include mixins.mobile {
        width: 100%;
      }

      #mobile_tour_info_wrap {
        display: flex;
        flex-direction: column;
        gap: 16px;
        background-color: #f1f7fc;
        padding: 24px 16px;
        margin: 16px;

        .title_wrap {
          display: flex;
          gap: 8px;

          .small_heading {
            font-size: 16px;
          }
        }

        .start_btn {
          padding: 0px 16px;
          gap: 16px;
          max-height: 40px;
          min-height: 40px;
          min-width: 40px;
          border-radius: 40px;
          font-weight: 600;
          font-size: 14px;
          line-height: 16px;
          background: var(--color-primary);
          color: white;
          border: none;
          cursor: pointer;

          &:hover {
            opacity: 0.9;
          }
        }
      }

      .help_header_wrap {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px;

        .help_title_text {
          font-size: 12px;
          font-style: normal;
          font-weight: 600;
          line-height: 16px;
          color: #727c84;
          text-transform: uppercase;
        }

        .btn_small_plain {
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 4px;
        }
      }

      .links_content {
        padding: 16px;
        border-radius: 4px;
        background: var(--color-background);
        margin-top: 16px;

        .links_content_title {
          margin-bottom: 16px;
        }
      }

      .help_content {
        flex: 1;
        width: 100%;

        iframe {
          width: 100%;
          height: 100%;
          border: none;
        }
      }
    }

    #help_form {
      display: flex;
      flex-direction: column;
      padding: 16px;
      gap: 16px;

      .help_form_text_wrap {
        display: flex;
        gap: 16px;
        flex-direction: column;
      }

      .help_form_input_wrap {
        display: flex;
        gap: 8px;
        flex-direction: column;
        width: 100%;

        button {
          margin-top: 8px;
          width: 100%;
          padding: 12px;
          background: var(--color-primary);
          color: white;
          border: none;
          border-radius: 4px;
          font-weight: 600;
          cursor: pointer;

          &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        }
      }
    }

    .help_overlay {
      position: fixed;
      inset: 0;
      z-index: 12;
      background-color: rgba(44, 59, 71, 0.8);
      cursor: pointer;
    }

    .bold {
      font-weight: 600;
    }

    .small_heading {
      font-weight: 600;
      font-size: 14px;
    }
  `]
})
export class HelpComponent {
  @ViewChild('helpFrame') helpFrame?: ElementRef;
  
  private sanitizer = inject(DomSanitizer);
  private configStore = inject(ConfigStore);
  private translate = inject(TranslateService);
  private router = inject(Router);
  private http = inject(HttpClient);
  private notification = inject(NotificationService);
  private tourService = inject(TourService);
  public uiState = inject(UiStateService);
  public helptooltip = signal(false);

  helpForm = new UntypedFormGroup({
    email: new UntypedFormControl(null, Validators.email),
    description: new UntypedFormControl('', Validators.required),
  });

  urlSafe = computed(() => {
    const lang = this.translate.currentLang || 'en';
    const links = this.configStore.links.help();
    const url = links[lang] || links['en'];
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  showTourBox = computed(() => {
    const url = this.router.url;
    const tourName = this.getTourName();
    return !!tourName && !url.includes('/create/') && !url.includes('/edit/');
  });

  private getTourName() {
    const url = this.router.url;
    if (url.includes('/dashboard')) return 'dashboard';
    if (url.includes('/topics/')) return 'topic';
    return null;
  }

  toggleHelp() {
    this.uiState.showHelp.set(!this.uiState.showHelp());
  }

  helpBack() {
    try {
      const lang = this.translate.currentLang || 'en';
      const links = this.configStore.links.help();
      const helpUrl = links[lang] || links['en'];
      const helpDomain = new URL(helpUrl);
      this.helpFrame?.nativeElement.contentWindow.postMessage('back', helpDomain.origin);
    } catch (err) {
      if (this.helpFrame) {
        this.helpFrame.nativeElement.src = this.helpFrame.nativeElement.src;
      }
    }
  }

  startTour() {
    this.toggleHelp();
    window.scrollTo(0, 0);
    const tourName = this.getTourName();
    if (tourName) {
      const width = window.innerWidth;
      if (width > 1024) {
        this.tourService.show(tourName, 1);
      } else if (width > 560) {
        this.tourService.show(`${tourName}_tablet`, 1);
      } else {
        this.tourService.show(`${tourName}_mobile`, 1);
      }
    }
  }

  sendHelpRequest() {
    if (this.helpForm.valid) {
      const path = `${this.configStore.api.baseUrl()}/api/internal/help`;
      const mailData = {
        ...this.helpForm.value,
        userAgent: window.navigator.userAgent,
        platform: (window.navigator as any).platform,
        height: window.innerHeight,
        width: window.innerWidth,
        location: window.location.href
      };
      
      this.http.post(path, mailData, { withCredentials: true }).subscribe({
        next: () => {
          this.helpForm.reset();
          this.uiState.showHelp.set(false);
          this.notification.success('HELP_WIDGET.MSG_REQUEST_SENT');
        },
        error: (err) => {
          this.notification.error(err.message);
        }
      });
    }
  }
}
