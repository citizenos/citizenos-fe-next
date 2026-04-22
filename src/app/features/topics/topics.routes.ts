import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const TOPICS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./my-topics/my-topics.component').then(m => m.MyTopicsComponent),
  },
  {
    path: 'public',
    loadComponent: () => import('./public-topics/public-topics.component').then(m => m.PublicTopicsComponent),
  },
  {
    path: ':topicId',
    loadComponent: () => import('./topic-view/topic-view.component').then(m => m.TopicViewComponent),
  }
];
