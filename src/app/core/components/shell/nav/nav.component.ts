import {
  Component, signal, computed, inject, ChangeDetectionStrategy, ViewEncapsulation, HostListener
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
import { UiStateService } from '../../../services/ui-state.service';
import { ConfigStore } from '../../../state/config.store';
import { TourItemDirective } from '../../../../shared/directives/tour-item.directive';


@Component({
  selector: 'cos-nav',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [RouterLink, RouterLinkActive, TranslateModule, InitialsComponent, LogoComponent, IconComponent, CreateMenuComponent, TourItemDirective],
  template: `
    <!-- Mobile top bar -->
    <div class="nav_mobile">
      <div class="logo_wrap">
        <a [routerLink]="['/', translate.currentLang]">
          <cos-logo />
        </a>
      </div>
      <div class="nav_mobile_actions">
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
      <div class="nav_overlay" (click)="toggleNav()"></div>
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
          <a class="btn_medium_nav icon" [routerLink]="['/', translate.currentLang, 'my', 'groups']"  routerLinkActive="active" ariaCurrentWhenActive="page" (click)="closeNav()">
            <cos-icon name="groups"></cos-icon>
          </a>
          <a id="tablet_create" class="btn_nav_create icon" (click)="toggleCreateMenu()" [attr.aria-expanded]="showCreateMenu()" aria-haspopup="true">
            @if (!showCreateMenu()) {
              <cos-icon name="nav-create" [size]="40"></cos-icon>
            } @else {
              <cos-icon name="nav-create-active" [size]="40"></cos-icon>
            }
          </a>
          <a class="btn_medium_nav icon" [routerLink]="['/', translate.currentLang, 'public', 'topics']"  routerLinkActive="active" ariaCurrentWhenActive="page" (click)="closeNav()">
            <cos-icon name="public-topic"></cos-icon>
          </a>
          <a class="btn_medium_nav icon" [routerLink]="['/', translate.currentLang, 'public', 'groups']"  routerLinkActive="active" ariaCurrentWhenActive="page" (click)="closeNav()">
            <cos-icon name="public-groups"></cos-icon>
          </a>
        </div>
        <div id="mobile_nav" [class.hidden]="showCreateMenu()">
          <a class="btn_medium_nav icon" [routerLink]="['/', translate.currentLang, 'dashboard']" routerLinkActive="active" ariaCurrentWhenActive="page" (click)="closeNav()">
            <cos-icon name="home"></cos-icon>
          </a>
          <a class="btn_medium_nav icon" [routerLink]="['/', translate.currentLang, 'my', 'topics']"  routerLinkActive="active" ariaCurrentWhenActive="page" (click)="closeNav()">
            <cos-icon name="topic"></cos-icon>
          </a>
          <a id="mobile_create" class="btn_nav_create icon" (click)="toggleCreateMenu()" [attr.aria-expanded]="showCreateMenu()" aria-haspopup="true">
            @if (!showCreateMenu()) {
              <cos-icon name="nav-create" [size]="40"></cos-icon>
            } @else {
              <cos-icon name="nav-create-active" [size]="40"></cos-icon>
            }
          </a>
          <a class="btn_medium_nav icon" [routerLink]="['/', translate.currentLang, 'my', 'groups']"  routerLinkActive="active" ariaCurrentWhenActive="page" (click)="closeNav()">
            <cos-icon name="groups"></cos-icon>
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
            <div class="nav_create_wrap">
              <button class="nav_create_btn" (click)="toggleCreateMenu()" [attr.aria-expanded]="showCreateMenu()" aria-haspopup="true"
                [cosTourItem]="{tourid: 'dashboard', index: 1, position: 'right'}">
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
                  <button class="profile_dropdown_trigger" (click)="toggleProfileDropdown()" [attr.aria-expanded]="showProfileDropdown()" aria-haspopup="true">
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
              <button class="btn_big_submit" [routerLink]="['/', translate.currentLang, 'account', 'login']" (click)="closeNav()">{{ 'DEFAULT.NAV.BTN_LOGIN' | translate }}</button>
              <button class="btn_big_submit_ghost" [routerLink]="['/', translate.currentLang, 'account', 'signup']" (click)="closeNav()">{{ 'DEFAULT.NAV.BTN_REGISTER' | translate }}</button>
            </div>
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
            <button class="nav_item" (click)="openLanguageSelect()">
              <div class="icon_wrap">
                 <cos-icon name="globe" [size]="16"></cos-icon>
              </div>
              <span>{{ currentLanguageLabel }}</span>
            </button>
            <button class="nav_item" (click)="uiState.showHelp.set(true); closeNav()">
              <div class="icon_wrap">
                <cos-icon name="help" [size]="16"></cos-icon>
                @if (helpExtraInfo()) {
                  <div class="orange_dot"></div>
                }
              </div>
              <span>{{ 'DEFAULT.NAV.LNK_HELP' | translate }}</span>
            </button>
            <a class="nav_item" [href]="lnkDonate()" target="_blank">
               <div class="icon_wrap">
                <cos-icon name="about" [size]="16"></cos-icon>
              </div>
              <span>{{ 'DEFAULT.NAV.LNK_ABOUT' | translate }}</span>
            </a>
            <a class="nav_item" [href]="lnkFaq()" target="_blank">
              <div class="icon_wrap">
                <cos-icon name="faq" [size]="16"></cos-icon>
              </div>
              <span>{{ 'DEFAULT.NAV.LNK_FAQ' | translate }}</span>
            </a>
            <button class="nav_item" (click)="uiState.showFeedback.set(true); closeNav()">
              <div class="icon_wrap">
                <cos-icon name="nav-feedback" [size]="16"></cos-icon>
              </div>
              <span>{{ 'DEFAULT.NAV.LNK_FEEDBACK' | translate }}</span>
            </button>
            <button class="nav_item" (click)="uiState.showAccessibility.set(true); closeNav()">
              <div class="icon_wrap">
                <cos-icon name="accessibility" [size]="16"></cos-icon>
              </div>
              <span>{{ 'DEFAULT.NAV.LNK_ACCESSIBILITY' | translate }}</span>
            </button>
          </div>
        </div>

        <!-- Nav footer -->
        <div class="nav_footer_wrap">
          <div class="nav_footer">
            <div class="social_links">
              <a class="footer_icon_wrap" href="https://www.facebook.com/citizenos.web" target="_blank" rel="noopener" aria-label="Facebook">
                <cos-icon name="facebook" [size]="16"></cos-icon>
              </a>
              <a class="footer_icon_wrap" href="https://www.instagram.com/citizen_os_foundation/" target="_blank" rel="noopener" aria-label="Instagram">
                <cos-icon name="instagram" [size]="16"></cos-icon>
              </a>
              <a class="footer_icon_wrap" href="https://twitter.com/Citizen_OS" target="_blank" rel="noopener" aria-label="X (Twitter)">
                <cos-icon name="twitter" [size]="16"></cos-icon>
              </a>
              <a class="footer_icon_wrap" href="http://github.com/citizenos" target="_blank" rel="noopener" aria-label="GitHub">
                <cos-icon name="github" [size]="16"></cos-icon>
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
  readonly uiState = inject(UiStateService);
  private readonly configStore = inject(ConfigStore);
  private readonly dialog = inject(DialogService);
  private readonly router = inject(Router);
 
  lnkDonate = computed(() => {
    const links = this.configStore.links.donate();
    return links[this.translate.currentLang] || links['en'];
  });

  lnkFaq = computed(() => {
    const links = this.configStore.links.faq();
    return links[this.translate.currentLang] || links['en'];
  });

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
