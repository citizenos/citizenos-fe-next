import { Component, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { interval, Subscription, takeWhile, switchMap } from 'rxjs';
import { UserStore } from '../../../../core/state/user.store';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-smart-id',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    InputComponent,
    IconComponent
  ],
  template: `
    <div class="smart-id-login">
      <h2 translate="VIEWS.LOGIN.SMART_ID_TITLE"></h2>
      
      @if (!challengeID()) {
        <form [formGroup]="smartIdForm" (ngSubmit)="onSubmit()">
          <cos-input 
            [placeholder]="'COMPONENTS.SMART_ID_LOGIN_FORM.LBL_PID' | translate"
            [hasError]="smartIdForm.controls.pid.touched && smartIdForm.controls.pid.invalid"
            [errorMessage]="'Invalid Personal ID (11 digits)'"
          >
            <input type="text" formControlName="pid" [placeholder]="'COMPONENTS.SMART_ID_LOGIN_FORM.LBL_PID' | translate">
          </cos-input>

          <div class="form-actions">
            <cos-button 
              type="submit" 
              variant="primary"
              size="lg"
              [isLoading]="userStore.isLoading()" 
              [isDisabled]="smartIdForm.invalid"
            >
              {{ 'COMPONENTS.SMART_ID_LOGIN_FORM.BTN_AUTHENTICATE' | translate }}
            </cos-button>
          </div>
        </form>
      } @else {
        <div class="challenge-container">
          <p translate="COMPONENTS.SMART_ID_LOGIN_FORM.TXT_CHALLENGE"></p>
          <div class="challenge-id">{{ challengeID() }}</div>
          <p class="verification-info" translate="COMPONENTS.SMART_ID_LOGIN_FORM.TXT_VERIFY_CHALLENGE"></p>
          
          <div class="loading-spinner">
             <cos-icon name="spinner" [size]="32" class="spin"></cos-icon>
          </div>
          
          <cos-button variant="light" (click)="cancel()">
            {{ 'COMPONENTS.SMART_ID_LOGIN_FORM.BTN_CANCEL' | translate }}
          </cos-button>
        </div>
      }

      @if (error()) {
        <div class="error-banner" role="alert">
          <cos-icon name="close" [size]="16"></cos-icon>
          <span>{{ error() }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .smart-id-login {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    h2 {
      font-size: 20px;
      font-weight: 600;
      margin: 0;
    }

    .challenge-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 24px;
      background: var(--cos-color-bg-light);
      border-radius: var(--radius-md);
      text-align: center;
    }

    .challenge-id {
      font-size: 48px;
      font-weight: 800;
      letter-spacing: 4px;
      color: var(--cos-color-primary);
    }

    .verification-info {
      font-size: 14px;
      color: var(--color-text-muted);
    }

    .error-banner {
      background: #ffdfd9;
      color: var(--color-danger);
      padding: var(--spacing-sm);
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-size: 13px;
    }

    .form-actions {
      margin-top: 16px;
      cos-button {
        width: 100%;
      }
    }

    .spin {
      animation: cos-spin 1s linear infinite;
    }

    @keyframes cos-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class SmartIdComponent implements OnDestroy {
  private fb = inject(FormBuilder);
  userStore = inject(UserStore);

  challengeID = signal<number | null>(null);
  error = signal<string | null>(null);
  private pollSubscription?: Subscription;

  smartIdForm = this.fb.group({
    pid: ['', [Validators.required, Validators.pattern(/^[0-9]{11}$/)]],
    countryCode: ['EE'] // Default to EE
  });

  ngOnDestroy() {
    this.stopPolling();
  }

  async onSubmit() {
    if (this.smartIdForm.valid) {
      const { pid, countryCode } = this.smartIdForm.getRawValue();
      this.error.set(null);
      try {
        const res = await this.userStore.loginSmartIdInit(pid!, countryCode!);
        if (res.challengeID && res.token) {
          this.challengeID.set(res.challengeID);
          this.startPolling(res.token);
        }
      } catch (err: any) {
        this.error.set(err.error?.status?.message || 'Login failed. Please try again.');
      }
    }
  }

  private startPolling(token: string) {
    this.stopPolling();
    this.pollSubscription = interval(3000)
      .pipe(
        switchMap(() => this.userStore.loginSmartIdStatus(token)),
        takeWhile((res) => !res || res.status?.code === 20001, true)
      )
      .subscribe({
        next: (res) => {
          if (res && res.status?.code !== 20001) {
             // Success!
             this.userStore.checkStatus();
             this.challengeID.set(null);
             window.location.reload(); // Traditional reload as in legacy or navigation
          }
        },
        error: (err) => {
          this.error.set('Authentication failed or timed out.');
          this.challengeID.set(null);
        }
      });
  }

  private stopPolling() {
    this.pollSubscription?.unsubscribe();
  }

  cancel() {
    this.stopPolling();
    this.challengeID.set(null);
  }
}
