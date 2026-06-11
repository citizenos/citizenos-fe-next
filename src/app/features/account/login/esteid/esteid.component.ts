import { Component, inject, signal, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { interval, Subscription, takeWhile, switchMap } from 'rxjs';
import { UserStore } from '../../../../core/state/user.store';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import * as webeid from '@web-eid/web-eid-library/web-eid';

@Component({
  selector: 'app-esteid',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    TranslateModule,
    RouterLink,
    ButtonComponent,
    InputComponent,
    IconComponent
  ],
  template: `
    <div id="login_wrap">
      <nav class="nav-back">
        <cos-button variant="light" size="md" [routerLink]="['../']" icon="arrow-left" (click)="cancel()">
          <span translate="VIEWS.LOGIN.BTN_BACK_LOGIN"></span>
        </cos-button>
      </nav>

      <div class="esteid-login">
        <div class="method-section">
          <div class="section-header">
            <cos-icon name="mobile-id" [size]="32" class="method-icon-mid"></cos-icon>
          </div>

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
                <p translate="MODALS.LOGIN_ESTEID_TXT_CONTROL_CODE" [translateParams]="{code: challengeID()}"></p>
                <div class="challenge-id">{{ challengeID() }}</div>
                <p class="verification-info" translate="MODALS.LOGIN_ESTEID_TXT_CHECK_CONTROL_CODE"></p>

                <div class="loading-spinner">
                   <cos-icon name="spinner" [size]="32" class="spin"></cos-icon>
                </div>

                <cos-button variant="light" (click)="cancel()">
                  {{ 'COMPONENTS.MOBILE_ID_LOGIN_FORM.BTN_CANCEL' | translate }}
                </cos-button>
              </div>
            }
          </div>
        </div>

        <div class="separator-horizontal"></div>

        <div class="method-section">
          <div class="section-header">
            <cos-icon name="id-card" [size]="32" class="method-icon-id"></cos-icon>
          </div>

          <div class="id-card-container">
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
        </div>

        @if (error()) {
          <div class="error-banner" role="alert">
            <cos-icon name="close" [size]="16"></cos-icon>
            <span>{{ error() }}</span>
          </div>
        }
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

    .nav-back {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .esteid-login {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .method-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--color-border);
    }

    .method-icon-mid {
    }

    .method-icon-id {
    }

    .separator-horizontal {
      height: 1px;
      background: var(--color-border);
      margin: 8px 0;
      opacity: 0.5;
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
export class EstEidComponent implements OnDestroy {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  userStore = inject(UserStore);

  challengeID = signal<string | number | null>(null);
  isLoadingIdCard = signal(false);
  error = signal<string | null>(null);
  private pollSubscription?: Subscription;

  mobileIdForm = this.fb.group({
    pid: ['', [Validators.required, Validators.pattern(/^[0-9]{11}$/)]],
    phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[0-9\s-]{7,}$/)]]
  });



  ngOnDestroy() {
    this.stopPolling();
  }

  async onMobileSubmit() {
    if (this.mobileIdForm.valid) {
      const { pid, phoneNumber } = this.mobileIdForm.getRawValue();
      this.error.set(null);
      try {
        const rawRes = await this.userStore.loginMobiilIdInit(pid!, phoneNumber!);
        const res = rawRes as { challengeID?: string; token?: string } | undefined;
        if (res?.challengeID && res?.token) {
          this.challengeID.set(res.challengeID);
          this.startPolling(res.token);
        }
      } catch (err: unknown) {
        const error = err as { error?: { status?: { message?: string } } };
        this.error.set(error.error?.status?.message || 'Login failed. Please try again.');
      }
    }
  }

  async authIdCard() {
    this.isLoadingIdCard.set(true);
    this.error.set(null);
    try {
      const nonce = "s26kIBTGw/XlFHtC3LF16i1hAwK9syO5NgcgAL77iu4=";
      const authResponse = await webeid.authenticate(nonce, { lang: 'et' });
      await this.userStore.loginIdCard(authResponse);
      const redirectSuccess = this.route.snapshot.queryParams['redirectSuccess'];
      if (redirectSuccess) {
        window.location.href = redirectSuccess;
      } else {
        this.router.navigate(['/']);
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      this.error.set(error.message || 'ID-card authentication failed.');
    } finally {
      this.isLoadingIdCard.set(false);
    }
  }

  private startPolling(token: string) {
    this.stopPolling();
    this.pollSubscription = interval(3000)
      .pipe(
        switchMap(() => this.userStore.loginMobiilIdStatus(token)),
        takeWhile((rawRes) => {
          const res = rawRes as { status?: { code?: number } } | undefined;
          return !res || res.status?.code === 20001;
        }, true)
      )
      .subscribe({
        next: async (rawRes) => {
          const res = rawRes as { status?: { code?: number } } | undefined;
          if (res && res.status?.code !== 20001) {
            this.stopPolling();
            try {
              await this.userStore.checkStatus();
            } catch (e) {
              // ignore
            }
            this.challengeID.set(null);
            const redirectSuccess = this.route.snapshot.queryParams['redirectSuccess'];
            if (redirectSuccess) {
              window.location.href = redirectSuccess;
            } else {
              this.router.navigate(['/']);
            }
          }
        },
        error: (_err) => {
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
