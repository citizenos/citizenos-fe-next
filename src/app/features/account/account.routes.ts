import { Routes } from '@angular/router';
import { AccountLayoutComponent } from './components/account-layout/account-layout.component';

export const ACCOUNT_ROUTES: Routes = [
  {
    path: '',
    component: AccountLayoutComponent,
    children: [
      { 
        path: 'login',
        children: [
          { path: '', loadComponent: () => import('./login/login.component').then(m => m.LoginComponent) },
          { path: 'estid', loadComponent: () => import('./login/esteid/esteid.component').then(m => m.EstEidComponent) },
          { path: 'smartid', loadComponent: () => import('./login/smart-id/smart-id.component').then(m => m.SmartIdComponent) }
        ]
      },
      { path: 'signup', loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent) },
      { path: 'password/forgot', loadComponent: () => import('./password-forgot/password-forgot.component').then(m => m.PasswordForgotComponent) },
      { path: 'password/reset/:passwordResetCode', loadComponent: () => import('./password-reset/password-reset.component').then(m => m.PasswordResetComponent) },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  }
];
