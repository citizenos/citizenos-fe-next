import { Routes } from '@angular/router';

export const TOPICS_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '../my/topics'
  },
  {
    path: 'create',
    children: [
      { path: '', loadComponent: () => import('./topic-create/topic-create.component').then(m => m.TopicCreateComponent) },
      { path: ':topicId', loadComponent: () => import('./topic-create/topic-create.component').then(m => m.TopicCreateComponent) }
    ]
  },
  {
    path: 'ideation',
    children: [
      {
        path: 'create',
        children: [
          { path: '', loadComponent: () => import('./ideation-create/ideation-create.component').then(m => m.IdeationCreateComponent) },
          { path: ':topicId', loadComponent: () => import('./ideation-create/ideation-create.component').then(m => m.IdeationCreateComponent) }
        ]
      }
    ]
  },
  {
    path: 'vote',
    children: [
      {
        path: 'create',
        children: [
          { path: '', loadComponent: () => import('./vote-create/vote-create.component').then(m => m.VoteCreateComponent) },
          { path: ':topicId', loadComponent: () => import('./vote-create/vote-create.component').then(m => m.VoteCreateComponent) }
        ]
      }
    ]
  },
  {
    path: ':topicId',
    children: [
      { path: '', loadComponent: () => import('./topic-view/topic-view.component').then(m => m.TopicViewComponent) }
    ]
  }
];
