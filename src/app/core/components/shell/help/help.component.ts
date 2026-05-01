import { Component, ElementRef, inject, signal, computed, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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

@Component({
  selector: 'cos-help',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule, ReactiveFormsModule, IconComponent],
  template: `
    @if (uiState.showHelp()) {
      <div class="help_overlay" (click)="uiState.showHelp.set(false)"></div>
      <div id="help_panel" class="open">
        <div class="help_header">
          <button class="help_back" (click)="helpBack()" [title]="'COMPONENTS.HELP.BTN_BACK' | translate">
             <cos-icon name="chevron-left" [size]="24"></cos-icon>
          </button>
          <div class="help_title" translate="COMPONENTS.HELP.TITLE"></div>
          <button class="help_close" (click)="uiState.showHelp.set(false)">
            <cos-icon name="close" [size]="24"></cos-icon>
          </button>
        </div>

        <div class="help_content">
           <iframe #helpFrame [src]="urlSafe()" class="help_iframe"></iframe>
           
           @if (showTourBox()) {
             <div class="tour_box">
               <div class="tour_title" translate="COMPONENTS.HELP.HEADING_TOUR"></div>
               <div class="tour_desc" translate="COMPONENTS.HELP.DESC_TOUR"></div>
               <button class="btn_medium_submit" (click)="startTour()" translate="COMPONENTS.HELP.BTN_START_TOUR"></button>
             </div>
           }

           <div class="feedback_section">
             <div class="feedback_title" translate="COMPONENTS.HELP.HEADING_FEEDBACK"></div>
             <form [formGroup]="helpForm" (ngSubmit)="sendHelpRequest()">
               <div class="input_wrap">
                 <input type="email" formControlName="email" [placeholder]="'COMPONENTS.HELP.PLACEHOLDER_EMAIL' | translate">
               </div>
               <div class="input_wrap">
                 <textarea formControlName="description" [placeholder]="'COMPONENTS.HELP.PLACEHOLDER_DESCRIPTION' | translate" required></textarea>
               </div>
               <button type="submit" class="btn_medium_submit" [disabled]="helpForm.invalid" translate="COMPONENTS.HELP.BTN_SEND"></button>
             </form>
           </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .help_overlay {
      position: fixed;
      inset: 0;
      z-index: 99;
      background-color: rgba(44, 59, 71, 0.8);
    }

    #help_panel {
      position: fixed;
      right: -400px;
      top: 0;
      width: 400px;
      height: 100%;
      background: var(--color-background);
      z-index: 100;
      display: flex;
      flex-direction: column;
      transition: right 0.3s ease;
      box-shadow: -2px 0 10px rgba(0,0,0,0.1);
    }

    #help_panel.open {
      right: 0;
    }

    .help_header {
      display: flex;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid var(--color-border);
      gap: 16px;
    }

    .help_title {
      flex: 1;
      font-weight: 600;
      font-size: 18px;
    }

    .help_back, .help_close {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      color: var(--color-text);
      display: flex;
      align-items: center;
    }

    .help_content {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .help_iframe {
      width: 100%;
      height: 400px;
      border: none;
      background: #f9f9f9;
      border-radius: 8px;
    }

    .tour_box, .feedback_section {
      background: var(--color-surfaces);
      padding: 16px;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .tour_title, .feedback_title {
      font-weight: 600;
      font-size: 16px;
    }

    .input_wrap input, .input_wrap textarea {
      width: 100%;
      padding: 10px;
      border: 1px solid var(--color-border);
      border-radius: 4px;
      background: var(--color-background);
      color: var(--color-text);
    }

    .input_wrap textarea {
      height: 100px;
      resize: vertical;
    }

    .btn_medium_submit {
      align-self: flex-start;
      padding: 10px 24px;
      background: var(--color-primary);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
    }

    .btn_medium_submit:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    @media (max-width: 560px) {
      #help_panel {
        width: 100%;
        right: -100%;
      }
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
    this.uiState.showHelp.set(false);
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
