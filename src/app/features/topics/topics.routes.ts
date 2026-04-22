import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const TOPICS_ROUTES: Routes = [
  {
    path: 'topics',
    canActivate: [authGuard],
    loadComponent: () => import('./my-topics/my-topics.component').then(m => m.MyTopicsComponent),
  },
  {
    path: 'topics/public',
    loadComponent: () => import('./public-topics/public-topics.component').then(m => m.PublicTopicsComponent),
  },
];
