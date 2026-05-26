import { Routes } from '@angular/router';
import { pendingChangesGuard } from '../../core/guards/pending-changes.guard';

export const TOPICS_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '../my/topics'
  },
  {
    path: 'create',
    children: [
      { path: '', loadComponent: () => import('./topic-create/topic-create.component').then(m => m.TopicCreateComponent), canDeactivate: [pendingChangesGuard] },
      { path: ':topicId', loadComponent: () => import('./topic-create/topic-create.component').then(m => m.TopicCreateComponent), canDeactivate: [pendingChangesGuard] }
    ]
  },
  {
    path: 'edit/:topicId',
    loadComponent: () => import('./topic-edit/topic-edit.component').then(m => m.TopicEditComponent),
    canDeactivate: [pendingChangesGuard]
  },
  {
    path: 'ideation',
    children: [
      {
        path: 'create',
        children: [
          { path: '', loadComponent: () => import('./ideation-create/ideation-create.component').then(m => m.IdeationCreateComponent), canDeactivate: [pendingChangesGuard] },
          { path: ':topicId', loadComponent: () => import('./ideation-create/ideation-create.component').then(m => m.IdeationCreateComponent), canDeactivate: [pendingChangesGuard] }
        ]
      },
      {
        path: 'edit/:topicId',
        loadComponent: () => import('./topic-edit/topic-edit.component').then(m => m.TopicEditComponent),
        canDeactivate: [pendingChangesGuard]
      }
    ]
  },
  {
    path: 'vote',
    children: [
      {
        path: 'create',
        children: [
          { path: '', loadComponent: () => import('./vote-create/vote-create.component').then(m => m.VoteCreateComponent), canDeactivate: [pendingChangesGuard] },
          { path: ':topicId', loadComponent: () => import('./vote-create/vote-create.component').then(m => m.VoteCreateComponent), canDeactivate: [pendingChangesGuard] }
        ]
      },
      {
        path: 'edit/:topicId',
        loadComponent: () => import('./topic-edit/topic-edit.component').then(m => m.TopicEditComponent),
        canDeactivate: [pendingChangesGuard]
      }
    ]
  },
  {
    path: 'join/:token',
    loadComponent: () => import('./topic-token-join/topic-token-join.component').then(m => m.TopicTokenJoinComponent)
  },
  {
    path: ':topicId',
    children: [
      { path: '', loadComponent: () => import('./topic-view/topic-view.component').then(m => m.TopicViewComponent) },
      {
        path: 'invites/users/:inviteId',
        loadComponent: () => import('./topic-invitation/topic-invitation.component').then(m => m.TopicInvitationComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./topic-view/components/topic-settings/topic-settings.component').then(m => m.TopicSettingsDialogComponent)
      },
      {
        path: 'files',
        loadComponent: () => import('../../shared/components/topic-attachments/topic-attachments.component').then(m => m.TopicAttachmentsDialogComponent)
      },
      {
        path: 'participants',
        loadComponent: () => import('./topic-view/components/topic-participants/topic-participants.component').then(m => m.TopicParticipantsDialogComponent)
      },
      {
        path: 'comments/:commentId/reports/:reportId/moderate',
        loadComponent: () => import('./topic-view/components/argument-report-moderate/argument-report-moderate.component').then(m => m.ArgumentReportModerateDialogComponent)
      },
      {
        path: 'ideation/:ideationId/ideas/:ideaId/reports/:reportId/moderate',
        loadComponent: () => import('./topic-view/components/idea-report-moderate/idea-report-moderate.component').then(m => m.IdeaReportModerateDialogComponent)
      },
      {
        path: 'ideation/:ideationId/ideas/:ideaId/comments/:commentId/reports/:reportId/moderate',
        loadComponent: () => import('./topic-view/components/idea-reply-report-moderate/idea-reply-report-moderate.component').then(m => m.IdeaReplyReportModerateDialogComponent)
      },
      {
        path: 'report',
        loadComponent: () => import('./topic-view/components/topic-report-form/topic-report-form.component').then(m => m.TopicReportFormDialogComponent)
      },
      {
        path: 'reports/:reportId/moderate',
        loadComponent: () => import('./topic-view/components/topic-report-moderate/topic-report-moderate.component').then(m => m.TopicReportModerateDialogComponent)
      },
      {
        path: 'reports/:reportId/review',
        loadComponent: () => import('./topic-view/components/topic-report-review/topic-report-review.component').then(m => m.TopicReportReviewDialogComponent)
      },
      {
        path: 'reports/:reportId/resolve',
        loadComponent: () => import('./topic-view/components/topic-report-resolve/topic-report-resolve.component').then(m => m.TopicReportResolveDialogComponent)
      },
      {
        path: 'votes',
        children: [
          { path: ':voteId', loadComponent: () => import('./vote-create/vote-create.component').then(m => m.VoteCreateComponent) }
        ]
      }
    ]
  }
];
