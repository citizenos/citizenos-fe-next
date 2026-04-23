import {
  Component, signal, inject, ChangeDetectionStrategy, ViewEncapsulation, HostListener
} from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CreateMenuComponent } from '../../../../shared/components/create-menu/create-menu.component';
import { UserStore } from '../../../state/user.store';
import { DialogService } from '../../../../shared/dialog';
import { InitialsComponent } from '../../../../shared/components/initials/initials.component';
import { LogoComponent } from '../../../../shared/components/logo/logo.component';
import { LanguageSelectComponent } from '../language-select/language-select.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { SELECTED_LANGUAGES } from '../../../constants/languages';


@Component({
  selector: 'cos-nav',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [RouterLink, RouterLinkActive, TranslateModule, InitialsComponent, LogoComponent, IconComponent, CreateMenuComponent],
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
            <cos-icon name="nav-menu" [size]="24"></cos-icon>
          } @else {
            <cos-icon name="nav-close" [size]="24"></cos-icon>
          }
        </button>
        @if (userStore.isAuthenticated()) {
          <a class="nav_avatar_link" [routerLink]="['/', translate.currentLang, 'account']" fragment="profile">
            <div class="profile_photo">
              @if (userStore.user()?.imageUrl) {
                <img [src]="userStore.user()?.imageUrl" [alt]="userStore.user()?.name">
              } @else {
                <cos-initials [name]="userStore.user()?.name || ''" />
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

    <!-- Mobile/Tablet Bottom Nav -->
    @if (userStore.isAuthenticated()) {
      <div id="mobile_nav_wrap">
        <div id="tablet_nav" [class.hidden]="showCreateMenu()">
          <a class="btn_medium_nav icon" [routerLink]="['/', translate.currentLang, 'dashboard']" routerLinkActive="active" (click)="closeNav()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.8375 3.60105C11.5329 3.10434 12.4671 3.10434 13.1625 3.60105L19.1625 7.88676C19.6881 8.26219 20 8.86833 20 9.51423V18.9996C20 20.1042 19.1046 20.9996 18 20.9996H13V14.9996H11V20.9996H6C4.89543 20.9996 4 20.1042 4 18.9996V9.51423C4 8.86833 4.31193 8.26219 4.83752 7.88676L10.8375 3.60105ZM18 9.51423L12 5.22852L6 9.51423V18.9996H9V12.9996H15V18.9996H18V9.51423Z" fill="#2C3B47" /></svg>
          </a>
          <a class="btn_medium_nav icon" [routerLink]="['/', translate.currentLang, 'my', 'topics']"  routerLinkActive="active" (click)="closeNav()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M6 19H18V10.139L13.0577 5L6 5V19ZM6 3C4.89543 3 4 3.89543 4 5V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V10.139C20 9.62207 19.7999 9.12522 19.4415 8.75264L14.4992 3.61364C14.1222 3.22157 13.6017 3 13.0577 3H6Z" fill="#2C3B47" /><path fill-rule="evenodd" clip-rule="evenodd" d="M11 5H13V10H18V12H11V5Z" fill="#2C3B47" /></svg>
          </a>
          <a class="btn_medium_nav icon" [routerLink]="['/', translate.currentLang, 'my', 'groups']"  routerLinkActive="active" (click)="closeNav()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M14 7C14 9.76142 11.7614 12 9 12C6.23858 12 4 9.76142 4 7C4 4.23858 6.23858 2 9 2C11.7614 2 14 4.23858 14 7ZM12 7C12 8.65685 10.6569 10 9 10C7.34315 10 6 8.65685 6 7C6 5.34315 7.34315 4 9 4C10.6569 4 12 5.34315 12 7Z" fill="#2C3B47" /><path d="M15 4C16.3708 4 18 4.98236 18 7C18 9.01764 16.3708 10 15 10V12C17.1492 12 20 10.4224 20 7C20 3.57764 17.1492 2 15 2V4Z" fill="#2C3B47" /><path d="M16 13H17C19.2091 13 21 14.7909 21 17V21H19V17C19 15.8954 18.1046 15 17 15H16V13Z" fill="#2C3B47" /><path d="M7 13C4.79086 13 3 14.7909 3 17V21H5V17C5 15.8954 5.89543 15 7 15H11C12.1046 15 13 15.8954 13 17V21H15V17C15 14.7909 13.2091 13 11 13H7Z" fill="#2C3B47" /></svg>
          </a>
          <a id="tablet_create" class="btn_nav_create icon" (click)="toggleCreateMenu()">
            @if (!showCreateMenu()) {
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" rx="20" fill="#2C3B47" /><path d="M20 28C19.4711 28 19.0423 27.5712 19.0423 27.0423L19.0423 20.9577H12.9577C12.4288 20.9577 12 20.5289 12 20C12 19.4711 12.4288 19.0423 12.9577 19.0423H19.0423V12.9577C19.0423 12.4288 19.4711 12 20 12C20.5289 12 20.9577 12.4288 20.9577 12.9577V19.0423L27.0423 19.0423C27.5712 19.0423 28 19.4711 28 20C28 20.5289 27.5712 20.9577 27.0423 20.9577H20.9577V27.0423C20.9577 27.5712 20.5289 28 20 28Z" fill="white" /></svg>
            } @else {
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" rx="20" fill="#2C3B47" /><path d="M20 28C19.4711 28 19.0423 27.5712 19.0423 27.0423L19.0423 20.9577H12.9577C12.4288 20.9577 12 20.5289 12 20C12 19.4711 12.4288 19.0423 12.9577 19.0423H19.0423V12.9577C19.0423 12.4288 19.4711 12 20 12C20.5289 12 20.9577 12.4288 20.9577 12.9577V19.0423L27.0423 19.0423C27.5712 19.0423 28 19.4711 28 20C28 20.5289 27.5712 20.9577 27.0423 20.9577H20.9577V27.0423C20.9577 27.5712 20.5289 28 20 28Z" fill="white" transform="rotate(45 20 20)" /></svg>
            }
          </a>
          <a class="btn_medium_nav icon" [routerLink]="['/', translate.currentLang, 'public', 'topics']"  routerLinkActive="active" (click)="closeNav()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="#2C3B47" stroke-width="2" /><path d="M10.2308 6.8125V5.8125H9.23077V6.8125H10.2308ZM10.2308 9.625V10.625C10.7831 10.625 11.2308 10.1773 11.2308 9.625H10.2308ZM7 9.625V8.625H6V9.625H7ZM13 4V4.8125H15V4H13ZM12 5.8125H10.2308V7.8125H12V5.8125ZM9.23077 6.8125V9.625H11.2308V6.8125H9.23077ZM10.2308 8.625H7V10.625H10.2308V8.625ZM6 9.625V12H8V9.625H6ZM13 4.8125C13 5.36478 12.5523 5.8125 12 5.8125V7.8125C13.6569 7.8125 15 6.46935 15 4.8125H13Z" fill="#2C3B47" /><path d="M4 9L9.5 14.5V16.25C9.5 16.8023 9.94772 17.25 10.5 17.25H11V20" stroke="#2C3B47" stroke-width="2" /><path d="M14.6667 17H13.6667V18H14.6667V17ZM14.6667 13H15.6667C15.6667 12.4477 15.219 12 14.6667 12V13ZM16 16H14.6667V18H16V16ZM15.6667 17V13H13.6667V17H15.6667ZM14.6667 12H8V14H14.6667V12ZM19 19C19 17.3431 17.6569 16 16 16V18C16.5523 18 17 18.4477 17 19H19Z" fill="#2C3B47" /></svg>
          </a>
          <a class="btn_medium_nav icon" [routerLink]="['/', translate.currentLang, 'public', 'groups']"  routerLinkActive="active" (click)="closeNav()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_1034_98590)"><circle cx="12" cy="12" r="4" stroke="#2C3B47" stroke-width="2" /><circle cx="19.5" cy="4.5" r="1.5" stroke="#2C3B47" stroke-width="2" /><circle cx="12" cy="2" r="2" fill="#2C3B47" /><circle cx="12" cy="22" r="2" fill="#2C3B47" /><circle cx="2" cy="12" r="2" fill="#2C3B47" /><circle cx="22" cy="12" r="2" fill="#2C3B47" /><circle cx="19.5" cy="19.5" r="1.5" stroke="#2C3B47" stroke-width="2" /><circle cx="4.5" cy="4.5" r="1.5" stroke="#2C3B47" stroke-width="2" /><circle cx="4.5" cy="19.5" r="1.5" stroke="#2C3B47" stroke-width="2" /></g><defs><clipPath id="clip0_1034_98590"><rect width="24" height="24" fill="white" /></clipPath></defs></svg>
          </a>
        </div>
        <div id="mobile_nav" [class.hidden]="showCreateMenu()">
          <a class="btn_medium_nav icon" [routerLink]="['/', translate.currentLang, 'dashboard']" routerLinkActive="active" (click)="closeNav()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.8375 3.60105C11.5329 3.10434 12.4671 3.10434 13.1625 3.60105L19.1625 7.88676C19.6881 8.26219 20 8.86833 20 9.51423V18.9996C20 20.1042 19.1046 20.9996 18 20.9996H13V14.9996H11V20.9996H6C4.89543 20.9996 4 20.1042 4 18.9996V9.51423C4 8.86833 4.31193 8.26219 4.83752 7.88676L10.8375 3.60105ZM18 9.51423L12 5.22852L6 9.51423V18.9996H9V12.9996H15V18.9996H18V9.51423Z" fill="#2C3B47" /></svg>
          </a>
          <a class="btn_medium_nav icon" [routerLink]="['/', translate.currentLang, 'my', 'topics']"  routerLinkActive="active" (click)="closeNav()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M6 19H18V10.139L13.0577 5L6 5V19ZM6 3C4.89543 3 4 3.89543 4 5V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V10.139C20 9.62207 19.7999 9.12522 19.4415 8.75264L14.4992 3.61364C14.1222 3.22157 13.6017 3 13.0577 3H6Z" fill="#2C3B47" /><path fill-rule="evenodd" clip-rule="evenodd" d="M11 5H13V10H18V12H11V5Z" fill="#2C3B47" /></svg>
          </a>
          <a id="mobile_create" class="btn_nav_create icon" (click)="toggleCreateMenu()">
            @if (!showCreateMenu()) {
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" rx="20" fill="#2C3B47" /><path d="M20 28C19.4711 28 19.0423 27.5712 19.0423 27.0423L19.0423 20.9577H12.9577C12.4288 20.9577 12 20.5289 12 20C12 19.4711 12.4288 19.0423 12.9577 19.0423H19.0423V12.9577C19.0423 12.4288 19.4711 12 20 12C20.5289 12 20.9577 12.4288 20.9577 12.9577V19.0423L27.0423 19.0423C27.5712 19.0423 28 19.4711 28 20C28 20.5289 27.5712 20.9577 27.0423 20.9577H20.9577V27.0423C20.9577 27.5712 20.5289 28 20 28Z" fill="white" /></svg>
            } @else {
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" rx="20" fill="#2C3B47" /><path d="M20 28C19.4711 28 19.0423 27.5712 19.0423 27.0423L19.0423 20.9577H12.9577C12.4288 20.9577 12 20.5289 12 20C12 19.4711 12.4288 19.0423 12.9577 19.0423H19.0423V12.9577C19.0423 12.4288 19.4711 12 20 12C20.5289 12 20.9577 12.4288 20.9577 12.9577V19.0423L27.0423 19.0423C27.5712 19.0423 28 19.4711 28 20C28 20.5289 27.5712 20.9577 27.0423 20.9577H20.9577V27.0423C20.9577 27.5712 20.5289 28 20 28Z" fill="white" transform="rotate(45 20 20)" /></svg>
            }
          </a>
          <a class="btn_medium_nav icon" [routerLink]="['/', translate.currentLang, 'my', 'groups']"  routerLinkActive="active" (click)="closeNav()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M14 7C14 9.76142 11.7614 12 9 12C6.23858 12 4 9.76142 4 7C4 4.23858 6.23858 2 9 2C11.7614 2 14 4.23858 14 7ZM12 7C12 8.65685 10.6569 10 9 10C7.34315 10 6 8.65685 6 7C6 5.34315 7.34315 4 9 4C10.6569 4 12 5.34315 12 7Z" fill="#2C3B47" /><path d="M15 4C16.3708 4 18 4.98236 18 7C18 9.01764 16.3708 10 15 10V12C17.1492 12 20 10.4224 20 7C20 3.57764 17.1492 2 15 2V4Z" fill="#2C3B47" /><path d="M16 13H17C19.2091 13 21 14.7909 21 17V21H19V17C19 15.8954 18.1046 15 17 15H16V13Z" fill="#2C3B47" /><path d="M7 13C4.79086 13 3 14.7909 3 17V21H5V17C5 15.8954 5.89543 15 7 15H11C12.1046 15 13 15.8954 13 17V21H15V17C15 14.7909 13.2091 13 11 13H7Z" fill="#2C3B47" /></svg>
          </a>
        </div>
      </div>
    } @else {
      <div id="mobile_login">
        <button class="btn_big_submit" [routerLink]="['/', translate.currentLang, 'account', 'login']" (click)="closeNav()">{{ 'DEFAULT.NAV.BTN_LOGIN' | translate }}</button>
        <button class="btn_big_submit_ghost" [routerLink]="['/', translate.currentLang, 'account', 'signup']" (click)="closeNav()">{{ 'DEFAULT.NAV.BTN_REGISTER' | translate }}</button>
      </div>
    }

    <!-- Sidebar -->
    <div class="nav_wrap" [class.nav_is_open]="showNav()">
      <nav class="nav">

        <!-- Desktop logo -->
        <div class="logo_wrap desktop_logo">
          <a routerLink="/">
            <cos-logo />
          </a>
        </div>

        <div class="nav_scroll">
          <!-- Create menu -->
          @if (userStore.isAuthenticated()) {
            <div class="nav_create_wrap">
              <button class="nav_create_btn" (click)="toggleCreateMenu()">
                <cos-icon name="plus" [size]="16"></cos-icon>
                <span>{{ 'DEFAULT.NAV.BTN_CREATE' | translate }}</span>
              </button>
              @if (showCreateMenu()) {
                <div class="nav_create_menu">
                  <cos-create-menu (onClose)="closeCreateMenu()" />
                </div>
              }
            </div>

            <!-- Authenticated user section -->
            <div class="line_separator"></div>
            <div class="profile_section">
              <div class="profile_photo">
                @if (userStore.user()?.imageUrl) {
                  <img [src]="userStore.user()?.imageUrl" [alt]="userStore.user()?.name">
                } @else {
                  <cos-initials [name]="userStore.user()?.name || ''" />
                }
              </div>
              <div class="profile_text">
                <div class="user_name">{{ userStore.user()?.name }}</div>
                <div class="profile_dropdown" [class.open]="showProfileDropdown()">
                  <button class="profile_dropdown_trigger" (click)="toggleProfileDropdown()">
                    <span>{{ 'DEFAULT.NAV.LNK_MY_ACCOUNT' | translate }}</span>
                    <cos-icon name="chevron-down" [size]="16"></cos-icon>
                  </button>
                  @if (showProfileDropdown()) {
                    <div class="profile_dropdown_menu">
                      <div class="logged_in_as">
                        <div class="logged_in_icon">
                           <cos-icon name="mail" [size]="32" class="mail_icon"></cos-icon>
                        </div>
                        <div class="logged_in_text">
                          <div class="label">{{ 'DEFAULT.NAV.LOGGED_IN_AS' | translate }}</div>
                          <div class="email">{{ userStore.user()?.email }}</div>
                        </div>
                      </div>
                      <div class="separator"></div>
                      <a class="dropdown_option" [routerLink]="['/', translate.currentLang, 'account']" fragment="profile" (click)="closeNav()">
                        <cos-icon name="user" [size]="16"></cos-icon>
                        <span>{{ 'DEFAULT.NAV.OPT_ACCOUNT_DETAILS' | translate }}</span>
                      </a>
                      <div class="separator"></div>
                      <a class="dropdown_option" [routerLink]="['/', translate.currentLang, 'account']" fragment="notifications" (click)="closeNav()">
                        <cos-icon name="bell" [size]="16"></cos-icon>
                        <span>{{ 'DEFAULT.NAV.OPT_NOTIFICATION_SETTINGS' | translate }}</span>
                      </a>
                      <div class="separator"></div>
                      <button class="dropdown_option logout" (click)="logout()">
                        <cos-icon name="logout" [size]="16"></cos-icon>
                        <span>{{ 'DEFAULT.NAV.LNK_LOG_OUT' | translate }}</span>
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
                <cos-icon name="home" class="nav_icon"></cos-icon>
                <span>{{ 'DEFAULT.NAV.LNK_DASHBOARD' | translate }}</span>
              </a>
              <a class="nav_item" routerLinkActive="active" [routerLink]="['/', translate.currentLang, 'my', 'topics']" (click)="closeNav()">
                <cos-icon name="topic" class="nav_icon"></cos-icon>
                <span>{{ 'DEFAULT.NAV.LNK_MY_TOPICS' | translate }}</span>
              </a>
              <a class="nav_item" routerLinkActive="active" [routerLink]="['/', translate.currentLang, 'my', 'groups']" (click)="closeNav()">
                <cos-icon name="groups" class="nav_icon"></cos-icon>
                <span>{{ 'DEFAULT.NAV.LNK_MY_GROUPS' | translate }}</span>
              </a>
            </div>
            <div class="line_separator"></div>
          }

          @if (!userStore.isAuthenticated()) {
            <div class="big_button_wrap">
              <button class="btn_big_submit" [routerLink]="['/', translate.currentLang, 'account', 'login']" (click)="closeNav()">{{ 'DEFAULT.NAV.BTN_LOGIN' | translate }}</button>
              <button class="btn_big_submit_ghost" [routerLink]="['/', translate.currentLang, 'account', 'signup']" (click)="closeNav()">{{ 'DEFAULT.NAV.BTN_REGISTER' | translate }}</button>
            </div>
          }
          <!-- Public nav links -->
          <div class="nav_items_wrap">
            <a class="nav_item" routerLinkActive="active" [routerLink]="['/', translate.currentLang, 'public', 'topics']" (click)="closeNav()">
              <cos-icon name="public-topic" class="nav_icon"></cos-icon>
              <span>{{ 'DEFAULT.NAV.LNK_PUBLIC_TOPICS' | translate }}</span>
            </a>
            <a class="nav_item" routerLinkActive="active" [routerLink]="['/', translate.currentLang, 'public', 'groups']" (click)="closeNav()">
              <cos-icon name="public-groups" class="nav_icon"></cos-icon>
              <span>{{ 'DEFAULT.NAV.LNK_PUBLIC_GROUPS' | translate }}</span>
            </a>
          </div>


          <div class="line_separator"></div>

          <!-- Legacy #nav_items_constant equivalents -->
          <div class="nav_items_wrap">
            <button class="nav_item" (click)="openLanguageSelect()">
              <div class="icon_wrap">
                 <cos-icon name="globe" [size]="16"></cos-icon>
              </div>
              <span>{{ currentLanguageLabel }}</span>
            </button>
            <a class="nav_item" href="https://citizenos.com/help?app=true" target="_blank">
              <div class="icon_wrap">
                <cos-icon name="help" [size]="16"></cos-icon>
                @if (helpExtraInfo()) {
                  <div class="orange_dot"></div>
                }
              </div>
              <span>{{ 'DEFAULT.NAV.LNK_HELP' | translate }}</span>
            </a>
            <a class="nav_item" href="https://citizenos.com/donate" target="_blank">
               <div class="icon_wrap">
                <cos-icon name="about" [size]="16"></cos-icon>
              </div>
              <span>{{ 'DEFAULT.NAV.LNK_ABOUT' | translate }}</span>
            </a>
            <a class="nav_item" href="https://citizenos.com/faq" target="_blank">
              <div class="icon_wrap">
                <cos-icon name="faq" [size]="16"></cos-icon>
              </div>
              <span>{{ 'DEFAULT.NAV.LNK_FAQ' | translate }}</span>
            </a>
          </div>
        </div>

        <!-- Nav footer -->
        <div class="nav_footer_wrap">
          <div class="nav_footer">
            <div class="social_links">
              <a class="footer_icon_wrap" href="https://www.facebook.com/citizenos.web" target="_blank" rel="noopener" aria-label="Facebook">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="16" height="16" rx="8" fill="#2C3B47"/>
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M8.65037 12V8.35076H9.93695L10.1297 6.92848H8.65037V6.0206C8.65037 5.60888 8.77061 5.32833 9.39072 5.32833L10.1818 5.32807V4.05596C10.0448 4.03876 9.5754 4 9.02917 4C7.88872 4 7.10793 4.66275 7.10793 5.87994V6.92848H5.81812V8.35076H7.10793V12" fill="white"/>
                </svg>
              </a>
              <a class="footer_icon_wrap" href="https://www.instagram.com/citizen_os_foundation/" target="_blank" rel="noopener" aria-label="Instagram">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="16" height="16" rx="8" fill="#2C3B47"/>
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M8 5.6C6.68 5.6 5.6 6.68 5.6 8C5.6 9.32 6.68 10.4 8 10.4C9.32 10.4 10.4 9.32 10.4 8C10.4 6.68 9.32 5.6 8 5.6ZM8 9.6C7.12 9.6 6.4 8.88 6.4 8C6.4 7.12 7.12 6.4 8 6.4C8.88 6.4 9.6 7.12 9.6 8C9.6 8.88 8.88 9.6 8 9.6Z" fill="white"/>
                  <path d="M10.4 5.2C10.4 4.9 10.1 4.6 9.8 4.6C9.5 4.6 9.2 4.9 9.2 5.2C9.2 5.5 9.5 5.8 9.8 5.8C10.1 5.8 10.4 5.5 10.4 5.2Z" fill="white"/>
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M8 3.2C6.5 3.2 6.3 3.2 5.7 3.2C4.2 3.3 3.3 4.2 3.2 5.7C3.2 6.3 3.2 6.5 3.2 8C3.2 9.5 3.2 9.7 3.2 10.3C3.3 11.8 4.2 12.7 5.7 12.8C6.3 12.8 6.5 12.8 8 12.8C9.5 12.8 9.7 12.8 10.3 12.8C11.8 12.7 12.7 11.8 12.8 10.3C12.8 9.7 12.8 9.5 12.8 8C12.8 6.5 12.8 6.3 12.8 5.7C12.7 4.2 11.8 3.3 10.3 3.2C9.7 3.2 9.5 3.2 8 3.2ZM8 4C9.5 4 9.6 4 10.2 4C11.3 4.1 11.9 4.7 12 5.8C12 6.4 12 6.5 12 8C12 9.5 12 9.6 12 10.2C11.9 11.3 11.3 11.9 10.2 12C9.6 12 9.5 12 8 12C6.5 12 6.4 12 5.8 12C4.7 11.9 4.1 11.3 4 10.2C4 9.6 4 9.5 4 8C4 6.5 4 6.4 4 5.8C4.1 4.7 4.7 4.1 5.8 4C6.4 4 6.5 4 8 4Z" fill="white"/>
                </svg>
              </a>
              <a class="footer_icon_wrap" href="https://twitter.com/Citizen_OS" target="_blank" rel="noopener" aria-label="X (Twitter)">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="16" height="16" rx="8" fill="#2C3B47"/>
                  <path d="M9.56163 7.22222L12.2609 4H11.6152L9.27652 6.80357L7.40517 4H5.33337L8.16384 8.11905L5.33337 11.5H5.97908L8.4464 8.53571L10.4268 11.5H12.4986L9.56163 7.22222ZM8.77581 8.15476L8.48369 7.73413L6.20756 4.49206H7.09928L9.03527 7.20238L9.32738 7.62302L11.6155 11.0278H10.7238L8.77581 8.15476Z" fill="white"/>
                </svg>
              </a>
              <a class="footer_icon_wrap" href="http://github.com/citizenos" target="_blank" rel="noopener" aria-label="GitHub">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="16" height="16" rx="8" fill="#2C3B47"/>
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M8 3.5C5.515 3.5 3.5 5.515 3.5 8C3.5 9.9875 4.74625 11.6788 6.50875 12.2725C6.73375 12.3125 6.8175 12.1762 6.8175 12.0587C6.8175 11.9537 6.81375 11.6512 6.8125 11.2575C5.5975 11.53 5.3325 10.685 5.3325 10.685C5.1275 10.165 4.83625 10.03 4.83625 10.03C4.43375 9.75 4.86625 9.755 4.86625 9.755C5.31125 9.785 5.545 10.2112 5.545 10.2112C5.94125 10.8988 6.5675 10.7025 6.825 10.59C6.8638 10.2988 6.9775 10.1025 7.1025 9.99C6.13375 9.88 5.115 9.505 5.115 7.8225C5.115 7.32875 5.29375 6.92625 5.555 6.61C5.51125 6.5 5.35375 6.04 5.59625 5.42C5.59625 5.42 5.96875 5.3025 6.80625 5.885C7.13875 5.79125 7.495 5.745 7.84875 5.74375C8.20125 5.745 8.5575 5.79125 8.89125 5.885C9.7275 5.3025 10.0988 5.42 10.0988 5.42C10.3425 6.04 10.185 6.5 10.1413 6.61C10.4038 6.92625 10.5812 7.32875 10.5812 7.8225C10.5812 9.50875 9.5625 9.87875 8.59 9.9825C8.74375 10.1125 8.88125 10.3675 8.88125 10.7563C8.88125 11.3113 8.875 11.7563 8.875 12.0587C8.875 12.1775 8.9575 12.315 9.185 12.2712C10.9475 11.6775 12.1925 9.98625 12.1925 8C12.1925 5.515 10.1775 3.5 8 3.5H8Z" fill="white"/>
                </svg>
              </a>
            </div>

            <div class="footer_hashtag_wrap">#citizenos</div>
          </div>
        </div>
      </nav>
    </div>
  `,
  styleUrl: './nav.component.scss'
})
export class NavComponent {
  readonly translate = inject(TranslateService);
  readonly userStore = inject(UserStore);
  private readonly dialog = inject(DialogService);
  private readonly router = inject(Router);

  showNav = signal(false);
  showCreateMenu = signal(false);
  showProfileDropdown = signal(false);
  helpExtraInfo = signal(false);

  constructor() {
    this.router.events.subscribe(() => {
      const url = this.router.url;
      if (url.includes('/topics/') && !url.includes('/create/') && !url.includes('/edit/')) {
        this.helpExtraInfo.set(true);
      } else {
        this.helpExtraInfo.set(false);
      }
    });
  }

  get currentLanguageLabel(): string {
    return SELECTED_LANGUAGES[this.translate.currentLang] ?? this.translate.currentLang.toUpperCase();
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
