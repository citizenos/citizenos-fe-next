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

      <h1 class="main_heading">{{ 'VIEWS.REGISTER.REGISTER_TITLE' | translate }}</h1>
      <p class="description" translate="VIEWS.REGISTER.REGISTER_DESCRIPTION"></p>

      @if (selectedMethod() === 'default') {
        <div class="auth-methods">
          <div class="icons_wrap">
            <button class="login_icon" (click)="doLoginPartner('facebook')" aria-label="Facebook Registration">
              <cos-icon name="facebook" [size]="20"></cos-icon>
            </button>
            <button class="login_icon" (click)="doLoginPartner('google')" aria-label="Google Registration">
              <cos-icon name="google" [size]="32"></cos-icon>
            </button>
            <button class="login_icon" (click)="selectedMethod.set('smartid')" aria-label="Smart-ID Registration">
              <cos-icon name="smart-id" [size]="32"></cos-icon>
            </button>
            <button class="login_icon" (click)="selectedMethod.set('esteid')" aria-label="Estonian ID Registration">
              <cos-icon name="est-id" [size]="32"></cos-icon>
            </button>
          </div>

          <div class="separator">
             <span translate="VIEWS.REGISTER.REGISTER_OR"></span>
          </div>

          <form [formRoot]="registerForm">
            @if (error()) {
              <div class="error-banner" role="alert">
                <cos-icon name="close" [size]="16"></cos-icon>
                <span>{{ error() }}</span>
              </div>
            }

            <cos-input 
              [placeholder]="'COMPONENTS.REGISTER_FORM.PLACEHOLDER_NAME' | translate"
              [hasError]="registerForm.name().invalid() && registerForm.name().touched()"
              [errorMessage]="'COMPONENTS.REGISTER_FORM.ERROR_NAME' | translate"
            >
              <input type="text" [formField]="registerForm.name" [placeholder]="'COMPONENTS.REGISTER_FORM.PLACEHOLDER_NAME' | translate">
            </cos-input>

            <cos-input 
              [placeholder]="'COMPONENTS.REGISTER_FORM.PLACEHOLDER_EMAIL' | translate"
              [hasError]="registerForm.email().invalid() && registerForm.email().touched()"
              [errorMessage]="'COMPONENTS.REGISTER_FORM.ERROR_EMAIL' | translate"
            >
              <input type="email" [formField]="registerForm.email" [placeholder]="'COMPONENTS.REGISTER_FORM.PLACEHOLDER_EMAIL' | translate">
            </cos-input>

            <cos-input 
              [placeholder]="'COMPONENTS.REGISTER_FORM.PLACEHOLDER_COMPANY' | translate"
              [hasError]="registerForm.company().invalid() && registerForm.company().touched()"
            >
              <input type="text" [formField]="registerForm.company" [placeholder]="'COMPONENTS.REGISTER_FORM.PLACEHOLDER_COMPANY' | translate">
            </cos-input>

            <cos-input 
              [placeholder]="'COMPONENTS.REGISTER_FORM.PLACEHOLDER_PASSWORD' | translate"
              [hasError]="registerForm.password().invalid() && registerForm.password().touched()"
              [errorMessage]="'Password must be at least 8 characters'"
            >
              <input [type]="showPassword() ? 'text' : 'password'" [formField]="registerForm.password" [placeholder]="'COMPONENTS.REGISTER_FORM.PLACEHOLDER_PASSWORD' | translate">
              <button type="button" class="view_password" (click)="togglePassword()">
                 <cos-icon [name]="showPassword() ? 'eye-off' : 'eye'" [size]="20"></cos-icon>
              </button>
            </cos-input>

            <cos-input 
              [placeholder]="'COMPONENTS.REGISTER_FORM.PLACEHOLDER_PASSWORD_CONFIRM' | translate"
              [hasError]="(registerForm.passwordConfirm().invalid() && registerForm.passwordConfirm().touched()) || hasPasswordMismatch()"
              [errorMessage]="hasPasswordMismatch() ? 'Passwords do not match' : ''"
            >
              <input [type]="showPasswordConfirm() ? 'text' : 'password'" [formField]="registerForm.passwordConfirm" [placeholder]="'COMPONENTS.REGISTER_FORM.PLACEHOLDER_PASSWORD_CONFIRM' | translate">
              <button type="button" class="view_password" (click)="togglePasswordConfirm()">
                 <cos-icon [name]="showPasswordConfirm() ? 'eye-off' : 'eye'" [size]="20"></cos-icon>
              </button>
            </cos-input>

            <div class="checkbox_wrap" [class.error]="registerForm.agreeToTerms().invalid() && registerForm.agreeToTerms().touched()">
              <label class="checkbox">
                <input type="checkbox" [formField]="registerForm.agreeToTerms">
                <span class="checkmark"></span>
              </label>
              <div class="checkbox_description">
                <span translate="COMPONENTS.REGISTER_FORM.LBL_TERMS_AND_CONDITIONS_DESCRIPTION"></span>
                <a class="bold" href="#" target="_blank">{{ 'COMPONENTS.REGISTER_FORM.PRIVACY_POLICY_LNK_TERMS_OF_USE' | translate }}</a>
                <a class="bold" href="#" target="_blank">{{ 'COMPONENTS.REGISTER_FORM.PRIVACY_POLICY_LNK_PRIVACY_POLICY' | translate }}</a>
              </div>
            </div>

            <div class="checkbox_wrap">
              <label class="checkbox">
                <input type="checkbox" [formField]="registerForm.showInSearch">
                <span class="checkmark"></span>
              </label>
              <div class="checkbox_description">
                 <span translate="COMPONENTS.REGISTER_FORM.LBL_SHOW_IN_SEARCH_DESCRIPTION"></span>
              </div>
            </div>

            <div class="form-actions">
              <cos-button 
                type="submit" 
                variant="primary"
                size="lg"
                [isLoading]="userStore.isLoading()" 
                [isDisabled]="registerForm().invalid()"
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
        <app-smart-id></app-smart-id>
      } @else if (selectedMethod() === 'esteid') {
        <app-esteid></app-esteid>
      }
    </div>
  `,
  styles: [`
    #register_wrap {
      display: flex;
      flex-direction: column;
      gap: 40px;
      padding: 0;
      width: 100%;
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
      margin: 8px 0 0 0;
      color: var(--cos-color-text);
    }

    .description {
      text-align: left;
      color: var(--cos-color-text-muted);
      font-size: 14px;
      margin-top: -12px;
      margin-bottom: 24px;
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

    .checkbox_wrap {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
      align-items: flex-start;

      &.error .checkmark {
        border-color: var(--color-danger);
      }
    }

    .checkbox {
      display: block;
      position: relative;
      cursor: pointer;
      user-select: none;
      width: 24px;
      height: 24px;

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
        height: 24px;
        width: 24px;
        background-color: white;
        border: 1px solid var(--color-border);
        border-radius: 8px;
        transition: all 0.2s;

        &:after {
          content: "";
          position: absolute;
          display: none;
          left: 7.5px;
          top: 3.5px;
          width: 5px;
          height: 10px;
          border: solid white;
          border-width: 0 3px 3px 0;
          transform: rotate(45deg);
        }
      }

      &:hover input ~ .checkmark {
        background-color: var(--color-background);
      }

      input:checked ~ .checkmark {
        background-color: var(--color-link);
        border-color: var(--color-link);
        
        &:after {
          display: block;
        }
      }
    }

    .checkbox_description {
      font-size: 14px;
      line-height: 20px;
      color: var(--color-text-muted);
      margin-top: 2px;
      padding-left: 16px;
      
      .bold {
        font-weight: 600;
        color: var(--color-link);
        text-decoration: none;
        margin-left: 0;
        display: inline;
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

    .form-actions {
       margin-top: 24px;
       width: 100%;

       cos-button {
        width:100%;
      }
    }

    .register-footer {
      margin-top: 32px;
      text-align: center;
      font-size: 14px;
      a { color: var(--color-link); text-decoration: none; font-weight: 600; }
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
