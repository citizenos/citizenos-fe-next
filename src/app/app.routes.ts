import { Routes } from '@angular/router';
import { ShellComponent } from './core/components/shell/shell.component';
import { languageResolver } from './core/resolvers/language.resolver';
import { authGuard } from './core/guards/auth.guard';
import { HomeComponent } from './features/home/home.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { PageNotFoundComponent } from './core/components/page-not-found/page-not-found.component';

export const routes: Routes = [
  // The root path redirects to english home by default, or you can have a lang detection component
  { path: '', redirectTo: '/en', pathMatch: 'full' },
  
  // The main layout wrapping all localized routes
  {
    path: ':lang',
    component: ShellComponent,
    resolve: { language: languageResolver },
    children: [
      { path: '', component: HomeComponent },
      { path: 'dashboard', canActivate: [authGuard], component: DashboardComponent },
      
      // Feature lazy loading (will add these features later)
      // { path: 'account', loadChildren: () => import('./features/account/account.routes').then(m => m.ACCOUNT_ROUTES) },
      // { path: 'topics', loadChildren: () => import('./features/topics/topics.routes').then(m => m.TOPICS_ROUTES) },
      
      // Error pages
      { path: '401', component: PageNotFoundComponent }, // Replace with PageUnauthorizedComponent
      { path: '404', component: PageNotFoundComponent },
      { path: 'error/401', redirectTo: '401' },
      { path: 'error/404', redirectTo: '404' }
    ]
  },
  
  // Fallback routes outside localized context
  { path: '401', redirectTo: '/en/401' },
  { path: '404', redirectTo: '/en/404' },
  { path: '**', component: PageNotFoundComponent }
];
