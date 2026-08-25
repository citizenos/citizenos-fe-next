import {
  Component, signal, computed, inject, ChangeDetectionStrategy, ViewEncapsulation, HostListener, OnInit, DestroyRef
} from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CreateMenuComponent } from '../../../../shared/components/create-menu/create-menu.component';
import { UserStore } from '../../../state/user.store';
import { DialogService } from '../../../../shared/dialog';
import { InitialsComponent } from '../../../../shared/components/initials/initials.component';
import { LogoComponent } from '../../../../shared/components/logo/logo.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { SELECTED_LANGUAGES } from '../../../constants/languages';
import { UiStateService } from '../../../services/ui-state.service';
import { ConfigStore } from '../../../state/config.store';
import { TourItemDirective } from '../../../../shared/directives/tour-item.directive';
import { ActivitiesButtonComponent } from '../../../../shared/components/activities-button/activities-button.component';

@Component({
  selector: 'cos-nav',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [RouterLink, RouterLinkActive, TranslateModule, InitialsComponent, LogoComponent, IconComponent, CreateMenuComponent, TourItemDirective, ActivitiesButtonComponent],
  template: `
    <!-- Mobile top bar -->
    <div class="nav_mobile">
      <div class="logo_wrap">
        <a [routerLink]="['/', translate.currentLang]">
          <cos-logo />
        </a>
      </div>
      <div class="nav_mobile_actions">
        <button class="nav_icon_btn" (click)="uiState.showHelp.update(v => !v)" [attr.aria-label]="'DEFAULT.NAV.LNK_HELP' | translate">
          <div class="icon_wrap">
            <cos-icon name="help" [size]="24"></cos-icon>
            @if (helpExtraInfo()) {
              <div class="orange_dot"></div>
            }
          </div>
        </button>
        <button class="nav_icon_btn" (click)="toggleNav()" [attr.aria-label]="'COMPONENTS.ACCESSIBILITY.NAV_TOGGLE' | translate" [attr.aria-expanded]="showNav()"
          [cosTourItem]="{tourid: ['dashboard_mobile', 'dashboard_tablet'], index: 3, position: 'bottom'}">
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
      <div class="nav_overlay" (click)="toggleNav()" (keydown.enter)="toggleNav()" role="button" tabindex="0" [attr.aria-label]="'COMPONENTS.ACCESSIBILITY.NAV_TOGGLE' | translate"></div>
    }

    <!-- Mobile/Tablet Bottom Nav -->
    @if (userStore.isAuthenticated()) {
      <div id="mobile_nav_wrap">
        <div id="tablet_nav" [class.hidden]="showCreateMenu()">
          <a class="btn_medium_nav icon" [routerLink]="['/', translate.currentLang, 'dashboard']" routerLinkActive="active" ariaCurrentWhenActive="page" (click)="closeNav()">
            <cos-icon name="home"></cos-icon>
          </a>
          <a class="btn_medium_nav icon" [routerLink]="['/', translate.currentLang, 'my', 'topics']"  routerLinkActive="active" ariaCurrentWhenActive="page" (click)="closeNav()">
            <cos-icon name="topic"></cos-icon>
          </a>
          <a class="btn_medium_nav icon" [routerLink]="['/', translate.currentLang, 'my', 'groups']"  routerLinkActive="active" ariaCurrentWhenActive="page" (click)="closeNav()" [attr.aria-label]="'DEFAULT.NAV.LNK_MY_GROUPS' | translate">
            <cos-icon name="groups"></cos-icon>
          </a>
          <button type="button" id="tablet_create" class="btn_nav_create icon" (click)="toggleCreateMenu()" [attr.aria-expanded]="showCreateMenu()" aria-haspopup="true" [attr.aria-label]="'DEFAULT.NAV.BTN_CREATE' | translate">
            @if (!showCreateMenu()) {
              <cos-icon name="nav-create" [size]="40"></cos-icon>
            } @else {
              <cos-icon name="nav-create-active" [size]="40"></cos-icon>
            }
          </button>
          <a class="btn_medium_nav icon" [routerLink]="['/', translate.currentLang, 'public', 'topics']"  routerLinkActive="active" ariaCurrentWhenActive="page" (click)="closeNav()" [attr.aria-label]="'DEFAULT.NAV.LNK_PUBLIC_TOPICS' | translate">
            <cos-icon name="public-topic"></cos-icon>
          </a>
          <a class="btn_medium_nav icon" [routerLink]="['/', translate.currentLang, 'public', 'groups']"  routerLinkActive="active" ariaCurrentWhenActive="page" (click)="closeNav()">
            <cos-icon name="public-groups"></cos-icon>
          </a>
          <cos-activities-button></cos-activities-button>
        </div>
        <div id="mobile_nav" [class.hidden]="showCreateMenu()">
          <a class="btn_medium_nav icon" [routerLink]="['/', translate.currentLang, 'dashboard']" routerLinkActive="active" ariaCurrentWhenActive="page" (click)="closeNav()">
            <cos-icon name="home"></cos-icon>
          </a>
          <a class="btn_medium_nav icon" [routerLink]="['/', translate.currentLang, 'my', 'topics']"  routerLinkActive="active" ariaCurrentWhenActive="page" (click)="closeNav()" [attr.aria-label]="'DEFAULT.NAV.LNK_MY_TOPICS' | translate">
            <cos-icon name="topic"></cos-icon>
          </a>
          <button type="button" id="mobile_create" class="btn_nav_create icon" (click)="toggleCreateMenu()" [attr.aria-expanded]="showCreateMenu()" aria-haspopup="true" [attr.aria-label]="'DEFAULT.NAV.BTN_CREATE' | translate">
            @if (!showCreateMenu()) {
              <cos-icon name="nav-create" [size]="40"></cos-icon>
            } @else {
              <cos-icon name="nav-create-active" [size]="40"></cos-icon>
            }
          </button>
          <a class="btn_medium_nav icon" [routerLink]="['/', translate.currentLang, 'my', 'groups']"  routerLinkActive="active" ariaCurrentWhenActive="page" (click)="closeNav()" [attr.aria-label]="'DEFAULT.NAV.LNK_MY_GROUPS' | translate">
            <cos-icon name="groups"></cos-icon>
          </a>
          <cos-activities-button></cos-activities-button>
        </div>
        @defer (when showCreateMenu()) {
          @if (showCreateMenu()) {
            <div class="mobile_create_menu">
              <cos-create-menu (closeMenu)="closeCreateMenu()" />
            </div>
          }
        }
      </div>
    } @else {
      <div id="mobile_login">
        <button type="button" class="btn_big_submit" [routerLink]="['/', translate.currentLang, 'account', 'login']" (click)="closeNav()">{{ 'DEFAULT.NAV.BTN_LOGIN' | translate }}</button>
        <button type="button" class="btn_big_submit_ghost" [routerLink]="['/', translate.currentLang, 'account', 'signup']" (click)="closeNav()">{{ 'DEFAULT.NAV.BTN_REGISTER' | translate }}</button>
      </div>
    }

    <!-- Sidebar -->
    <div class="nav_wrap" [class.nav_is_open]="showNav()" [cosTourItem]="{tourid: 'dashboard', index: 2, position: 'right'}">
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
            <div class="big_button_wrap">
              <button type="button" id="create_button" class="btn_big_submit" [class.active]="showCreateMenu()" (click)="toggleCreateMenu()" [attr.aria-expanded]="showCreateMenu()" aria-haspopup="true"
                [cosTourItem]="{tourid: 'dashboard', index: 1, position: 'right'}">
                <cos-icon name="plus" [size]="24"></cos-icon>
                <span>{{ 'DEFAULT.NAV.BTN_CREATE' | translate }}</span>
              </button>
              @defer (when showCreateMenu()) {
                @if (showCreateMenu()) {
                  <div class="nav_create_menu">
                    <cos-create-menu (closeMenu)="closeCreateMenu()" />
                  </div>
                }
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
                  <button type="button" class="profile_dropdown_trigger" (click)="toggleProfileDropdown()" [attr.aria-expanded]="showProfileDropdown()" aria-haspopup="true">
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
                      <button type="button" class="dropdown_option logout" (click)="logout()">
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
              <a class="nav_item" routerLinkActive="active" ariaCurrentWhenActive="page" [routerLink]="['/', translate.currentLang, 'dashboard']" (click)="closeNav()">
                <div class="icon_wrap">
                  <cos-icon name="home" [size]="16"></cos-icon>
                </div>
                <span>{{ 'DEFAULT.NAV.LNK_DASHBOARD' | translate }}</span>
              </a>
              <a class="nav_item" routerLinkActive="active" ariaCurrentWhenActive="page" [routerLink]="['/', translate.currentLang, 'my', 'topics']" (click)="closeNav()">
                <div class="icon_wrap">
                  <cos-icon name="topic" [size]="16"></cos-icon>
                </div>
                <span>{{ 'DEFAULT.NAV.LNK_MY_TOPICS' | translate }}</span>
              </a>
              <a class="nav_item" routerLinkActive="active" ariaCurrentWhenActive="page" [routerLink]="['/', translate.currentLang, 'my', 'groups']" (click)="closeNav()">
                <div class="icon_wrap">
                  <cos-icon name="groups" [size]="16"></cos-icon>
                </div>
                <span>{{ 'DEFAULT.NAV.LNK_MY_GROUPS' | translate }}</span>
              </a>
            </div>
            <div class="line_separator"></div>
          }

          @if (!userStore.isAuthenticated()) {
            <div class="big_button_wrap">
              <button type="button" class="btn_big_submit" [routerLink]="['/', translate.currentLang, 'account', 'login']" (click)="closeNav()">{{ 'DEFAULT.NAV.BTN_LOGIN' | translate }}</button>
              <button type="button" class="btn_big_submit_ghost" [routerLink]="['/', translate.currentLang, 'account', 'signup']" (click)="closeNav()">{{ 'DEFAULT.NAV.BTN_REGISTER' | translate }}</button>
            </div>
            <div class="line_separator"></div>
          }
          <!-- Public nav links -->
          <div class="nav_items_wrap">
            <a class="nav_item" routerLinkActive="active" ariaCurrentWhenActive="page" [routerLink]="['/', translate.currentLang, 'public', 'topics']" (click)="closeNav()">
              <div class="icon_wrap">
                <cos-icon name="public-topic" [size]="16"></cos-icon>
              </div>
              <span>{{ 'DEFAULT.NAV.LNK_PUBLIC_TOPICS' | translate }}</span>
            </a>
            <a class="nav_item" routerLinkActive="active" ariaCurrentWhenActive="page" [routerLink]="['/', translate.currentLang, 'public', 'groups']" (click)="closeNav()">
              <div class="icon_wrap">
                <cos-icon name="public-groups" [size]="16"></cos-icon>
              </div>
              <span>{{ 'DEFAULT.NAV.LNK_PUBLIC_GROUPS' | translate }}</span>
            </a>
          </div>


          <div class="line_separator"></div>

          <!-- Legacy #nav_items_constant equivalents -->
          <div class="nav_items_wrap">
            <button type="button" class="nav_item" (click)="openLanguageSelect()" [attr.aria-label]="'MODALS.LANGUAGES_MODAL_HEADING' | translate">
              <div class="icon_wrap">
                 <cos-icon name="globe" [size]="16"></cos-icon>
              </div>
              <span>{{ currentLanguageLabel }}</span>
            </button>
            <button type="button" class="nav_item" (click)="uiState.showHelp.update(v => !v); closeNav()">
              <div class="icon_wrap">
                <cos-icon name="help" [size]="16"></cos-icon>
                @if (helpExtraInfo()) {
                  <div class="orange_dot"></div>
                }
              </div>
              <span>{{ 'DEFAULT.NAV.LNK_HELP' | translate }}</span>
            </button>
            <a class="nav_item" [href]="lnkAbout()" target="_blank">
               <div class="icon_wrap">
                <cos-icon name="about" [size]="16"></cos-icon>
              </div>
              <span>{{ 'DEFAULT.NAV.LNK_ABOUT' | translate }}</span>
            </a>
            <!--a class="nav_item" [href]="lnkFaq()" target="_blank">
              <div class="icon_wrap">
                <cos-icon name="faq" [size]="16"></cos-icon>
              </div>
              <span>{{ 'DEFAULT.NAV.LNK_FAQ' | translate }}</span>
            </a-->
            <!--button type="button" class="nav_item" (click)="uiState.showFeedback.set(true); closeNav()">
              <div class="icon_wrap">
                <cos-icon name="nav-feedback" [size]="16"></cos-icon>
              </div>
              <span>{{ 'DEFAULT.NAV.LNK_FEEDBACK' | translate }}</span>
            </button-->
            <!--button type="button" class="nav_item" (click)="uiState.showAccessibility.set(true); closeNav()">
              <div class="icon_wrap">
                <cos-icon name="accessibility" [size]="16"></cos-icon>
              </div>
              <span>{{ 'DEFAULT.NAV.LNK_ACCESSIBILITY' | translate }}</span>
            </button-->
          </div>
        </div>

        <!-- Nav footer -->
        <div class="nav_footer_wrap">
          <div class="nav_footer">
            <div class="social_links">
              <a class="footer_icon_wrap" href="https://www.facebook.com/citizenos.web" target="_blank" rel="noopener" aria-label="Facebook">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="16" height="16" rx="8" fill="#000000" />
                  <path fill-rule="evenodd" clip-rule="evenodd"
                    d="M8.65037 12V8.35076H9.93695L10.1297 6.92848H8.65037V6.0206C8.65037 5.60888 8.77061 5.32833 9.39072 5.32833L10.1818 5.32807V4.05596C10.0448 4.03876 9.5754 4 9.02917 4C7.88872 4 7.10793 4.66275 7.10793 5.87994V6.92848H5.81812V8.35076H7.10793V12"
                    fill="white" />
                </svg>
              </a>
              <a class="footer_icon_wrap" href="https://www.instagram.com/citizen_os_foundation/" target="_blank" rel="noopener" aria-label="Instagram">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="16" height="16" rx="8" fill="#000000" />
                  <path fill-rule="evenodd" clip-rule="evenodd"
                    d="M7.99873 5.94778C6.86465 5.94778 5.94531 6.86712 5.94531 8.0012C5.94531 9.13526 6.86465 10.0546 7.99873 10.0546C9.13279 10.0546 10.0521 9.13526 10.0521 8.0012C10.0521 6.86712 9.13279 5.94778 7.99873 5.94778ZM7.99873 9.3341C7.26257 9.3341 6.6658 8.73734 6.6658 8.0012C6.6658 7.26504 7.26257 6.66828 7.99873 6.66828C8.73487 6.66828 9.33163 7.26504 9.33163 8.0012C9.33163 8.73734 8.73487 9.3341 7.99873 9.3341Z"
                    fill="white" />
                  <path
                    d="M10.1332 6.34648C10.3982 6.34648 10.613 6.13165 10.613 5.86664C10.613 5.60162 10.3982 5.38678 10.1332 5.38678C9.86816 5.38678 9.65332 5.60162 9.65332 5.86664C9.65332 6.13165 9.86816 6.34648 10.1332 6.34648Z"
                    fill="white" />
                  <path fill-rule="evenodd" clip-rule="evenodd"
                    d="M7.99875 4.00244C6.91275 4.00244 6.77657 4.00704 6.35006 4.0265C5.92444 4.04592 5.63376 4.11352 5.37941 4.21238C5.11646 4.31455 4.89346 4.45128 4.67114 4.67358C4.44884 4.8959 4.31211 5.1189 4.20994 5.38185C4.11108 5.6362 4.04348 5.92689 4.02406 6.35251C4.0046 6.77901 4 6.91519 4 8.00119C4 9.08717 4.0046 9.22335 4.02406 9.64985C4.04348 10.0755 4.11108 10.3662 4.20994 10.6205C4.31211 10.8835 4.44884 11.1065 4.67114 11.3288C4.89346 11.5511 5.11646 11.6878 5.37941 11.79C5.63376 11.8888 5.92444 11.9564 6.35006 11.9759C6.77657 11.9953 6.91275 11.9999 7.99875 11.9999C9.08473 11.9999 9.22091 11.9953 9.64741 11.9759C10.073 11.9564 10.3637 11.8888 10.6181 11.79C10.881 11.6878 11.104 11.5511 11.3263 11.3288C11.5486 11.1065 11.6854 10.8835 11.7876 10.6205C11.8864 10.3662 11.954 10.0755 11.9734 9.64985C11.9929 9.22335 11.9975 9.08717 11.9975 8.00119C11.9975 6.91519 11.9929 6.77901 11.9734 6.35251C11.954 5.92689 11.8864 5.6362 11.7876 5.38185C11.6854 5.1189 11.5486 4.8959 11.3263 4.67358C11.104 4.45128 10.881 4.31455 10.6181 4.21238C10.3637 4.11352 10.073 4.04592 9.64741 4.0265C9.22091 4.00704 9.08473 4.00244 7.99875 4.00244ZM7.99875 4.72293C9.06645 4.72293 9.19292 4.72701 9.61457 4.74625C10.0044 4.76403 10.2162 4.82917 10.3571 4.88393C10.5437 4.95647 10.6769 5.04312 10.8169 5.18306C10.9568 5.32298 11.0434 5.45619 11.116 5.64284C11.1707 5.78374 11.2359 5.99547 11.2537 6.38535C11.2729 6.807 11.277 6.93347 11.277 8.00119C11.277 9.06889 11.2729 9.19536 11.2537 9.61701C11.2359 10.0069 11.1707 10.2186 11.116 10.3595C11.0434 10.5462 10.9568 10.6794 10.8169 10.8193C10.6769 10.9592 10.5437 11.0459 10.3571 11.1184C10.2162 11.1732 10.0044 11.2383 9.61457 11.2561C9.19298 11.2753 9.06652 11.2794 7.99875 11.2794C6.93095 11.2794 6.80451 11.2753 6.38291 11.2561C5.99303 11.2383 5.7813 11.1732 5.6404 11.1184C5.45375 11.0459 5.32054 10.9592 5.18062 10.8193C5.0407 10.6794 4.95403 10.5462 4.88149 10.3595C4.82673 10.2186 4.76159 10.0069 4.74381 9.61701C4.72457 9.19536 4.72049 9.06889 4.72049 8.00119C4.72049 6.93347 4.72457 6.807 4.74381 6.38535C4.76159 5.99547 4.82673 5.78374 4.88149 5.64284C4.95403 5.45619 5.04068 5.32298 5.18062 5.18306C5.32054 5.04312 5.45375 4.95647 5.6404 4.88393C5.7813 4.82917 5.99303 4.76403 6.38291 4.74625C6.80456 4.72701 6.93103 4.72293 7.99875 4.72293Z"
                    fill="white" />
                </svg>
              </a>
              <a class="footer_icon_wrap" href="https://twitter.com/Citizen_OS" target="_blank" rel="noopener" aria-label="Twitter">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="16" height="16" rx="8" fill="#000000" />
                  <path
                    d="M10.3005 4.5H11.5272L8.84717 7.46513L12 11.5H9.53136L7.59783 9.05287L5.38544 11.5H4.15798L7.02452 8.32846L4 4.5H6.53131L8.27905 6.73677L10.3005 4.5ZM9.86993 10.7892H10.5497L6.16196 5.17344H5.43253L9.86993 10.7892Z"
                    fill="white" />
                </svg>
              </a>
              <a class="footer_icon_wrap" href="http://github.com/citizenos" target="_blank" rel="noopener" aria-label="GitHub">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="16" height="16" rx="8" fill="#2C3B47" />
                  <path fill-rule="evenodd" clip-rule="evenodd"
                    d="M7.98471 3C5.23242 3 3 5.29466 3 8.1237C3 10.3869 4.43731 12.3044 6.3945 12.9959C6.63914 13.0274 6.73089 12.8702 6.73089 12.7445C6.73089 12.6187 6.73089 12.3044 6.73089 11.8643C5.35474 12.1787 5.04893 11.1728 5.04893 11.1728C4.83486 10.5755 4.49847 10.4184 4.49847 10.4184C4.03976 10.104 4.52905 10.104 4.52905 10.104C5.01835 10.1355 5.29358 10.6384 5.29358 10.6384C5.75229 11.4242 6.45566 11.2042 6.73089 11.0785C6.76147 10.7327 6.91437 10.5127 7.0367 10.3869C5.93578 10.2612 4.7737 9.82112 4.7737 7.8408C4.7737 7.27499 4.95719 6.83492 5.29358 6.45771C5.263 6.36341 5.07951 5.82904 5.35474 5.1375C5.35474 5.1375 5.78287 5.01176 6.73089 5.67187C7.12844 5.54613 7.55657 5.5147 7.98471 5.5147C8.41284 5.5147 8.84098 5.57757 9.23853 5.67187C10.1865 5.01176 10.6147 5.1375 10.6147 5.1375C10.8899 5.82904 10.7064 6.36341 10.6758 6.48915C10.9817 6.83492 11.1957 7.30642 11.1957 7.87223C11.1957 9.85256 10.0336 10.2612 8.93272 10.3869C9.11621 10.5441 9.26911 10.8584 9.26911 11.3299C9.26911 12.0215 9.26911 12.5559 9.26911 12.7445C9.26911 12.8702 9.36086 13.0274 9.6055 12.9959C11.5933 12.3044 13 10.3869 13 8.1237C12.9694 5.29466 10.737 3 7.98471 3Z"
                    fill="white" />
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
export class NavComponent implements OnInit {
  readonly translate = inject(TranslateService);
  readonly userStore = inject(UserStore);
  readonly uiState = inject(UiStateService);
  private readonly configStore = inject(ConfigStore);
  private readonly dialog = inject(DialogService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  lnkDonate = computed(() => {
    const links = this.configStore.links.donate();
    return links[this.translate.currentLang] || links['en'];
  });

  lnkAbout = computed(() => {
    return this.configStore.links.about();
  });

  lnkFaq = computed(() => {
    const links = this.configStore.links.faq();
    return links[this.translate.currentLang] || links['en'];
  });

  showNav = signal(false);
  showCreateMenu = signal(false);
  showProfileDropdown = signal(false);
  helpExtraInfo = signal(false);

  ngOnInit() {
    const routerSub = this.router.events.subscribe(() => {
      const url = this.router.url;
      if (url.includes('/topics/') && !url.includes('/create/') && !url.includes('/edit/')) {
        this.helpExtraInfo.set(true);
      } else {
        this.helpExtraInfo.set(false);
      }
    });

    this.destroyRef.onDestroy(() => routerSub.unsubscribe());
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

  async openLanguageSelect() {
    const { LanguageSelectComponent } = await import('../language-select/language-select.component');
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
    if (this.showCreateMenu()) this.closeCreateMenu();
    if (this.showProfileDropdown()) this.showProfileDropdown.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    
    // Close create menu if click is outside of its container
    if (this.showCreateMenu()) {
      if (!target.closest('.nav_create_wrap') && !target.closest('#mobile_nav_wrap')) {
        this.closeCreateMenu();
      }
    }
    
    // Close profile dropdown if click is outside of its container
    if (this.showProfileDropdown()) {
      if (!target.closest('.profile_section')) {
        this.showProfileDropdown.set(false);
      }
    }
  }
}
