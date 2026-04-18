import { Component, inject, signal, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { interval, Subscription, takeWhile, switchMap, firstValueFrom } from 'rxjs';
import { UserStore } from '../../../../core/state/user.store';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import * as webeid from '@web-eid/web-eid-library/web-eid';

@Component({
  selector: 'app-esteid',
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
    <div class="esteid-login">
      <div class="method-selector">
        <button [class.active]="method() === 'mobile'" (click)="method.set('mobile')" translate="VIEWS.LOGIN.MOBILE_ID_TITLE"></button>
        <button [class.active]="method() === 'idcard'" (click)="method.set('idcard')" translate="VIEWS.LOGIN.ID_CARD_TITLE"></button>
      </div>

      @if (method() === 'mobile') {
        <div class="mobile-id-container">
          @if (!challengeID()) {
            <form [formGroup]="mobileIdForm" (ngSubmit)="onMobileSubmit()">
              <cos-input 
                [placeholder]="'MODALS.LOGIN_ESTEID_PLACEHOLDER_PID' | translate"
                [hasError]="mobileIdForm.controls.pid.touched && mobileIdForm.controls.pid.invalid"
              >
                <input type="text" formControlName="pid" [placeholder]="'MODALS.LOGIN_ESTEID_PLACEHOLDER_PID' | translate">
              </cos-input>

              <cos-input 
                [placeholder]="'MODALS.LOGIN_ESTEID_PLACEHOLDER_PHONE' | translate"
                [hasError]="mobileIdForm.controls.phoneNumber.touched && mobileIdForm.controls.phoneNumber.invalid"
              >
                <input type="text" formControlName="phoneNumber" [placeholder]="'MODALS.LOGIN_ESTEID_PLACEHOLDER_PHONE' | translate">
              </cos-input>

              <div class="form-actions">
                <cos-button 
                  type="submit" 
                  variant="primary"
                  size="lg"
                  [isLoading]="userStore.isLoading()" 
                  [isDisabled]="mobileIdForm.invalid"
                >
                  {{ 'MODALS.LOGIN_ESTEID_BTN_AUTHENTICATE_MID' | translate }}
                </cos-button>
              </div>
            </form>
          } @else {
            <div class="challenge-container">
              <p translate="COMPONENTS.MOBILE_ID_LOGIN_FORM.TXT_CHALLENGE"></p>
              <div class="challenge-id">{{ challengeID() }}</div>
              <p class="verification-info" translate="COMPONENTS.MOBILE_ID_LOGIN_FORM.TXT_VERIFY_CHALLENGE"></p>
              
              <div class="loading-spinner">
                 <cos-icon name="spinner" [size]="32" class="spin"></cos-icon>
              </div>
              
              <cos-button variant="light" (click)="cancel()">
                {{ 'COMPONENTS.MOBILE_ID_LOGIN_FORM.BTN_CANCEL' | translate }}
              </cos-button>
            </div>
          }
        </div>
      } @else {
        <div class="id-card-container">
          <p translate="COMPONENTS.ID_CARD_LOGIN_FORM.TXT_INSTRUCTION"></p>
          <div class="form-actions">
            <cos-button 
              variant="primary"
              size="lg"
              [isLoading]="isLoadingIdCard()" 
              (click)="authIdCard()"
            >
              {{ 'MODALS.LOGIN_ESTEID_BTN_LOG_IN_ID' | translate }}
            </cos-button>
          </div>
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
    .esteid-login {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .method-selector {
      display: flex;
      gap: 1px;
      background: var(--cos-color-border);
      border-radius: var(--radius-sm);
      overflow: hidden;
    }

    .method-selector button {
      flex: 1;
      padding: 12px;
      border: none;
      background: var(--cos-color-bg-light);
      cursor: pointer;
      font-weight: 600;
      color: var(--color-text-muted);
      transition: all 0.2s;
    }

    .method-selector button.active {
      background: var(--cos-color-primary);
      color: white;
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
export class EstEidComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  userStore = inject(UserStore);

  method = signal<'mobile' | 'idcard'>('mobile');
  challengeID = signal<number | null>(null);
  isLoadingIdCard = signal(false);
  error = signal<string | null>(null);
  private pollSubscription?: Subscription;

  mobileIdForm = this.fb.group({
    pid: ['', [Validators.required, Validators.pattern(/^[0-9]{11}$/)]],
    phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[0-9\s-]{7,}$/)]]
  });

  ngOnInit() {}

  ngOnDestroy() {
    this.stopPolling();
  }

  async onMobileSubmit() {
    if (this.mobileIdForm.valid) {
      const { pid, phoneNumber } = this.mobileIdForm.getRawValue();
      this.error.set(null);
      try {
        const res = await this.userStore.loginMobiilIdInit(pid!, phoneNumber!);
        if (res.challengeID && res.token) {
          this.challengeID.set(res.challengeID);
          this.startPolling(res.token);
        }
      } catch (err: any) {
        this.error.set(err.error?.status?.message || 'Login failed. Please try again.');
      }
    }
  }

  async authIdCard() {
    this.isLoadingIdCard.set(true);
    this.error.set(null);
    try {
      // In a real app, nonce would come from API. Legacy has a hardcoded one in some cases or gets it from idCardInit
      // For now, following legacy logic
      const nonce = "s26kIBTGw/XlFHtC3LF16i1hAwK9syO5NgcgAL77iu4="; // This should ideally be dynamic
      const authResponse = await webeid.authenticate(nonce, { lang: 'et' });
      // In legacy loginIdCard takes the full response
      await this.userStore.loginIdCard(authResponse); 
      window.location.reload();
    } catch (err: any) {
      this.error.set(err.message || 'ID-card authentication failed.');
    } finally {
      this.isLoadingIdCard.set(false);
    }
  }

  private startPolling(token: string) {
    this.stopPolling();
    this.pollSubscription = interval(3000)
      .pipe(
        switchMap(() => this.userStore.loginMobiilIdStatus(token)),
        takeWhile((res) => !res || res.status?.code === 20001, true)
      )
      .subscribe({
        next: (res) => {
          if (res && res.status?.code !== 20001) {
             this.userStore.checkStatus();
             this.challengeID.set(null);
             window.location.reload();
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
