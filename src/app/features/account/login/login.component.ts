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
            <cos-icon name="google" [size]="32"></cos-icon>
          </button>
          <button type="button" class="login_icon" [routerLink]="['smartid']" aria-label="Smart-ID Login">
            <cos-icon name="smart-id" [size]="32"></cos-icon>
          </button>
          <button type="button" class="login_icon" [routerLink]="['estid']" aria-label="Estonian ID Login">
            <cos-icon name="est-id" [size]="32"></cos-icon>
          </button>
        </div>

        <div class="separator">
           <span>{{ 'COMPONENTS.LOGIN_FORM.LOGIN_OR' | translate }}</span>
        </div>

        <form [formRoot]="loginForm">
          @if (error()) {
            <div class="error-banner" role="alert">
              <cos-icon name="close" [size]="16"></cos-icon>
              <span>{{ error() }}</span>
            </div>
          }

          <cos-input
            [placeholder]="'COMPONENTS.LOGIN_FORM.LOGIN_PLACEHOLDER_EMAIL' | translate"
            [hasError]="loginForm.email().invalid() && loginForm.email().touched()"
            [errorMessage]="'Invalid email address'"
          >
            <input type="email" [formField]="loginForm.email" [placeholder]="'COMPONENTS.LOGIN_FORM.LOGIN_PLACEHOLDER_EMAIL' | translate">
          </cos-input>

          <cos-input
            [placeholder]="'COMPONENTS.LOGIN_FORM.LOGIN_PLACEHOLDER_PASSWORD' | translate"
            [hasError]="loginForm.password().invalid() && loginForm.password().touched()"
            [errorMessage]="'Password is required'"
          >
            <input [type]="showPassword() ? 'text' : 'password'" [formField]="loginForm.password" [placeholder]="'COMPONENTS.LOGIN_FORM.LOGIN_PLACEHOLDER_PASSWORD' | translate">
            <button type="button" class="view_password" (click)="togglePassword()" [attr.aria-label]="(showPassword() ? 'CONTROL.HIDE' : 'CONTROL.SHOW') | translate">
               <cos-icon [name]="showPassword() ? 'eye-off' : 'eye'" [size]="20"></cos-icon>
            </button>
          </cos-input>

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
            >
              {{ 'COMPONENTS.LOGIN_FORM.LOGIN_BTN_LOGIN' | translate }}
            </cos-button>
          </div>
        </form>

        <footer class="login-footer">
          <a [routerLink]="['..', 'signup']">{{ 'COMPONENTS.LOGIN_FORM.LOGIN_LNK_NO_ACCOUNT_REGISTER' | translate }}</a>
        </footer>
      </div>

    </div>
  `,
  styles: [`
    #login_wrap {
      display: flex;
      flex-direction: column;
      gap: 40px;
      padding: 0;
      width: 100%;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .nav-back {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .main_heading {
      font-size: 32px;
      font-weight: 700;
      line-height: 1.25;
      text-align: left;
      margin: 0;
      color: var(--cos-color-text);
    }

    .icons_wrap {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 16px;
      margin-bottom: 24px;
    }

    .login_icon {
      cursor: pointer;
      width: 64px;
      height: 64px;
      background-color: var(--color-surface-contrast);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-pill);
      border: none;
      transition: background-color 0.2s;

      &:hover {
        background-color: var(--color-secondary);
      }
    }

    .separator {
      display: flex;
      align-items: center;
      text-align: center;
      margin-bottom: 24px;
      color: var(--color-text-muted);
      font-size: 14px;

      &::before, &::after {
        content: '';
        flex: 1;
        border-bottom: 1px solid var(--color-border);
      }

      span {
        padding: 0 16px;
      }
    }

    .error-banner {
      background: #ffdfd9;
      color: var(--color-danger);
      padding: var(--spacing-sm);
      border-radius: var(--radius-sm);
      margin-bottom: var(--spacing-md);
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-size: 13px;
    }

    .forgot-password {
      text-align: right;
      margin-top: -8px;
      margin-bottom: 24px;
      font-size: 13px;
      a { color: var(--color-link); text-decoration: none; }
    }

    .view_password {
      position: absolute;
      right: 12px;
      background: none;
      border: none;
      padding: 4px;
      cursor: pointer;
      color: var(--color-text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 3;
    }

    .login-footer {
      margin-top: 32px;
      text-align: center;
      font-size: 14px;
      a { color: var(--color-link); text-decoration: none; font-weight: 600; }
    }

    .form-actions {
      width: 100%;

      cos-button {
        width:100%;
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
