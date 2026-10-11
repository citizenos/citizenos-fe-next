import { Component, inject, signal, input, output, ChangeDetectionStrategy } from '@angular/core';
import { form, FormRoot, FormField, required, email } from '@angular/forms/signals';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UserStore } from '../../../../core/state/user.store';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { UserService } from '../../../../core/services/user.service';
import { SmartIdComponent } from '../../login/smart-id/smart-id.component';
import { EstEidComponent } from '../../login/esteid/esteid.component';

@Component({
  selector: 'app-login-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormRoot,
    FormField,
    RouterModule,
    TranslateModule,
    ButtonComponent,
    InputComponent,
    IconComponent,
    SmartIdComponent,
    EstEidComponent
  ],
  template: `
    <div class="login-form-container">
      @if (selectedMethod() === 'default') {
        <div class="auth-methods-icons">
          <button type="button" class="auth-icon-btn" (click)="doLoginPartner('facebook')" aria-label="Facebook Login">
            <cos-icon name="facebook" [size]="20"></cos-icon>
          </button>
          <button type="button" class="auth-icon-btn" (click)="doLoginPartner('google')" aria-label="Google Login">
            <cos-icon name="google" [size]="28"></cos-icon>
          </button>
          <button type="button" class="auth-icon-btn" (click)="selectMethod('smartid')" aria-label="Smart-ID Login">
            <cos-icon name="smart-id" [size]="28"></cos-icon>
          </button>
          <button type="button" class="auth-icon-btn" (click)="selectMethod('esteid')" aria-label="Estonian ID Login">
            <cos-icon name="est-id" [size]="28"></cos-icon>
          </button>
        </div>

        <div class="auth-separator">
          <span>{{ 'COMPONENTS.LOGIN_FORM.LOGIN_OR' | translate }}</span>
        </div>

        <form [formRoot]="loginForm" (submit)="$event.preventDefault(); submitLogin()">
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
              <input
                [type]="showPassword() ? 'text' : 'password'"
                [formField]="loginForm.password"
                [placeholder]="('COMPONENTS.LOGIN_FORM.LOGIN_PLACEHOLDER_PASSWORD' | translate) + ' *'"
              >
              <button
                type="button"
                class="btn-toggle-password"
                (click)="togglePassword()"
                [attr.aria-label]="(showPassword() ? 'CONTROL.HIDE' : 'CONTROL.SHOW') | translate"
              >
                <cos-icon [name]="showPassword() ? 'eye-off' : 'eye'" [size]="20"></cos-icon>
              </button>
            </cos-input>
          </div>

          <div class="forgot-password-link">
            <a
              role="button"
              tabindex="0"
              (click)="onForgotPassword()"
              (keydown.enter)="onForgotPassword()"
            >
              {{ 'COMPONENTS.LOGIN_FORM.LOGIN_LNK_FORGOT_PASSWORD' | translate }}
            </a>
          </div>

          <div class="form-actions">
            <cos-button
              type="submit"
              variant="primary"
              size="lg"
              [isLoading]="userStore.isLoading()"
              [isDisabled]="loginForm().invalid()"
              (clicked)="submitLogin()"
            >
              {{ 'COMPONENTS.LOGIN_FORM.LOGIN_BTN_LOGIN' | translate }}
            </cos-button>
          </div>
        </form>

        <footer class="auth-footer">
          <span>{{ 'COMPONENTS.LOGIN_FORM.LOGIN_NO_ACCOUNT' | translate: { default: "Don't have an account?" } }}</span>
          <a
            role="button"
            tabindex="0"
            (click)="onSwitchToRegister()"
            (keydown.enter)="onSwitchToRegister()"
          >
            {{ 'COMPONENTS.LOGIN_FORM.LOGIN_SIGN_UP_HERE' | translate: { default: 'Sign up here' } }}
          </a>
        </footer>
      } @else if (selectedMethod() === 'smartid') {
        <app-smart-id (cancel)="selectedMethod.set('default')"></app-smart-id>
      } @else if (selectedMethod() === 'esteid') {
        <app-esteid (cancel)="selectedMethod.set('default')"></app-esteid>
      }
    </div>
  `,
  styleUrl: './login-form.component.scss'
})
export class LoginFormComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);
  public translate = inject(TranslateService);
  userStore = inject(UserStore);

  isDialog = input<boolean>(false);
  redirectSuccess = input<string | undefined>(undefined);

  loggedIn = output<void>();
  switchToRegister = output<void>();
  forgotPassword = output<void>();

  selectedMethod = signal<'default' | 'smartid' | 'esteid'>('default');
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
      action: async (f) => this.save(f().value()),
    }
  });

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  selectMethod(method: 'smartid' | 'esteid') {
    if (this.isDialog()) {
      this.selectedMethod.set(method);
    } else {
      this.router.navigate([method], { relativeTo: this.route });
    }
  }

  doLoginPartner(partnerId: string) {
    const redirect = this.redirectSuccess() || this.route.snapshot.queryParamMap.get('redirectSuccess') || undefined;
    window.location.href = this.userService.getPartnerLoginUrl(partnerId, redirect);
  }

  onForgotPassword() {
    this.forgotPassword.emit();
    if (!this.isDialog()) {
      const lang = this.translate.currentLang || this.translate.defaultLang || 'en';
      this.router.navigate(['/', lang, 'account', 'password', 'forgot']);
    }
  }

  onSwitchToRegister() {
    this.switchToRegister.emit();
    if (!this.isDialog()) {
      const lang = this.translate.currentLang || this.translate.defaultLang || 'en';
      this.router.navigate(['/', lang, 'account', 'signup']);
    }
  }

  async submitLogin() {
    if (this.loginForm().invalid()) return;
    await this.save(this.loginModel());
  }

  async save(data: { email: string; password: string }) {
    try {
      this.error.set(null);
      await this.userStore.login(data.email, data.password);
      this.loggedIn.emit();

      if (!this.isDialog()) {
        const redirect = this.redirectSuccess() || this.route.snapshot.queryParamMap.get('redirectSuccess');
        if (redirect) {
          window.location.href = redirect;
        } else {
          this.router.navigate(['/', this.translate.currentLang, 'dashboard']);
        }
      }
    } catch {
      this.error.set('Invalid email or password.');
    }
  }
}
