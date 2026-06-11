import { Component, inject, signal, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { interval, Subscription, takeWhile, switchMap } from 'rxjs';
import { UserStore } from '../../../../core/state/user.store';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-smart-id',
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

      <div class="smartid-login">
        <div class="section-header">
          <cos-icon name="smart-id" [size]="32" class="method-icon"></cos-icon>
        </div>

        @if (!challengeID()) {
          <form [formGroup]="smartIdForm" (ngSubmit)="onSubmit()">
            @if (error()) {
              <div class="error-banner" role="alert">
                <cos-icon name="close" [size]="16"></cos-icon>
                <span>{{ error() }}</span>
              </div>
            }

                <cos-input 
                  [placeholder]="'COMPONENTS.LOGIN_SMART_ID_FORM.LOGIN_SMARTID_PLACEHOLDER_PID' | translate"
                  [hasError]="smartIdForm.controls.pid.touched && smartIdForm.controls.pid.invalid"
                >
                  <input type="text" formControlName="pid" [placeholder]="'COMPONENTS.LOGIN_SMART_ID_FORM.LOGIN_SMARTID_PLACEHOLDER_PID' | translate">
                </cos-input>

            <div class="form-actions">
                <cos-button 
                  type="submit" 
                  variant="primary"
                  size="lg"
                  [isLoading]="userStore.isLoading()" 
                  [isDisabled]="smartIdForm.invalid"
                >
                  {{ 'COMPONENTS.LOGIN_SMART_ID_FORM.LOGIN_SMARTID_BTN_AUTHENTICATE_SID' | translate }}
                </cos-button>
            </div>
          </form>
        } @else {
          <div class="challenge-container">
            <p translate="COMPONENTS.LOGIN_SMART_ID_FORM.LOGIN_SMARTID_TXT_CONTROL_CODE" [translateParams]="{code: challengeID()}"></p>
            <div class="challenge-id">{{ challengeID() }}</div>
            <p class="verification-info" translate="COMPONENTS.LOGIN_SMART_ID_FORM.LOGIN_SMARTID_TXT_CHECK_CONTROL_CODE"></p>
            
            <div class="loading-spinner">
               <cos-icon name="spinner" [size]="32" class="spin"></cos-icon>
            </div>
            
            <cos-button variant="light" (click)="cancel()">
              {{ 'COMPONENTS.SMART_ID_LOGIN_FORM.BTN_CANCEL' | translate }}
            </cos-button>
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

    .smartid-login {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--color-border);

      h3 {
        font-size: 18px;
        font-weight: 700;
        margin: 0;
        color: var(--color-text);
      }
    }

    .method-icon {
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
      margin-bottom: var(--spacing-md);
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-size: 13px;
    }

    .form-actions {
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
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  userStore = inject(UserStore);

  challengeID = signal<string | null | undefined>(null);
  error = signal<string | null>(null);
  private pollSubscription?: Subscription;

  smartIdForm = this.fb.group({
    pid: ['', [Validators.required, Validators.pattern(/^[0-9]{11}$/)]]
  });

  ngOnDestroy() {
    this.stopPolling();
  }

  async onSubmit() {
    if (this.smartIdForm.valid) {
      const pid = this.smartIdForm.value.pid;
      this.error.set(null);
      try {
        const rawRes = await this.userStore.loginSmartIdInit(pid!);
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

  private startPolling(token: string) {
    this.stopPolling();
    this.pollSubscription = interval(3000)
      .pipe(
        switchMap(() => this.userStore.loginSmartIdStatus(token)),
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
