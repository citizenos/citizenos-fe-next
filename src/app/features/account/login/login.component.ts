import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { form, FormRoot, FormField, required, email } from '@angular/forms/signals';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { UserStore } from '../../../core/state/user.store';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormRoot,
    FormField,
    RouterModule,
    TranslateModule,
    ButtonComponent,
    InputComponent,
    IconComponent
  ],
  template: `
    <div id="login_wrap">
      <nav class="nav-back">
        <cos-button variant="light" size="md" [routerLink]="['/']" icon="arrow-left">
          <span translate="VIEWS.LOGIN.BTN_BACK"></span>
        </cos-button>
      </nav>

      <h1 class="main_heading">{{ 'VIEWS.LOGIN.LOGIN_TITLE' | translate }}</h1>

      <div class="auth-methods">
        <div class="icons_wrap">
          <button type="button" class="login_icon" (click)="doLoginPartner('facebook')" aria-label="Facebook Login">
            <cos-icon name="facebook" [size]="20"></cos-icon>
          </button>
          <button type="button" class="login_icon" (click)="doLoginPartner('google')" aria-label="Google Login">
            <cos-icon name="google" [size]="28"></cos-icon>
          </button>
          <button type="button" class="login_icon" [routerLink]="['smartid']" aria-label="Smart-ID Login">
            <cos-icon name="smart-id" [size]="28"></cos-icon>
          </button>
          <button type="button" class="login_icon" [routerLink]="['estid']" aria-label="Estonian ID Login">
            <cos-icon name="est-id" [size]="28"></cos-icon>
          </button>
        </div>

        <div class="separator">
           <span>{{ 'COMPONENTS.LOGIN_FORM.LOGIN_OR' | translate }}</span>
        </div>

        <form [formRoot]="loginForm" (submit)="$event.preventDefault(); save(loginModel())">
          @if (error()) {
            <div class="error-banner" role="alert">
              <cos-icon name="warning" [size]="16"></cos-icon>
              <span>{{ error() }}</span>
            </div>
          }

          <div class="input-group">
            <cos-input
              [placeholder]="'COMPONENTS.LOGIN_FORM.LOGIN_PLACEHOLDER_EMAIL' | translate"
              [hasError]="loginForm.email().invalid() && loginForm.email().touched()"
              [errorMessage]="'Invalid email address'"
            >
              <input type="email" [formField]="loginForm.email" [placeholder]="('COMPONENTS.LOGIN_FORM.LOGIN_PLACEHOLDER_EMAIL' | translate) + ' *'">
            </cos-input>
          </div>

          <div class="input-group">
            <cos-input
              [placeholder]="'COMPONENTS.LOGIN_FORM.LOGIN_PLACEHOLDER_PASSWORD' | translate"
              [hasError]="loginForm.password().invalid() && loginForm.password().touched()"
              [errorMessage]="'Password is required'"
            >
              <input [type]="showPassword() ? 'text' : 'password'" [formField]="loginForm.password" [placeholder]="('COMPONENTS.LOGIN_FORM.LOGIN_PLACEHOLDER_PASSWORD' | translate) + ' *'">
              <button type="button" class="view_password" (click)="togglePassword()" [attr.aria-label]="(showPassword() ? 'CONTROL.HIDE' : 'CONTROL.SHOW') | translate">
                 <cos-icon [name]="showPassword() ? 'eye-off' : 'eye'" [size]="20"></cos-icon>
              </button>
            </cos-input>
          </div>

          <div class="forgot-password">
            <a [routerLink]="['..', 'password', 'forgot']">{{ 'COMPONENTS.LOGIN_FORM.LOGIN_LNK_FORGOT_PASSWORD' | translate }}</a>
          </div>

          <div class="form-actions">
            <cos-button
              type="submit"
              variant="primary"
              size="lg"
              [isLoading]="userStore.isLoading()"
              [isDisabled]="loginForm().invalid()"
              (clicked)="save(loginModel())"
            >
              {{ 'COMPONENTS.LOGIN_FORM.LOGIN_BTN_LOGIN' | translate }}
            </cos-button>
          </div>
        </form>

        <footer class="login-footer">
          <span>{{ 'COMPONENTS.LOGIN_FORM.LOGIN_NO_ACCOUNT' | translate: { default: "Don't have an account?" } }} </span>
          <a [routerLink]="['..', 'signup']">{{ 'COMPONENTS.LOGIN_FORM.LOGIN_SIGN_UP_HERE' | translate: { default: 'Sign up here' } }}</a>
        </footer>
      </div>
    </div>
  `,
  styles: [`
    #login_wrap {
      display: flex;
      flex-direction: column;
      width: 100%;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      width: 100%;
    }

    .nav-back {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      margin-bottom: 24px;
    }

    .main_heading {
      font-size: 28px;
      font-weight: 700;
      line-height: 36px;
      text-align: center;
      margin: 0 0 8px;
      color: var(--color-text, #2c3b47);
    }

    .icons_wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      margin: 16px 0 24px;
    }

    .login_icon {
      cursor: pointer;
      width: 56px;
      height: 56px;
      background-color: var(--color-surface-contrast, #f9fbfd);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      border: 1px solid var(--color-border, #e1e7ee);
      transition: all 0.2s ease-in-out;
      padding: 0;

      &:hover {
        background-color: var(--color-background-hover, #e8f2fa);
        border-color: var(--color-link, #1168a8);
        transform: translateY(-2px);
      }
    }

    .separator {
      display: flex;
      align-items: center;
      text-align: center;
      margin-bottom: 24px;
      color: var(--color-text-muted, #4d5c6a);
      font-size: 14px;

      &::before, &::after {
        content: '';
        flex: 1;
        border-bottom: 1px solid var(--color-border, #e1e7ee);
      }

      span {
        padding: 0 16px;
        color: var(--color-text-muted, #4d5c6a);
      }
    }

    .input-group {
      position: relative;
      width: 100%;
    }

    .error-banner {
      background: var(--color-error-background, #fff0ef);
      color: var(--color-danger, #ef4025);
      border: 1px solid var(--color-danger, #ef4025);
      padding: 10px 14px;
      border-radius: 8px;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
    }

    .forgot-password {
      text-align: left;
      margin: 4px 0 16px;
      font-size: 14px;
      a {
        color: var(--color-link, #1168a8);
        text-decoration: none;
        font-weight: 500;
        &:hover {
          text-decoration: underline;
        }
      }
    }

    .view_password {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      padding: 4px;
      cursor: pointer;
      color: var(--color-text-muted, #4d5c6a);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 3;
      border-radius: 4px;
      &:hover {
        color: var(--color-text, #2c3b47);
      }
    }

    .login-footer {
      margin-top: 24px;
      text-align: center;
      font-size: 14px;
      color: var(--color-text, #2c3b47);
      a {
        color: var(--color-link, #1168a8);
        text-decoration: none;
        font-weight: 600;
        margin-left: 4px;
        &:hover {
          text-decoration: underline;
        }
      }
    }

    .form-actions {
      width: 100%;
      margin-top: 8px;

      cos-button {
        width: 100%;
        display: block;
      }
    }
  `]
})
export class LoginComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);
  userStore = inject(UserStore);

  showPassword = signal(false);
  error = signal<string | null>(null);

  loginModel = signal({
    email: '',
    password: ''
  });

  loginForm = form(this.loginModel, (path) => {
    required(path.email);
    email(path.email);
    required(path.password);
  }, {
    submission: {
      action: async (f) => this.save(f().value())
    }
  });

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  doLoginPartner(partnerId: string) {
    const redirectSuccess = this.route.snapshot.queryParamMap.get('redirectSuccess') || undefined;
    window.location.href = this.userService.getPartnerLoginUrl(partnerId, redirectSuccess);
  }

  async save(data: ReturnType<typeof this.loginModel>) {
    try {
      this.error.set(null);
      await this.userStore.login(data.email, data.password);
      const redirectSuccess = this.route.snapshot.queryParamMap.get('redirectSuccess');
      if (redirectSuccess) {
        window.location.href = redirectSuccess;
      } else {
        this.router.navigate(['/']);
      }
    } catch {
      this.error.set('Login failed. Please check your credentials.');
    }
  }
}
