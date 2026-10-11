import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { form, FormRoot, FormField, required, email, minLength, validate } from '@angular/forms/signals';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { UserStore } from '../../../core/state/user.store';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';

import { IconComponent } from '../../../shared/components/icon/icon.component';
import { UserService } from '../../../core/services/user.service';
import { SmartIdComponent } from '../login/smart-id/smart-id.component';
import { EstEidComponent } from '../login/esteid/esteid.component';

@Component({
  selector: 'app-register',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
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
    <div id="register_wrap">
      <nav class="nav-back">
        <cos-button variant="light" size="md" [routerLink]="['/']" icon="arrow-left" (click)="selectedMethod.set('default')">
          <span translate="VIEWS.REGISTER.BTN_BACK"></span>
        </cos-button>
      </nav>

      <div class="header-section">
        <h1 class="main_heading">{{ 'COMPONENTS.REGISTER_FORM.HEADING' | translate }}</h1>
        <p class="description">{{ 'COMPONENTS.REGISTER_FORM.HEADING_DESCRIPTION' | translate }}</p>
      </div>

      @if (selectedMethod() === 'default') {
        <div class="auth-methods">
          <div class="icons_wrap">
            <button type="button" class="login_icon" (click)="doLoginPartner('facebook')" aria-label="Facebook Registration">
              <cos-icon name="facebook" [size]="20"></cos-icon>
            </button>
            <button type="button" class="login_icon" (click)="doLoginPartner('google')" aria-label="Google Registration">
              <cos-icon name="google" [size]="28"></cos-icon>
            </button>
            <button type="button" class="login_icon" (click)="selectedMethod.set('smartid')" aria-label="Smart-ID Registration">
              <cos-icon name="smart-id" [size]="28"></cos-icon>
            </button>
            <button type="button" class="login_icon" (click)="selectedMethod.set('esteid')" aria-label="Estonian ID Registration">
              <cos-icon name="est-id" [size]="28"></cos-icon>
            </button>
          </div>

          <div class="separator">
             <span>{{ 'COMPONENTS.LOGIN_FORM.LOGIN_OR' | translate }}</span>
          </div>

          <form [formRoot]="registerForm" (submit)="$event.preventDefault(); save(registerModel())">
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
                <input [type]="showPassword() ? 'text' : 'password'" [formField]="registerForm.password" [placeholder]="('COMPONENTS.REGISTER_FORM.PLACEHOLDER_PASSWORD' | translate) + ' *'">
                <button type="button" class="view_password" (click)="togglePassword()" [attr.aria-label]="(showPassword() ? 'CONTROL.HIDE' : 'CONTROL.SHOW') | translate">
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
                <input [type]="showPasswordConfirm() ? 'text' : 'password'" [formField]="registerForm.passwordConfirm" [placeholder]="('COMPONENTS.REGISTER_FORM.PLACEHOLDER_PASSWORD_CONFIRM' | translate) + ' *'">
                <button type="button" class="view_password" (click)="togglePasswordConfirm()" [attr.aria-label]="(showPasswordConfirm() ? 'CONTROL.HIDE' : 'CONTROL.SHOW') | translate">
                   <cos-icon [name]="showPasswordConfirm() ? 'eye-off' : 'eye'" [size]="20"></cos-icon>
                </button>
              </cos-input>
            </div>

            <div class="checkbox_wrap">
              <label class="checkbox">
                <input type="checkbox" [formField]="registerForm.showInSearch">
                <span class="checkmark"></span>
              </label>
              <div class="checkbox_description">
                 <span>{{ 'COMPONENTS.REGISTER_FORM.LBL_SHOW_IN_SEARCH_DESCRIPTION' | translate }}</span>
              </div>
            </div>

            <div class="checkbox_wrap terms_wrap" [class.error]="registerForm.agreeToTerms().invalid() && registerForm.agreeToTerms().touched()">
              <label class="checkbox">
                <input type="checkbox" [formField]="registerForm.agreeToTerms">
                <span class="checkmark"></span>
              </label>
              <div class="checkbox_description">
                <span>{{ 'COMPONENTS.REGISTER_FORM.LBL_TERMS_AND_CONDITIONS_DESCRIPTION' | translate }}</span>
              </div>
            </div>

            <div class="form-actions">
              <cos-button 
                type="submit" 
                variant="primary"
                size="lg"
                [isLoading]="userStore.isLoading()" 
                [isDisabled]="registerForm().invalid()"
                (clicked)="save(registerModel())"
              >
                {{ 'COMPONENTS.REGISTER_FORM.BTN_SAVE' | translate }}
              </cos-button>
            </div>
          </form>

          <footer class="register-footer">
            <a [routerLink]="['..', 'login']">{{ 'COMPONENTS.REGISTER_FORM.HAVE_AN_ACCOUNT' | translate }}</a>
          </footer>
        </div>
      } @else if (selectedMethod() === 'smartid') {
        <app-smart-id (cancelled)="selectedMethod.set('default')"></app-smart-id>
      } @else if (selectedMethod() === 'esteid') {
        <app-esteid (cancelled)="selectedMethod.set('default')"></app-esteid>
      }
    </div>
  `,
  styles: [`
    #register_wrap {
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

    .header-section {
      text-align: center;
      margin-bottom: 8px;
    }

    .main_heading {
      font-size: 28px;
      font-weight: 700;
      line-height: 36px;
      margin: 0 0 8px;
      color: var(--color-text, #2c3b47);
    }

    .description {
      color: var(--color-text-muted, #4d5c6a);
      font-size: 14px;
      line-height: 20px;
      margin: 0;
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

    .checkbox_wrap {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      margin-top: 4px;

      &.error .checkmark {
        border-color: var(--color-danger, #ef4025);
      }
    }

    .checkbox {
      display: block;
      position: relative;
      cursor: pointer;
      user-select: none;
      width: 20px;
      height: 20px;
      flex-shrink: 0;

      input {
        position: absolute;
        opacity: 0;
        cursor: pointer;
        height: 0;
        width: 0;
      }

      .checkmark {
        position: absolute;
        top: 0;
        left: 0;
        height: 20px;
        width: 20px;
        background-color: #ffffff;
        border: 1px solid var(--color-border, #e1e7ee);
        border-radius: 4px;
        transition: all 0.2s ease-in-out;

        &:after {
          content: "";
          position: absolute;
          display: none;
          left: 6px;
          top: 2px;
          width: 5px;
          height: 10px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }
      }

      &:hover input ~ .checkmark {
        border-color: var(--color-link, #1168a8);
      }

      input:checked ~ .checkmark {
        background-color: var(--color-link, #1168a8);
        border-color: var(--color-link, #1168a8);
        
        &:after {
          display: block;
        }
      }
    }

    .checkbox_description {
      font-size: 13px;
      line-height: 18px;
      color: var(--color-text, #2c3b47);
      user-select: none;
      
      a {
        font-weight: 600;
        color: var(--color-link, #1168a8);
        text-decoration: none;
        &:hover {
          text-decoration: underline;
        }
      }
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

    .form-actions {
      width: 100%;
      margin-top: 8px;

      cos-button {
        width: 100%;
        display: block;
      }
    }

    .register-footer {
      margin-top: 24px;
      text-align: center;
      font-size: 14px;
      a {
        color: var(--color-link, #1168a8);
        text-decoration: none;
        font-weight: 600;
        &:hover {
          text-decoration: underline;
        }
      }
    }
  `]
})
export class RegisterComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);
  userStore = inject(UserStore);

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
    const redirectSuccess = this.route.snapshot.queryParamMap.get('redirectSuccess') || undefined;
    window.location.href = this.userService.getPartnerLoginUrl(partnerId, redirectSuccess);
  }

  async save(data: ReturnType<typeof this.registerModel>) {
    try {
      if (!data.agreeToTerms) {
        // basic required true fallback if the validator isn't natively supported yet
        throw new Error('Must agree to terms');
      }
      await this.userStore.signup(data);
      const redirectSuccess = this.route.snapshot.queryParamMap.get('redirectSuccess');
      if (redirectSuccess) {
        window.location.href = redirectSuccess;
      } else {
        this.router.navigate(['/']);
      }
    } catch {
      this.error.set('Registration failed. Please try again.');
    }
  }
}
