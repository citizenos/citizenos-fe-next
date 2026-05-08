import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { UserStore } from '../../../core/state/user.store';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-password-reset',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    TranslateModule,
    ButtonComponent,
    InputComponent,
    IconComponent
  ],
  template: `
    <div id="password_reset_wrap">
      <h1 class="main_heading" translate="VIEWS.PASSWORD_RESET.PASSWORD_RESET_TITLE"></h1>

      @if (success()) {
        <div class="success-banner" role="alert">
          <cos-icon name="check" [size]="16"></cos-icon>
          <span translate="COMPONENTS.PASSWORD_RESET_FORM.MSG_SUCCESS_PASSWORD_RESET"></span>
        </div>
        <p class="success-text" translate="COMPONENTS.PASSWORD_RESET_FORM.TXT_PASSWORD_RESET_SUCCESS"></p>
        <cos-button variant="primary" size="lg" [routerLink]="['..', '..', 'login']">
           {{ 'COMPONENTS.PASSWORD_RESET_FORM.BTN_BACK_TO_LOGIN' | translate }}
        </cos-button>
      } @else {
        <p class="instruction-text" translate="COMPONENTS.PASSWORD_RESET_FORM.TXT_INSTRUCTION"></p>

        <form [formGroup]="resetForm" (ngSubmit)="onSubmit()">
          @if (error()) {
            <div class="error-banner" role="alert">
              <cos-icon name="close" [size]="16"></cos-icon>
              <span>{{ error() }}</span>
            </div>
          }

          <cos-input 
            [placeholder]="'COMPONENTS.PASSWORD_RESET_FORM.LBL_PASSWORD' | translate"
            [hasError]="resetForm.controls.password.touched && resetForm.controls.password.invalid"
            [errorMessage]="'Password is required (min 8 characters)'"
          >
            <input [type]="showPassword() ? 'text' : 'password'" formControlName="password" [placeholder]="'COMPONENTS.PASSWORD_RESET_FORM.LBL_PASSWORD' | translate">
            <button type="button" class="view_password" (click)="togglePassword()">
               <cos-icon [name]="showPassword() ? 'eye-off' : 'eye'" [size]="20"></cos-icon>
            </button>
          </cos-input>

          <cos-input 
            [placeholder]="'COMPONENTS.PASSWORD_RESET_FORM.LBL_PASSWORD_CONFIRM' | translate"
            [hasError]="resetForm.controls.passwordConfirm.touched && resetForm.invalid && resetForm.hasError('passwordMismatch')"
            [errorMessage]="'Passwords do not match'"
          >
            <input [type]="showPassword() ? 'text' : 'password'" formControlName="passwordConfirm" [placeholder]="'COMPONENTS.PASSWORD_RESET_FORM.LBL_PASSWORD_CONFIRM' | translate">
          </cos-input>

          <div class="form-actions">
            <cos-button 
              type="submit" 
              variant="primary"
              size="lg"
              [isLoading]="userStore.isLoading()" 
              [isDisabled]="resetForm.invalid"
            >
              {{ 'COMPONENTS.PASSWORD_RESET_FORM.BTN_RESET' | translate }}
            </cos-button>
          </div>
        </form>
      }
    </div>
  `,
  styles: [`
    #password_reset_wrap {
      display: flex;
      flex-direction: column;
      gap: 32px;
      width: 100%;
    }

    .main_heading {
      font-size: 32px;
      font-weight: 700;
      line-height: 1.25;
      margin: 0;
      color: var(--cos-color-text);
    }

    .instruction-text, .success-text {
      font-size: 16px;
      color: var(--color-text-muted);
      line-height: 1.5;
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

    .success-banner {
      background: #e6f7ef;
      color: var(--color-success);
      padding: var(--spacing-sm);
      border-radius: var(--radius-sm);
      margin-bottom: var(--spacing-md);
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-size: 13px;
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

    .form-actions {
      margin-top: 16px;
      width: 100%;

      cos-button {
        width: 100%;
      }
    }
  `]
})
export class PasswordResetComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  userStore = inject(UserStore);

  success = signal(false);
  error = signal<string | null>(null);
  showPassword = signal(false);
  resetCode = '';

  resetForm = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    passwordConfirm: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  ngOnInit() {
    this.resetCode = this.route.snapshot.params['passwordResetCode'];
    if (!this.resetCode) {
      this.error.set('Invalid or missing reset code.');
    }
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('passwordConfirm');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  async onSubmit() {
    if (this.resetForm.valid && this.resetCode) {
      const { password } = this.resetForm.getRawValue();
      try {
        await this.userStore.resetPassword(password!, this.resetCode);
        this.success.set(true);
      } catch (err: any) {
        this.error.set('Failed to reset password. The link may have expired.');
      }
    }
  }
}
