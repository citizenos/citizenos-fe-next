import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'cos-account-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink],
  template: `
    <div class="account-container">
      <div class="illustration-column">
        <div class="logo-container" [routerLink]="['/']">
          <img src="/assets/imgs/logo.svg" alt="CitizenOS Logo" class="logo-img">
        </div>
        <div class="illustration-wrapper">
          <img src="/assets/imgs/auth_illustration.svg" alt="CitizenOS Illustration" class="illustration-img">
        </div>
      </div>
      <div class="form-column">
        <div class="form-wrapper">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @use '../../../../../styles/tokens' as tokens;

    .account-container {
      display: grid;
      grid-template-columns: 1fr;
      min-height: 100vh;
      background-color: var(--cos-color-white);

      @media (min-width: tokens.$breakpoint-md) {
        grid-template-columns: 1fr 1fr;
      }

      @media (min-width: tokens.$breakpoint-lg) {
        grid-template-columns: 50% 50%;
      }
    }

    .illustration-column {
      display: none;
      background-color: var(--color-background);
      justify-content: center;
      align-items: flex-end;
      padding: 0;
      position: relative;
      overflow: hidden;

      @media (min-width: tokens.$breakpoint-md) {
        display: flex;
      }
    }

    .logo-container {
      display:flex;
      justify-self: flex-start;
      align-self: flex-start;
      padding: 40px;
      cursor: pointer;
      z-index: 10;
      width:218px;
      height:40px;
    }

    .logo-img {
      width: 218px;
      height: 40px;
    }

    .illustration-wrapper {
      position: absolute;
      padding-left: 120px;
      width: 100%;
      display: flex;
      justify-content: flex-start;
      align-items: flex-start;
    }

    .illustration-img {
      max-width: 100%;
      height: auto;
    }

    .form-column {
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding-top: 40px;
      padding-bottom: 60px;
      background-color: #ffffff;
      overflow-y: auto;

      @media (min-width: tokens.$breakpoint-md) {
        padding-top: 40px;
      }
    }

    .form-wrapper {
      width: 100%;
      max-width: 344px;
      margin: 0 24px;
    }
  `]
})
export class AccountLayoutComponent { }
