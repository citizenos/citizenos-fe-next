import { Component, inject, signal, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { interval, Subscription, takeWhile, switchMap } from 'rxjs';
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
    RouterLink,
    ButtonComponent,
    InputComponent,
    IconComponent
  ],
  template: `
    <div id="login_wrap">
      <nav class="nav-back">
        <cos-button variant="light" size="md" [routerLink]="['/account/login']" icon="arrow-left" (click)="cancel()">
          <span translate="VIEWS.LOGIN.BTN_BACK"></span>
        </cos-button>
      </nav>

      <div class="esteid-login">
        <div class="method-section">
          <div class="section-header">
            <img [src]="mobileIdIcon" class="method-icon" alt="Mobile-ID">
            <h3 translate="VIEWS.LOGIN.MOBILE_ID_TITLE"></h3>
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
            <img [src]="idCardIcon" class="method-icon" alt="ID-Card">
            <h3 translate="VIEWS.LOGIN.ID_CARD_TITLE"></h3>
          </div>
          
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

      h3 {
        font-size: 18px;
        font-weight: 700;
        margin: 0;
        color: var(--color-text);
      }
    }

    .method-icon {
      height: 24px;
      width: auto;
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
export class EstEidComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  userStore = inject(UserStore);

  idCardIcon = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSIjMDA1N0FEIiBkPSJNMjAgNEg0Yy0xLjExIDAtMS45OS44OS0xLjk5IDJMMiAxOGMwIDEuMTEuODkgMiAyIDJoMTZjMS4xMSAwIDItLjg5IDItMlY2YzAtMS4xMS0uODktMi0yLTJtLTEgMTFoLTJ2Mmgyem0wLTNoLTJ2Mmgyem0wLTNoLTJ2Mmgyek05LjUgMTZjLTEuMzUgMC0yLjQzLS41My0zLjE4LTFjLS41NS0uMzUtLjgyLS43Mi0xLjMyLTEuMzJWMTBoNnYzLjY4Yy0uNS41OS0uNzcuOTctMS4zMiAxLjMyLS43NS40Ny0xLjgzIDEtMy4xOCAxZnoiLz48L3N2Zz4=';
  mobileIdIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAG4AAAAgCAYAAADzCU3nAAAABGdBTUEAALGOfPtRkwAACH1JREFUaAXtW3tQlNcV/+2y4CoqgqDig2x5aAiiMWkUbRPjk5hxYlqZmLaa6R8dFUenpnUKHVPbpiZqyiStmUkwTaeTsbGa0SSmakaRRMcGYpqIEQkqIKDiijyF5bXPnnPX+/ntsssujDHL9Dtw+c4959xzL+d899xzz4IOBC6XK4Ue26ktpDaSmgahZ4E2WtJxark6na5CR06bQp3PqY2ipkHoW6CVlpjBjjtAyI9Df73aClUWeJ8dd4sIWnhUWWUQoBZ2nGsQLFRbopcF9F59rTtILKA5bpA4ynuZmuO8LRKg35kzDdycDdWwHnxZ4N35P/cYZW6zQrfhhGiHzzch7aX/Cnz9exW4UN+p8HhQ/OYi0d9RcMVDR6CO5rhAFvLL10NHXwJ0t58+ZHV6HehbEfM2uJrnY7hfkpac+DVNaDMMwS6vrJZvDW743thIDDN6Du3stqO6vkOKIO2+KAVXIw23enCztVuQfOlhhrcuOd6XTqkvktZjonV5j1ePqaH1ddA6x4wyIi5qiFTbr2fXtkzA6YBx/btwfHMCtk/+BkP6IoQ/laPoae60Y8aOL2F3uPDR6qnYebIOxy+2YHNmApalx2Jm3hlEGHSo/kMGluaXouSaBYez0/H8gUqcJbzllR8quvwhntb3J0X0qXklCvfDn6VgWcYEpc9Iwdl6PP1uhUJzvf64gjNy+mITcvZX4uSNLg/6mvRo5C4LVozOTH4B1POpB+TOisPvsqYoL87RknqsOnAZrCd/9XQhqh6vXsf2g5XYVdqC3csTsfLxBLXaoHFXq1nIujpb4HK62m7CXn/RwXDu9HFea3S9nOZ1ph+ica+60CefNSYzCdXp5JRy70AwbOfj89Q4UV7ehx+6UrD6fQTtOreXjc429HPfP4htqEQ+88Ot6LHy7XKGxkZs67Nh/uV0YsrC6BAUbZ3g4TwqzLMOFhm7h9O2nGxA11IDc5Vypu/dg/M0h2nEu6EdPwJBn/gRn+0boIz2jyyTa0Ze2zIKL5EyjjVicGo1W+n0njx2GTqsTf346CYbbh9v1rXPQ3GETcgumRKO9yx7UL9Vvx80dN1QY+1V6q2S45HDFTshKHCGe6pk57K3d696JzH8ne7oyjkPXor+UoNJiB+8GuWPU49W0tW99LeauaXK/zWq5e4U7iveJUKlfvB7Om1VwnP0YrqSZCEubryzB6nTizVPXYSfH5SychE8rWvFFbTsyTCPw0++PxaYFkxTZvxebUXfLKuQOlTWhzNyJnVnJCt8f4p3k+JNT6E/c765FF1Pok1BU3ijQhxOGS5LyLKWzkR3DsOlJk+I07vOZ9KvHxjMqHMJODnWwndoN22d74Gysga3gTYFbP9jqsey6Vite+/QqXj95DUfLm7Fm7yWB//qDKg857uR+dFmRW7evQuC9hHwQ+r3j5k2NBU6Ycby0EQumjxUqZZh8JJmcSjw1VJjvJCyzpoxWswT+2ANEO3JF4Hw2qZMJJvIuY5ChMnm4ARsyTYL2XfwIf3SVe8fFmhC+KBv6OBP0tOPUMGFUBJ6fN0nsuMzUGOx6drLYcfMnu196tWzej5JQ29wDlntjRYrYcWq+P7zfjpPG31/Wgm2klXeJDJPjKLbfbeBkQg1ZadHgDPK7grDZK8QZhwgj9GOSgNk/6XXGRej1yH50vDjj4oaHizNuZsIIxESG91r2MzPi0EXnHss9RRnnvOTgos6ALMCZHScJnClaboe3lbPH9VrU3SCc3zRDqOF58o7UiHmLay04sXnW3VDvoUOeoZLoK/vsfmWpYBs3vkehchccZYXQxUzE0Jwjchiu0nVn8ounRX/3c6n4JWXTnFUmxhpR9fsMRY6R+7ZQZkpPlvvFnosiq1Rnwh7Cqk6/zzgeu5DeDIYzl2+JkMn4nFQ3jXE1xEcPUbqcjHhDpdmikPh+5Q0cOrnxTl87f6Jg85XCly7vsd9GXzcqHrqRY6AbFo2wlAyBG1Lnekw1giJCQowR4+mumEqZ5NKpowW+JLX3UfGDpChFLpOyTx4TDAxox00zuWP1vjMNIkXnTJMvtPJirZ5YyjJtV0ENtq1MU9gcZl8rvCb6UofC9IFcoruOhG8jXHIGmy8n8PMc+tujCsdAYZObN8QMM6D2j3d21jur7ldEKOFEvcUq+vEjI3CKrkESDq5Ol2jA54Acx05Sp/4rHorzOxHLvvFkAtZRAsLhtbLhKyyjuM73Fel4HrzDTwoskxN572NZvtsNtPLB49/+zIz/XPI8O72LACznC7jAzGDc9G84ivbAVvQv6BMfhtHNPxRxLjKPp+Ixw+Hsacj5sArnKUnbMHci1tHZl7r1C8HjkDjhhSK6kFuF3Nq9F3G1pQfBhMoBOY5nZeNzUsKw5CF3dik6Pn5kL0kUVHYej5HjmMhZYv6zKSIU+hgqrglqOjvt1efu7Fo1L1icQ613BWdDZnBJQbBz+JLjz6z7Opvo2hc0BF1klrVKma5zmJO1yb5o6pXwRf1cTSvM9FYxpMRHIp3OL3mRl7Jq3ZLGT1+1zYHUKtU6Je5Lt+TdqyfXOLnkxSE0EATtuECK/l/4XS9SIkJF5iEb98NRegz2w';

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
      const nonce = "s26kIBTGw/XlFHtC3LF16i1hAwK9syO5NgcgAL77iu4="; 
      const authResponse = await webeid.authenticate(nonce, { lang: 'et' });
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
