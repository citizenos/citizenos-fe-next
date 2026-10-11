import { Component, inject, signal, computed, input, output, ChangeDetectionStrategy } from '@angular/core';
import { form, FormRoot, FormField, required, email, minLength, validate } from '@angular/forms/signals';
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
  selector: 'app-register-form',
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
    <div class="register-form-container">
      @if (selectedMethod() === 'default') {
        <div class="auth-methods-icons">
          <button type="button" class="auth-icon-btn" (click)="doLoginPartner('facebook')" aria-label="Facebook Registration">
            <cos-icon name="facebook" [size]="20"></cos-icon>
          </button>
          <button type="button" class="auth-icon-btn" (click)="doLoginPartner('google')" aria-label="Google Registration">
            <cos-icon name="google" [size]="28"></cos-icon>
          </button>
          <button type="button" class="auth-icon-btn" (click)="selectedMethod.set('smartid')" aria-label="Smart-ID Registration">
            <cos-icon name="smart-id" [size]="28"></cos-icon>
          </button>
          <button type="button" class="auth-icon-btn" (click)="selectedMethod.set('esteid')" aria-label="Estonian ID Registration">
            <cos-icon name="est-id" [size]="28"></cos-icon>
          </button>
        </div>

        <div class="auth-separator">
          <span>{{ 'COMPONENTS.LOGIN_FORM.LOGIN_OR' | translate }}</span>
        </div>

        <form [formRoot]="registerForm" (submit)="$event.preventDefault(); submitRegister()">
          @if (error()) {
            <div class="error-banner" role="alert">
              <cos-icon name="warning" [size]="16"></cos-icon>
              <span>{{ error() }}</span>
            </div>
          }

          <div class="input-group">
            <cos-input
              [placeholder]="'COMPONENTS.REGISTER_FORM.PLACEHOLDER_NAME' | translate"
              [hasError]="registerForm.name().invalid() && registerForm.name().touched()"
              [errorMessage]="'COMPONENTS.REGISTER_FORM.ERROR_NAME' | translate"
            >
              <input type="text" [formField]="registerForm.name" [placeholder]="('COMPONENTS.REGISTER_FORM.PLACEHOLDER_NAME' | translate) + ' *'">
            </cos-input>
          </div>

          <div class="input-group">
            <cos-input
              [placeholder]="'COMPONENTS.REGISTER_FORM.PLACEHOLDER_EMAIL' | translate"
              [hasError]="registerForm.email().invalid() && registerForm.email().touched()"
              [errorMessage]="'COMPONENTS.REGISTER_FORM.ERROR_EMAIL' | translate"
            >
              <input type="email" [formField]="registerForm.email" [placeholder]="('COMPONENTS.REGISTER_FORM.PLACEHOLDER_EMAIL' | translate) + ' *'">
            </cos-input>
          </div>

          <div class="input-group">
            <cos-input
              [placeholder]="'COMPONENTS.REGISTER_FORM.PLACEHOLDER_COMPANY' | translate"
              [hasError]="registerForm.company().invalid() && registerForm.company().touched()"
            >
              <input type="text" [formField]="registerForm.company" [placeholder]="'COMPONENTS.REGISTER_FORM.PLACEHOLDER_COMPANY' | translate">
            </cos-input>
          </div>

          <div class="input-group">
            <cos-input
              [placeholder]="'COMPONENTS.REGISTER_FORM.PLACEHOLDER_PASSWORD' | translate"
              [hasError]="registerForm.password().invalid() && registerForm.password().touched()"
              [errorMessage]="'Password must be at least 8 characters'"
            >
              <input
                [type]="showPassword() ? 'text' : 'password'"
                [formField]="registerForm.password"
                [placeholder]="('COMPONENTS.REGISTER_FORM.PLACEHOLDER_PASSWORD' | translate) + ' *'"
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

          <div class="input-group">
            <cos-input
              [placeholder]="'COMPONENTS.REGISTER_FORM.PLACEHOLDER_PASSWORD_CONFIRM' | translate"
              [hasError]="(registerForm.passwordConfirm().invalid() && registerForm.passwordConfirm().touched()) || hasPasswordMismatch()"
              [errorMessage]="hasPasswordMismatch() ? 'Passwords do not match' : ''"
            >
              <input
                [type]="showPasswordConfirm() ? 'text' : 'password'"
                [formField]="registerForm.passwordConfirm"
                [placeholder]="('COMPONENTS.REGISTER_FORM.PLACEHOLDER_PASSWORD_CONFIRM' | translate) + ' *'"
              >
              <button
                type="button"
                class="btn-toggle-password"
                (click)="togglePasswordConfirm()"
                [attr.aria-label]="(showPasswordConfirm() ? 'CONTROL.HIDE' : 'CONTROL.SHOW') | translate"
              >
                <cos-icon [name]="showPasswordConfirm() ? 'eye-off' : 'eye'" [size]="20"></cos-icon>
              </button>
            </cos-input>
          </div>

          <div class="checkbox-row">
            <label class="custom-checkbox">
              <input type="checkbox" [formField]="registerForm.showInSearch">
              <span class="checkmark"></span>
            </label>
            <span class="checkbox-label">{{ 'COMPONENTS.REGISTER_FORM.LBL_SHOW_IN_SEARCH_DESCRIPTION' | translate }}</span>
          </div>

          <div class="checkbox-row terms-row" [class.error]="registerForm.agreeToTerms().invalid() && registerForm.agreeToTerms().touched()">
            <label class="custom-checkbox">
              <input type="checkbox" [formField]="registerForm.agreeToTerms">
              <span class="checkmark"></span>
            </label>
            <span class="checkbox-label">
              {{ 'COMPONENTS.REGISTER_FORM.LBL_TERMS_AND_CONDITIONS_DESCRIPTION' | translate }}
            </span>
          </div>

          <div class="form-actions">
            <cos-button
              type="submit"
              variant="primary"
              size="lg"
              [isLoading]="userStore.isLoading()"
              [isDisabled]="registerForm().invalid()"
              (clicked)="submitRegister()"
            >
              {{ 'COMPONENTS.REGISTER_FORM.BTN_SAVE' | translate }}
            </cos-button>
          </div>
        </form>

        <footer class="auth-footer">
          <a
            role="button"
            tabindex="0"
            (click)="onSwitchToLogin()"
            (keydown.enter)="onSwitchToLogin()"
          >
            {{ 'COMPONENTS.REGISTER_FORM.HAVE_AN_ACCOUNT' | translate }}
          </a>
        </footer>
      } @else if (selectedMethod() === 'smartid') {
        <app-smart-id (cancelled)="selectedMethod.set('default')"></app-smart-id>
      } @else if (selectedMethod() === 'esteid') {
        <app-esteid (cancelled)="selectedMethod.set('default')"></app-esteid>
      }
    </div>
  `,
  styleUrl: './register-form.component.scss'
})
export class RegisterFormComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);
  public translate = inject(TranslateService);
  userStore = inject(UserStore);

  isDialog = input<boolean>(false);
  redirectSuccess = input<string | undefined>(undefined);
  inviteId = input<string | undefined>(undefined);

  registered = output<void>();
  switchToLogin = output<void>();

  selectedMethod = signal<'default' | 'smartid' | 'esteid'>('default');
  error = signal<string | null>(null);
  showPassword = signal<boolean>(false);
  showPasswordConfirm = signal<boolean>(false);

  hasPasswordMismatch = computed(() => this.registerForm().errors().some(e => e.kind === 'passwordMismatch'));

  registerModel = signal({
    name: '',
    email: '',
    company: '',
    password: '',
    passwordConfirm: '',
    agreeToTerms: false,
    showInSearch: true
  });

  registerForm = form(this.registerModel, (path) => {
    required(path.name);
    required(path.email);
    email(path.email);
    required(path.password);
    minLength(path.password, 8);
    required(path.passwordConfirm);

    validate(path, (val) => {
      const v = val.value();
      if (v.password && v.passwordConfirm && v.password !== v.passwordConfirm) {
        return { kind: 'passwordMismatch', message: 'Passwords do not match' };
      }
      return null;
    });
  }, {
    submission: {
      action: async (f) => this.save(f().value()),
    }
  });

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  togglePasswordConfirm() {
    this.showPasswordConfirm.update(v => !v);
  }

  doLoginPartner(partnerId: string) {
    const redirect = this.redirectSuccess() || this.route.snapshot.queryParamMap.get('redirectSuccess') || undefined;
    window.location.href = this.userService.getPartnerLoginUrl(partnerId, redirect);
  }

  onSwitchToLogin() {
    this.switchToLogin.emit();
    if (!this.isDialog()) {
      const lang = this.translate.currentLang || this.translate.defaultLang || 'en';
      this.router.navigate(['/', lang, 'account', 'login']);
    }
  }

  async submitRegister() {
    if (this.registerForm().invalid()) return;
    await this.save(this.registerModel());
  }

  async save(data: ReturnType<typeof this.registerModel>) {
    try {
      this.error.set(null);
      if (!data.agreeToTerms) {
        throw new Error('Must agree to terms');
      }

      const payload: Record<string, unknown> = {
        name: data.name,
        email: data.email,
        company: data.company,
        password: data.password,
        showInSearch: data.showInSearch
      };

      if (this.inviteId()) {
        payload['inviteId'] = this.inviteId();
      }

      await this.userStore.signup(payload);
      this.registered.emit();

      if (!this.isDialog()) {
        const redirect = this.redirectSuccess() || this.route.snapshot.queryParamMap.get('redirectSuccess');
        if (redirect) {
          window.location.href = redirect;
        } else {
          this.router.navigate(['/', this.translate.currentLang, 'dashboard']);
        }
      }
    } catch {
      this.error.set('Registration failed. Please verify your details and try again.');
    }
  }
}
