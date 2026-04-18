import { Routes } from '@angular/router';
import { AccountLayoutComponent } from './components/account-layout/account-layout.component';

export const ACCOUNT_ROUTES: Routes = [
  {
    path: '',
    component: AccountLayoutComponent,
    children: [
      { path: 'login', loadComponent: () => import('./login/login.component').then(m => m.LoginComponent) },
      { path: 'signup', loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent) },
      { path: 'password/forgot', loadComponent: () => import('./password-forgot/password-forgot.component').then(m => m.PasswordForgotComponent) },
      { path: 'password/reset/:passwordResetCode', loadComponent: () => import('./password-reset/password-reset.component').then(m => m.PasswordResetComponent) },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  }
];
