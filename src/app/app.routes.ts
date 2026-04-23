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
    resolve: { language: languageResolver },
    children: [
      // Account routes - these skip the main Shell layout
      // Main Application Shell
      {
        path: '',
        component: ShellComponent,
        children: [
          { path: '', component: HomeComponent },
          { path: 'dashboard', canActivate: [authGuard], component: DashboardComponent },
          {
            path: 'my',
            canActivate: [authGuard],
            children: [
              { path: 'topics', loadComponent: () => import('./features/topics/my-topics/my-topics.component').then(m => m.MyTopicsComponent) },
              { path: 'groups', loadComponent: () => import('./features/groups/my-groups/my-groups.component').then(m => m.MyGroupsComponent) },
            ]
          },
          {
            path: 'public',
            children: [
              { path: 'topics', loadComponent: () => import('./features/topics/public-topics/public-topics.component').then(m => m.PublicTopicsComponent) },
              { path: 'groups', loadComponent: () => import('./features/groups/public-groups/public-groups.component').then(m => m.PublicGroupsComponent) },
            ]
          },
          { path: 'account', pathMatch: 'full', canActivate: [authGuard], loadComponent: () => import('./features/account/profile/profile.component').then(m => m.ProfileComponent) },

          // Topics
          {
            path: 'topics',
            loadChildren: () => import('./features/topics/topics.routes').then(m => m.TOPICS_ROUTES)
          },

          // Groups
          {
            path: 'groups/:groupId',
            loadComponent: () => import('./features/groups/group-detail/group-detail.component').then(m => m.GroupDetailComponent)
          },

          // Error pages
          { path: '401', component: PageNotFoundComponent },
          { path: '404', component: PageNotFoundComponent },
          { path: 'error/401', redirectTo: '401' },
          { path: 'error/404', redirectTo: '404' }
        ]
      },

      // Account routes (login, signup) - these skip the main Shell layout
      { 
        path: 'account', 
        loadChildren: () => import('./features/account/account.routes').then(m => m.ACCOUNT_ROUTES) 
      },
    ]
  },
  
  // Fallback routes outside localized context
  { path: '401', redirectTo: '/en/401' },
  { path: '404', redirectTo: '/en/404' },
  { path: '**', component: PageNotFoundComponent }
];
