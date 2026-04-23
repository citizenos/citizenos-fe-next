import { Routes } from '@angular/router';

export const TOPICS_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '../my/topics'
  },
  {
    path: ':topicId',
    loadComponent: () => import('./topic-view/topic-view.component').then(m => m.TopicViewComponent),
  }
];
