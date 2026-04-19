import {
  Component, signal, inject, ChangeDetectionStrategy, ViewEncapsulation, HostListener
} from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UserStore } from '../../../state/user.store';
import { DialogService } from '../../../../shared/dialog';
import { InitialsComponent } from '../../../../shared/components/initials/initials.component';
import { LogoComponent } from '../../../../shared/components/logo/logo.component';
import { LanguageSelectComponent } from '../language-select/language-select.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
const LANG_LABELS: Record<string, string> = {
  et: 'Eesti', en: 'English', ru: 'Русский', fi: 'Suomi',
  pl: 'Polski', de: 'Deutsch', fr: 'Français', uk: 'Українська',
  lt: 'Lietuvių', lv: 'Latviešu', cs: 'Čeština', sl: 'Slovenščina',
  hu: 'Magyar', bg: 'Български', ca: 'Català', es: 'Español',
  hr: 'Hrvatski', it: 'Italiano', nl: 'Nederlands', ro: 'Română',
  sk: 'Slovenčina', sv: 'Svenska', tr: 'Türkçe',
};

@Component({
  selector: 'cos-nav',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [RouterLink, RouterLinkActive, TranslateModule, InitialsComponent, LogoComponent, IconComponent],
  template: `
    <!-- Mobile top bar -->
    <div class="nav_mobile">
      <div class="logo_wrap">
        <a [routerLink]="['/', translate.currentLang]">
          <cos-logo />
        </a>
      </div>
      <div class="nav_mobile_actions">
        <button class="nav_icon_btn" (click)="toggleNav()" aria-label="Toggle navigation">
          @if (!showNav()) {
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M5 6C4.44772 6 4 6.44772 4 7C4 7.55228 4.44772 8 5 8L19 8C19.5523 8 20 7.55228 20 7C20 6.44772 19.5523 6 19 6L5 6ZM4 12C4 11.4477 4.44772 11 5 11L19 11C19.5523 11 20 11.4477 20 12C20 12.5523 19.5523 13 19 13L5 13C4.44772 13 4 12.5523 4 12ZM4 17C4 16.4477 4.44772 16 5 16L19 16C19.5523 16 20 16.4477 20 17C20 17.5523 19.5523 18 19 18H5C4.44772 18 4 17.5523 4 17Z" fill="currentColor"/>
            </svg>
          } @else {
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M7.72152 6.29537C7.3277 5.90154 6.68919 5.90154 6.29537 6.29537C5.90154 6.68919 5.90154 7.3277 6.29537 7.72153L10.5738 12L6.29541 16.2785C5.90159 16.6723 5.90159 17.3108 6.29541 17.7046C6.68923 18.0985 7.32774 18.0985 7.72156 17.7046L12 13.4262L16.2784 17.7046C16.6723 18.0985 17.3108 18.0985 17.7046 17.7046C18.0984 17.3108 18.0984 16.6723 17.7046 16.2785L13.4262 12L17.7046 7.72153C18.0985 7.3277 18.0985 6.68919 17.7046 6.29537C17.3108 5.90154 16.6723 5.90154 16.2785 6.29537L12 10.5739L7.72152 6.29537Z" fill="currentColor"/>
            </svg>
          }
        </button>
        @if (userStore.isAuthenticated() && userStore.user(); as user) {
          <a class="nav_avatar_link" [routerLink]="['/', translate.currentLang, 'account']" fragment="profile">
            <div class="profile_photo">
              @if (user.imageUrl) {
                <img [src]="user.imageUrl" [alt]="user.name">
              } @else {
                <cos-initials [name]="user.name" />
              }
            </div>
          </a>
        }
      </div>
    </div>

    <!-- Overlay for tablet/mobile -->
    @if (showNav()) {
      <div class="nav_overlay" (click)="toggleNav()"></div>
    }

    <!-- Sidebar -->
    <div class="nav_wrap">
      <nav class="nav" [class.nav_is_open]="showNav()">

        <!-- Desktop logo -->
        <div class="logo_wrap desktop_logo">
          <a [routerLink]="['/', translate.currentLang]" (click)="closeNav()">
            <cos-logo />
          </a>
        </div>

        <div class="nav_scroll">
          <!-- Create menu -->
          <div class="nav_create_wrap">
            <button class="nav_create_btn" (click)="toggleCreateMenu()">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1V15M1 8H15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <span>{{ 'DEFAULT.NAV.BTN_CREATE' | translate }}</span>
            </button>
            @if (showCreateMenu()) {
              <div class="nav_create_menu">
                <a class="create_menu_item" [routerLink]="['/', translate.currentLang, 'topics', 'create']" (click)="closeCreateMenu()">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M19.5 9L14.25 3H6C5.17157 3 4.49999 3.66866 4.5 4.49709L4.50008 19.2273C4.50008 20.2023 5.36055 21 6.22897 21H17.9211C18.7895 21 19.5 20.2023 19.5 19.2273V9ZM13.5001 4.5V9H17.25L13.5001 4.5ZM12.0001 4.5H6L6.00008 19.2273C6.00008 19.2647 6.01779 19.3374 6.09563 19.4147C6.13234 19.4512 6.17061 19.4756 6.20106 19.4891C6.21881 19.497 6.22963 19.4994 6.23301 19.5H17.8975C17.9021 19.4962 17.9083 19.4903 17.9161 19.4816C17.9546 19.4383 18 19.3513 18 19.2273V10.5H12.0001V4.5Z" fill="currentColor"/>
                  </svg>
                  <div>
                    <div class="item_title">{{ 'COMPONENTS.CREATE.TITLE_DISCUSSION' | translate }}</div>
                    <div class="item_desc">{{ 'COMPONENTS.CREATE.DESC_DISCUSSION' | translate }}</div>
                  </div>
                </a>
                <a class="create_menu_item" [routerLink]="['/', translate.currentLang, 'groups', 'create']" (click)="closeCreateMenu()">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M15 7.5C15 9.98528 12.9853 12 10.5 12C8.01472 12 6 9.98528 6 7.5C6 5.01472 8.01472 3 10.5 3C12.9853 3 15 5.01472 15 7.5ZM13.5 7.5C13.5 9.15685 12.1569 10.5 10.5 10.5C8.84315 10.5 7.5 9.15685 7.5 7.5C7.5 5.84315 8.84315 4.5 10.5 4.5C12.1569 4.5 13.5 5.84315 13.5 7.5Z" fill="currentColor"/>
                    <path d="M16.5 4.5C17.8581 4.5 19.5 5.47677 19.5 7.5C19.5 9.52323 17.8581 10.5 16.5 10.5V12C18.4419 12 21 10.5768 21 7.5C21 4.42323 18.4419 3 16.5 3V4.5Z" fill="currentColor"/>
                    <path d="M18 13.5H18.75C20.8211 13.5 22.5 15.1789 22.5 17.25V21H21V17.25C21 16.0074 19.9926 15 18.75 15H18V13.5Z" fill="currentColor"/>
                    <path d="M8.25 13.5C6.17893 13.5 4.5 15.1789 4.5 17.25V21H6V17.25C6 16.0074 7.00736 15 8.25 15H12.75C13.9926 15 15 16.0074 15 17.25V21H16.5V17.25C16.5 15.1789 14.8211 13.5 12.75 13.5H8.25Z" fill="currentColor"/>
                  </svg>
                  <div>
                    <div class="item_title">{{ 'COMPONENTS.CREATE.TITLE_GROUP' | translate }}</div>
                    <div class="item_desc">{{ 'COMPONENTS.CREATE.DESC_GROUP' | translate }}</div>
                  </div>
                </a>
              </div>
            }
          </div>

          <!-- Authenticated user section -->
          @if (userStore.isAuthenticated() && userStore.user(); as user) {
            <div class="line_separator"></div>
            <div class="profile_section">
              <div class="profile_photo">
                @if (user.imageUrl) {
                  <img [src]="user.imageUrl" [alt]="user.name">
                } @else {
                  <cos-initials [name]="user.name" />
                }
              </div>
              <div class="profile_text">
                <div class="user_name">{{ user.name }}</div>
                <div class="profile_dropdown" [class.open]="showProfileDropdown()">
                  <button class="profile_dropdown_trigger" (click)="toggleProfileDropdown()">
                    <span>{{ 'DEFAULT.NAV.LNK_MY_ACCOUNT' | translate }}</span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M5 8L8 11L11 8" stroke="currentColor" stroke-linecap="round"/>
                    </svg>
                  </button>
                  @if (showProfileDropdown()) {
                    <div class="profile_dropdown_menu">
                      <div class="logged_in_as">
                        <div>{{ 'DEFAULT.NAV.LOGGED_IN_AS' | translate }}</div>
                        <div class="bold">{{ user.email }}</div>
                      </div>
                      <div class="separator"></div>
                      <a class="dropdown_option" [routerLink]="['/', translate.currentLang, 'account']" fragment="profile" (click)="closeNav()">
                        {{ 'DEFAULT.NAV.OPT_ACCOUNT_DETAILS' | translate }}
                      </a>
                      <div class="separator"></div>
                      <a class="dropdown_option" [routerLink]="['/', translate.currentLang, 'account']" fragment="notifications" (click)="closeNav()">
                        {{ 'DEFAULT.NAV.OPT_NOTIFICATION_SETTINGS' | translate }}
                      </a>
                      <div class="separator"></div>
                      <button class="dropdown_option logout" (click)="logout()">
                        {{ 'DEFAULT.NAV.LNK_LOG_OUT' | translate }}
                      </button>
                    </div>
                  }
                </div>
              </div>
            </div>
            <div class="line_separator"></div>

            <!-- Authenticated nav links -->
            <div class="nav_items_wrap">
              <a class="nav_item" routerLinkActive="active" [routerLink]="['/', translate.currentLang, 'dashboard']" (click)="closeNav()">
                <!-- Dashboard / home icon -->
                <cos-icon name="home" class="nav_icon"></cos-icon>
                <span>{{ 'DEFAULT.NAV.LNK_DASHBOARD' | translate }}</span>
              </a>
              <a class="nav_item" routerLinkActive="active" [routerLink]="['/', translate.currentLang, 'my', 'topics']" (click)="closeNav()">
                <!-- Document / topic icon -->
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M13 6L9.49999 2H4C3.44771 2 3 2.44577 3 2.99806L3.00005 12.8182C3.00005 13.4682 3.5737 14 4.15265 14H11.9474C12.5263 14 13 13.4682 13 12.8182V6ZM9.00005 3V6H11.5L9.00005 3ZM8.00005 3H4L4.00005 12.8182C4.00005 12.8431 4.01186 12.8916 4.06376 12.9431C4.08823 12.9674 4.11374 12.9837 4.13404 12.9928C4.14588 12.998 4.15308 12.9996 4.15534 13H11.9317C11.9347 12.9975 11.9389 12.9936 11.9441 12.9877C11.9698 12.9589 12 12.9009 12 12.8182V7H8.00005V3Z" fill="currentColor"/>
                </svg>
                <span>{{ 'DEFAULT.NAV.LNK_MY_TOPICS' | translate }}</span>
              </a>
              <a class="nav_item" routerLinkActive="active" [routerLink]="['/', translate.currentLang, 'my', 'groups']" (click)="closeNav()">
                <!-- People / groups icon -->
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M10 5C10 6.65685 8.65685 8 7 8C5.34315 8 4 6.65685 4 5C4 3.34315 5.34315 2 7 2C8.65685 2 10 3.34315 10 5ZM9 5C9 6.10457 8.10457 7 7 7C5.89543 7 5 6.10457 5 5C5 3.89543 5.89543 3 7 3C8.10457 3 9 3.89543 9 5Z" fill="currentColor"/>
                  <path d="M11 3C11.9054 3 13 3.65118 13 5C13 6.34882 11.9054 7 11 7V8C12.2946 8 14 7.05118 14 5C14 2.94882 12.2946 2 11 2V3Z" fill="currentColor"/>
                  <path d="M12 9H12.5C13.8807 9 15 10.1193 15 11.5V14H14V11.5C14 10.6716 13.3284 10 12.5 10H12V9Z" fill="currentColor"/>
                  <path d="M5.5 9C4.11929 9 3 10.1193 3 11.5V14H4V11.5C4 10.6716 4.67157 10 5.5 10H8.5C9.32843 10 10 10.6716 10 11.5V14H11V11.5C11 10.1193 9.88071 9 8.5 9H5.5Z" fill="currentColor"/>
                </svg>
                <span>{{ 'DEFAULT.NAV.LNK_MY_GROUPS' | translate }}</span>
              </a>
            </div>
            <div class="line_separator"></div>
          }

          <!-- Public nav links -->
          <div class="nav_items_wrap">
            <a class="nav_item" routerLinkActive="active" [routerLink]="['/', translate.currentLang, 'public', 'topics']" (click)="closeNav()">
              <!-- Globe icon for public topics -->
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 15C7.02 15 6.10417 14.8162 5.2525 14.4487C4.40083 14.0812 3.66 13.5825 3.03 12.9525C2.4 12.3225 1.90417 11.5787 1.5425 10.7212C1.18083 9.86375 1 8.945 1 7.965C1 6.985 1.18083 6.07208 1.5425 5.22625C1.90417 4.38042 2.4 3.6425 3.03 3.0125C3.66 2.3825 4.40083 1.88958 5.2525 1.53375C6.10417 1.17792 7.02 1 8 1C8.98 1 9.89583 1.17792 10.7475 1.53375C11.5992 1.88958 12.34 2.3825 12.97 3.0125C13.6 3.6425 14.0958 4.38042 14.4575 5.22625C14.8192 6.07208 15 6.985 15 7.965C15 8.945 14.8192 9.86375 14.4575 10.7212C14.0958 11.5787 13.6 12.3225 12.97 12.9525C12.34 13.5825 11.5992 14.0812 10.7475 14.4487C9.89583 14.8162 8.98 15 8 15ZM8 13.985C8.40833 13.565 8.74958 13.0837 9.02375 12.5412C9.29792 11.9987 9.5225 11.3542 9.6975 10.6075H6.32C6.48333 11.3075 6.70208 11.9375 6.97625 12.4975C7.25042 13.0575 7.59167 13.5533 8 13.985ZM6.5125 13.775C6.22083 13.3317 5.97 12.8533 5.76 12.34C5.55 11.8267 5.375 11.2492 5.235 10.6075H2.61C3.05333 11.4358 3.56667 12.0863 4.15 12.5588C4.73333 13.0312 5.52083 13.4367 6.5125 13.775ZM9.505 13.7575C10.345 13.4892 11.1004 13.0867 11.7713 12.55C12.4421 12.0133 12.9817 11.3658 13.39 10.6075H10.7825C10.6308 11.2375 10.4529 11.8092 10.2487 12.3225C10.0446 12.8358 9.79667 13.3142 9.505 13.7575ZM2.26 9.5575H5.0425C5.0075 9.2425 4.98708 8.95958 4.98125 8.70875C4.97542 8.45792 4.9725 8.21 4.9725 7.965C4.9725 7.67333 4.97833 7.41375 4.99 7.18625C5.00167 6.95875 5.025 6.705 5.06 6.425H2.26C2.17833 6.705 2.12292 6.95583 2.09375 7.1775C2.06458 7.39917 2.05 7.66167 2.05 7.965C2.05 8.26833 2.06458 8.53958 2.09375 8.77875C2.12292 9.01792 2.17833 9.2775 2.26 9.5575ZM6.1275 9.5575H9.89C9.93667 9.19583 9.96583 8.90125 9.9775 8.67375C9.98917 8.44625 9.995 8.21 9.995 7.965C9.995 7.73167 9.98917 7.50708 9.9775 7.29125C9.96583 7.07542 9.93667 6.78667 9.89 6.425H6.1275C6.08083 6.78667 6.05167 7.07542 6.04 7.29125C6.02833 7.50708 6.0225 7.73167 6.0225 7.965C6.0225 8.21 6.02833 8.44625 6.04 8.67375C6.05167 8.90125 6.08083 9.19583 6.1275 9.5575ZM10.94 9.5575H13.74C13.8217 9.2775 13.8771 9.01792 13.9062 8.77875C13.9354 8.53958 13.95 8.26833 13.95 7.965C13.95 7.66167 13.9354 7.39917 13.9062 7.1775C13.8771 6.95583 13.8217 6.705 13.74 6.425H10.9575C10.9925 6.83333 11.0158 7.14542 11.0275 7.36125C11.0392 7.57708 11.045 7.77833 11.045 7.965C11.045 8.22167 11.0363 8.46375 11.0188 8.69125C11.0013 8.91875 10.975 9.2075 10.94 9.5575ZM10.765 5.375H13.39C13.005 4.57 12.4771 3.89917 11.8062 3.3625C11.1354 2.82583 10.3625 2.44667 9.4875 2.225C9.77917 2.65667 10.0271 3.12333 10.2312 3.625C10.4354 4.12667 10.6133 4.71 10.765 5.375ZM6.32 5.375H9.715C9.58667 4.75667 9.37083 4.15875 9.0675 3.58125C8.76417 3.00375 8.40833 2.49333 8 2.05C7.62667 2.365 7.31167 2.77917 7.055 3.2925C6.79833 3.80583 6.55333 4.5 6.32 5.375ZM2.61 5.375H5.2525C5.38083 4.745 5.54417 4.18208 5.7425 3.68625C5.94083 3.19042 6.19167 2.70917 6.495 2.2425C5.62 2.46417 4.85583 2.8375 4.2025 3.3625C3.54917 3.8875 3.01833 4.55833 2.61 5.375Z" fill="currentColor"/>
              </svg>
              <span>{{ 'DEFAULT.NAV.LNK_PUBLIC_TOPICS' | translate }}</span>
            </a>
            <a class="nav_item" routerLinkActive="active" [routerLink]="['/', translate.currentLang, 'public', 'groups']" (click)="closeNav()">
              <!-- Network / public groups icon -->
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M9 2C9 2.55228 8.55228 3 8 3C7.44772 3 7 2.55228 7 2C7 1.44772 7.44772 1 8 1C8.55228 1 9 1.44772 9 2ZM12.5 4C12.7761 4 13 3.77614 13 3.5C13 3.22386 12.7761 3 12.5 3C12.2239 3 12 3.22386 12 3.5C12 3.77614 12.2239 4 12.5 4ZM12.5 5C13.3284 5 14 4.32843 14 3.5C14 2.67157 13.3284 2 12.5 2C11.6716 2 11 2.67157 11 3.5C11 4.32843 11.6716 5 12.5 5ZM10 8C10 9.10457 9.10457 10 8 10C6.89543 10 6 9.10457 6 8C6 6.89543 6.89543 6 8 6C9.10457 6 10 6.89543 10 8ZM11 8C11 9.65685 9.65685 11 8 11C6.34315 11 5 9.65685 5 8C5 6.34315 6.34315 5 8 5C9.65685 5 11 6.34315 11 8ZM8 15C8.55228 15 9 14.5523 9 14C9 13.4477 8.55228 13 8 13C7.44772 13 7 13.4477 7 14C7 14.5523 7.44772 15 8 15ZM13 12.5C13 12.7761 12.7761 13 12.5 13C12.2239 13 12 12.7761 12 12.5C12 12.2239 12.2239 12 12.5 12C12.7761 12 13 12.2239 13 12.5ZM14 12.5C14 13.3284 13.3284 14 12.5 14C11.6716 14 11 13.3284 11 12.5C11 11.6716 11.6716 11 12.5 11C13.3284 11 14 11.6716 14 12.5ZM14 9C14.5523 9 15 8.55228 15 8C15 7.44772 14.5523 7 14 7C13.4477 7 13 7.44772 13 8C13 8.55228 13.4477 9 14 9ZM3 8C3 8.55228 2.55228 9 2 9C1.44772 9 1 8.55228 1 8C1 7.44772 1.44772 7 2 7C2.55228 7 3 7.44772 3 8ZM3.5 4C3.77614 4 4 3.77614 4 3.5C4 3.22386 3.77614 3 3.5 3C3.22386 3 3 3.22386 3 3.5C3 3.77614 3.22386 4 3.5 4ZM3.5 5C4.32843 5 5 4.32843 5 3.5C5 2.67157 4.32843 2 3.5 2C2.67157 2 2 2.67157 2 3.5C2 4.32843 2.67157 5 3.5 5ZM4 12.5C4 12.7761 3.77614 13 3.5 13C3.22386 13 3 12.7761 3 12.5C3 12.2239 3.22386 12 3.5 12C3.77614 12 4 12.2239 4 12.5ZM5 12.5C5 13.3284 4.32843 14 3.5 14C2.67157 14 2 13.3284 2 12.5C2 11.6716 2.67157 11 3.5 11C4.32843 11 5 11.6716 5 12.5Z" fill="currentColor"/>
              </svg>
              <span>{{ 'DEFAULT.NAV.LNK_PUBLIC_GROUPS' | translate }}</span>
            </a>
          </div>

          <div class="line_separator"></div>

          <!-- Settings links -->
          <div class="nav_items_wrap">
            <button class="nav_item" (click)="openLanguageSelect()">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 15C7.02 15 6.10417 14.8162 5.2525 14.4487C4.40083 14.0812 3.66 13.5825 3.03 12.9525C2.4 12.3225 1.90417 11.5787 1.5425 10.7212C1.18083 9.86375 1 8.945 1 7.965C1 6.985 1.18083 6.07208 1.5425 5.22625C1.90417 4.38042 2.4 3.6425 3.03 3.0125C3.66 2.3825 4.40083 1.88958 5.2525 1.53375C6.10417 1.17792 7.02 1 8 1C8.98 1 9.89583 1.17792 10.7475 1.53375C11.5992 1.88958 12.34 2.3825 12.97 3.0125C13.6 3.6425 14.0958 4.38042 14.4575 5.22625C14.8192 6.07208 15 6.985 15 7.965C15 8.945 14.8192 9.86375 14.4575 10.7212C14.0958 11.5787 13.6 12.3225 12.97 12.9525C12.34 13.5825 11.5992 14.0812 10.7475 14.4487C9.89583 14.8162 8.98 15 8 15ZM8 13.985C8.40833 13.565 8.74958 13.0837 9.02375 12.5412C9.29792 11.9987 9.5225 11.3542 9.6975 10.6075H6.32C6.48333 11.3075 6.70208 11.9375 6.97625 12.4975C7.25042 13.0575 7.59167 13.5533 8 13.985ZM2.26 9.5575H5.0425C5.0075 9.2425 4.98708 8.95958 4.98125 8.70875C4.97542 8.45792 4.9725 8.21 4.9725 7.965C4.9725 7.67333 4.97833 7.41375 4.99 7.18625C5.00167 6.95875 5.025 6.705 5.06 6.425H2.26C2.17833 6.705 2.12292 6.95583 2.09375 7.1775C2.06458 7.39917 2.05 7.66167 2.05 7.965C2.05 8.26833 2.06458 8.53958 2.09375 8.77875C2.12292 9.01792 2.17833 9.2775 2.26 9.5575ZM6.1275 9.5575H9.89C9.93667 9.19583 9.96583 8.90125 9.9775 8.67375C9.98917 8.44625 9.995 8.21 9.995 7.965C9.995 7.73167 9.98917 7.50708 9.9775 7.29125C9.96583 7.07542 9.93667 6.78667 9.89 6.425H6.1275C6.08083 6.78667 6.05167 7.07542 6.04 7.29125C6.02833 7.50708 6.0225 7.73167 6.0225 7.965C6.0225 8.21 6.02833 8.44625 6.04 8.67375C6.05167 8.90125 6.08083 9.19583 6.1275 9.5575ZM10.765 5.375H13.39C13.005 4.57 12.4771 3.89917 11.8062 3.3625C11.1354 2.82583 10.3625 2.44667 9.4875 2.225C9.77917 2.65667 10.0271 3.12333 10.2312 3.625C10.4354 4.12667 10.6133 4.71 10.765 5.375ZM6.32 5.375H9.715C9.58667 4.75667 9.37083 4.15875 9.0675 3.58125C8.76417 3.00375 8.40833 2.49333 8 2.05C7.62667 2.365 7.31167 2.77917 7.055 3.2925C6.79833 3.80583 6.55333 4.5 6.32 5.375ZM2.61 5.375H5.2525C5.38083 4.745 5.54417 4.18208 5.7425 3.68625C5.94083 3.19042 6.19167 2.70917 6.495 2.2425C5.62 2.46417 4.85583 2.8375 4.2025 3.3625C3.54917 3.8875 3.01833 4.55833 2.61 5.375Z" fill="currentColor"/>
              </svg>
              <span>{{ currentLanguageLabel }}</span>
            </button>
          </div>
        </div>

        <!-- Nav footer with social links -->
        <div class="nav_footer">
          <a class="footer_icon" href="https://www.facebook.com/citizenos.web" target="_blank" rel="noopener" aria-label="Facebook">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect width="16" height="16" rx="8" fill="#2C3B47"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M8.65037 12V8.35076H9.93695L10.1297 6.92848H8.65037V6.0206C8.65037 5.60888 8.77061 5.32833 9.39072 5.32833L10.1818 5.32807V4.05596C10.0448 4.03876 9.5754 4 9.02917 4C7.88872 4 7.10793 4.66275 7.10793 5.87994V6.92848H5.81812V8.35076H7.10793V12" fill="white"/>
            </svg>
          </a>
          <a class="footer_icon" href="https://www.instagram.com/citizen_os_foundation/" target="_blank" rel="noopener" aria-label="Instagram">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect width="16" height="16" rx="8" fill="#2C3B47"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M7.99873 5.94778C6.86465 5.94778 5.94531 6.86712 5.94531 8.0012C5.94531 9.13526 6.86465 10.0546 7.99873 10.0546C9.13279 10.0546 10.0521 9.13526 10.0521 8.0012C10.0521 6.86712 9.13279 5.94778 7.99873 5.94778ZM7.99873 9.3341C7.26257 9.3341 6.6658 8.73734 6.6658 8.0012C6.6658 7.26504 7.26257 6.66828 7.99873 6.66828C8.73487 6.66828 9.33163 7.26504 9.33163 8.0012C9.33163 8.73734 8.73487 9.3341 7.99873 9.3341Z" fill="white"/>
              <path d="M10.1332 6.34648C10.3982 6.34648 10.613 6.13165 10.613 5.86664C10.613 5.60162 10.3982 5.38678 10.1332 5.38678C9.86816 5.38678 9.65332 5.60162 9.65332 5.86664C9.65332 6.13165 9.86816 6.34648 10.1332 6.34648Z" fill="white"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M7.99875 4.00244C6.91275 4.00244 6.77657 4.00704 6.35006 4.0265C5.92444 4.04592 5.63376 4.11352 5.37941 4.21238C5.11646 4.31455 4.89346 4.45128 4.67114 4.67358C4.44884 4.8959 4.31211 5.1189 4.20994 5.38185C4.11108 5.6362 4.04348 5.92689 4.02406 6.35251C4.0046 6.77901 4 6.91519 4 8.00119C4 9.08717 4.0046 9.22335 4.02406 9.64985C4.04348 10.0755 4.11108 10.3662 4.20994 10.6205C4.31211 10.8835 4.44884 11.1065 4.67114 11.3288C4.89346 11.5511 5.11646 11.6878 5.37941 11.79C5.63376 11.8888 5.92444 11.9564 6.35006 11.9759C6.77657 11.9953 6.91275 11.9999 7.99875 11.9999C9.08473 11.9999 9.22091 11.9953 9.64741 11.9759C10.073 11.9564 10.3637 11.8888 10.6181 11.79C10.881 11.6878 11.104 11.5511 11.3263 11.3288C11.5486 11.1065 11.6854 10.8835 11.7876 10.6205C11.8864 10.3662 11.954 10.0755 11.9734 9.64985C11.9929 9.22335 11.9975 9.08717 11.9975 8.00119C11.9975 6.91519 11.9929 6.77901 11.9734 6.35251C11.954 5.92689 11.8864 5.6362 11.7876 5.38185C11.6854 5.1189 11.5486 4.8959 11.3263 4.67358C11.104 4.45128 10.881 4.31455 10.6181 4.21238C10.3637 4.11352 10.073 4.04592 9.64741 4.0265C9.22091 4.00704 9.08473 4.00244 7.99875 4.00244ZM7.99875 4.72293C9.06645 4.72293 9.19292 4.72701 9.61457 4.74625C10.0044 4.76403 10.2162 4.82917 10.3571 4.88393C10.5437 4.95647 10.6769 5.04312 10.8169 5.18306C10.9568 5.32298 11.0434 5.45619 11.116 5.64284C11.1707 5.78374 11.2359 5.99547 11.2537 6.38535C11.2729 6.807 11.277 6.93347 11.277 8.00119C11.277 9.06889 11.2729 9.19536 11.2537 9.61701C11.2359 10.0069 11.1707 10.2186 11.116 10.3595C11.0434 10.5462 10.9568 10.6794 10.8169 10.8193C10.6769 10.9592 10.5437 11.0459 10.3571 11.1184C10.2162 11.1732 10.0044 11.2383 9.61457 11.2561C9.19298 11.2753 9.06652 11.2794 7.99875 11.2794C6.93095 11.2794 6.80451 11.2753 6.38291 11.2561C5.99303 11.2383 5.7813 11.1732 5.6404 11.1184C5.45375 11.0459 5.32054 10.9592 5.18062 10.8193C5.0407 10.6794 4.95403 10.5462 4.88149 10.3595C4.82673 10.2186 4.76159 10.0069 4.74381 9.61701C4.72457 9.19536 4.72049 9.06889 4.72049 8.00119C4.72049 6.93347 4.72457 6.807 4.74381 6.38535C4.76159 5.99547 4.82673 5.78374 4.88149 5.64284C4.95403 5.45619 5.04068 5.32298 5.18062 5.18306C5.32054 5.04312 5.45375 4.95647 5.6404 4.88393C5.7813 4.82917 5.99303 4.76403 6.38291 4.74625C6.80456 4.72701 6.93103 4.72293 7.99875 4.72293Z" fill="white"/>
            </svg>
          </a>
          <a class="footer_icon" href="https://twitter.com/Citizen_OS" target="_blank" rel="noopener" aria-label="X (Twitter)">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect width="16" height="16" rx="8" fill="#2C3B47"/>
              <path d="M10.3005 4.5H11.5272L8.84717 7.46513L12 11.5H9.53136L7.59783 9.05287L5.38544 11.5H4.15798L7.02452 8.32846L4 4.5H6.53131L8.27905 6.73677L10.3005 4.5ZM9.86993 10.7892H10.5497L6.16196 5.17344H5.43253L9.86993 10.7892Z" fill="white"/>
            </svg>
          </a>
        </div>
      </nav>
    </div>
  `,
  styleUrls: ['./nav.component.scss']
})
export class NavComponent {
  readonly translate = inject(TranslateService);
  readonly userStore = inject(UserStore);
  private readonly dialog = inject(DialogService);
  private readonly router = inject(Router);

  showNav = signal(false);
  showCreateMenu = signal(false);
  showProfileDropdown = signal(false);

  get currentLanguageLabel(): string {
    return LANG_LABELS[this.translate.currentLang] ?? this.translate.currentLang.toUpperCase();
  }

  toggleNav() {
    this.showNav.update(v => !v);
    if (!this.showNav()) {
      this.showCreateMenu.set(false);
      this.showProfileDropdown.set(false);
    }
  }

  closeNav() {
    this.showNav.set(false);
    this.showCreateMenu.set(false);
    this.showProfileDropdown.set(false);
  }

  toggleCreateMenu() {
    this.showCreateMenu.update(v => !v);
  }

  closeCreateMenu() {
    this.showCreateMenu.set(false);
  }

  toggleProfileDropdown() {
    this.showProfileDropdown.update(v => !v);
  }

  openLanguageSelect() {
    this.dialog.open(LanguageSelectComponent);
    this.closeNav();
  }

  async logout() {
    await this.userStore.logout();
    this.closeNav();
    this.router.navigate(['/', this.translate.currentLang]);
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.showNav()) this.closeNav();
  }
}
