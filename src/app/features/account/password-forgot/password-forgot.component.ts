import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { UserStore } from '../../../core/state/user.store';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-password-forgot',
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
    <div id="password_forgot_wrap">
      <nav class="nav-back">
        <cos-button variant="light" size="md" [routerLink]="['../../login']" icon="arrow-left">
          <span translate="VIEWS.LOGIN.BTN_BACK_LOGIN"></span>
        </cos-button>
      </nav>

      <h1 class="main_heading">{{ 'VIEWS.PASSWORD_FORGOT.PASSWORD_FORGOT_TITLE' | translate }}</h1>

      @if (success()) {
        <div class="success-banner" role="alert">
          <cos-icon name="check" [size]="16"></cos-icon>
          <span translate="MSG_INFO_PASSWORD_RECOVERY_EMAIL_SENT"></span>
        </div>
        <div class="form-actions">
          <cos-button variant="primary" size="lg" [routerLink]="['../../login']">
             {{ 'VIEWS.LOGIN.BTN_BACK_LOGIN' | translate }}
          </cos-button>
        </div>
      } @else {
        <p class="instruction-text" translate="VIEWS.PASSWORD_FORGOT.PASSWORD_FORGOT_DESCRIPTION"></p>

        <form [formGroup]="forgotForm" (ngSubmit)="onSubmit()">
          @if (error()) {
            <div class="error-banner" role="alert">
              <cos-icon name="close" [size]="16"></cos-icon>
              <span>{{ error() }}</span>
            </div>
          }

          <cos-input 
            [placeholder]="'COMPONENTS.PASSWORD_FORGOT.PLACEHOLDER_EMAIL' | translate"
            [hasError]="forgotForm.controls.email.touched && forgotForm.controls.email.invalid"
            [errorMessage]="'COMPONENTS.PASSWORD_FORGOT.ERROR_INVALID_EMAIL' | translate"
          >
            <input type="email" formControlName="email" [placeholder]="'COMPONENTS.PASSWORD_FORGOT.PLACEHOLDER_EMAIL' | translate">
          </cos-input>

          <div class="form-actions">
            <cos-button 
              type="submit" 
              variant="primary"
              size="lg"
              [isLoading]="userStore.isLoading()" 
              [isDisabled]="forgotForm.invalid"
            >
              {{ 'COMPONENTS.PASSWORD_FORGOT.SEND_RESET' | translate }}
            </cos-button>
          </div>
        </form>
      }
    </div>
  `,
  styles: [`
    #password_forgot_wrap {
      display: flex;
      flex-direction: column;
      gap: 32px;
      width: 100%;
    }

    .nav-back {
      width: 100%;
      display: flex;
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

    .form-actions {
      margin-top: 16px;
      width: 100%;

      cos-button {
        width: 100%;
      }
    }
  `]
})
export class PasswordForgotComponent {
  private fb = inject(FormBuilder);
  userStore = inject(UserStore);

  success = signal(false);
  error = signal<string | null>(null);

  forgotForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  async onSubmit() {
    if (this.forgotForm.valid) {
      const { email } = this.forgotForm.getRawValue();
      try {
        await this.userStore.sendPasswordReset(email!);
        this.success.set(true);
      } catch (err: any) {
        this.error.set(err.error?.status?.message || 'Failed to send reset link.');
      }
    }
  }
}
