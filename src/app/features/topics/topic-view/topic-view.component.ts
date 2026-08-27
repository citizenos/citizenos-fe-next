import { NoFeatureYetComponent } from '../../../shared/components/no-feature-yet/no-feature-yet.component';
import { Component, OnInit, inject, signal, HostListener, ChangeDetectionStrategy, PLATFORM_ID, DestroyRef, computed } from '@angular/core';
import { rxResource, toSignal, toObservable } from '@angular/core/rxjs-interop';
import { NgClass, isPlatformBrowser } from '@angular/common';
import { RouterModule, ActivatedRoute, Router, Params } from '@angular/router';
import { TranslateModule, TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { take, map, of, tap, catchError, switchMap, combineLatest, startWith } from 'rxjs';

import { TopicService } from '../../../core/services/topic.service';
import { TourItemDirective } from '../../../shared/directives/tour-item.directive';
import { TopicIdeationService } from '../../../core/services/topic-ideation.service';
import { TopicEventService } from '../../../core/services/topic-event.service';
import { TopicVoteService } from '../../../core/services/topic-vote.service';
import { TopicMemberUserService } from '../../../core/services/topic-member-user.service';
import { UserStore } from '../../../core/state/user.store';
import { DialogService } from '../../../shared/dialog/dialog.service';
import { UiStateService } from '../../../core/services/ui-state.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { SeoService } from '../../../core/services/seo.service';

import { TopicHeaderComponent } from './components/topic-header/topic-header.component';
import { TopicContentComponent } from './components/topic-content/topic-content.component';
import { TopicInfoSidebarComponent } from './components/topic-info-sidebar/topic-info-sidebar.component';
import { TopicParticipantsSectionComponent } from './components/topic-participants-section/topic-participants-section.component';
import { TopicStateItemsComponent } from './components/topic-state-items/topic-state-items.component';
import { TopicIdeationComponent } from './components/topic-ideation/topic-ideation.component';
import { TopicDiscussionComponent } from './components/topic-discussion/topic-discussion.component';
import { TopicVoteCastComponent } from './components/topic-vote-cast/topic-vote-cast.component';
import { TopicMilestonesComponent } from './components/topic-milestones/topic-milestones.component';
import { TopicTabsComponent } from './components/topic-tabs/topic-tabs.component';

import { Topic, TopicAttachment, TopicGroup, TopicVote } from '../../../core/interfaces/topic';
import { Ideation } from '../../../core/interfaces/ideation';
import { VoteWithOptions } from '../../../core/interfaces/vote';
import { TopicMemberUser } from '../../../core/services/topic-member-user.service';

@Component({
  selector: 'app-topic-view',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NoFeatureYetComponent,
    NgClass,
    RouterModule,
    TranslateModule,
    TopicHeaderComponent,
    TopicContentComponent,
    TopicInfoSidebarComponent,
    TopicParticipantsSectionComponent,
    TopicStateItemsComponent,
    TopicIdeationComponent,
    TopicDiscussionComponent,
    TopicVoteCastComponent,
    TopicMilestonesComponent,
    IconComponent,
    TourItemDirective,
    TopicTabsComponent
  ],
  templateUrl: './topic-view.component.html',
  styleUrls: ['./topic-view.component.scss']
})
export class TopicViewComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);

  topicService = inject(TopicService);
  topicIdeationService = inject(TopicIdeationService);
  topicEventService = inject(TopicEventService);
  topicVoteService = inject(TopicVoteService);
  topicMemberUserService = inject(TopicMemberUserService);
  userStore = inject(UserStore);
  translate = inject(TranslateService);
  private dialogService = inject(DialogService);
  private uiState = inject(UiStateService);
  private platformId = inject(PLATFORM_ID);
  private seoService = inject(SeoService);
  private destroyRef = inject(DestroyRef);
  get STATUSES() { return this.topicService.STATUSES; }

  topic = signal<Topic | null>(null);
  loading = signal(true);
  hideTopicContent = signal(false);
  topicId = '';

  private ideationResource = rxResource<Ideation | null, Topic | null>({
    params: () => this.topic(),
    stream: ({ params: topic }) => {
      if (topic?.ideationId) {
        return this.topicIdeationService.get({ topicId: topic.id, ideationId: topic.ideationId }).pipe(
          catchError(() => of(null))
        );
      }
      return of(null);
    }
  });
  ideation = computed(() => this.ideationResource.value() ?? null);

  private voteResource = rxResource<TopicVote | null, Topic | null>({
    params: () => this.topic(),
    stream: ({ params: topic }) => {
      if (topic?.voteId) {
        return this.topicVoteService.get({ topicId: topic.id, voteId: topic.voteId }).pipe(
          map((v: VoteWithOptions) => {
            if (!v) return null;
            return {
              ...v,
              options: Array.isArray(v.options) ? v.options : (v.options?.rows || [])
            } as TopicVote;
          }),
          catchError(() => of(null))
        );
      }
      return of(null);
    }
  });
  vote = computed(() => this.voteResource.value() ?? null);

  private eventsCountResource = rxResource<number, Topic | null>({
    params: () => this.topic(),
    stream: ({ params: topic }) => {
      if (topic && (topic.status === this.topicService.STATUSES.followUp || topic.status === this.topicService.STATUSES.closed)) {
        return this.topicEventService.query({ topicId: topic.id }).pipe(
          map((res: { count?: number; countTotal?: number }) => res.count || res.countTotal || 0),
          catchError(() => of(0))
        );
      }
      return of(0);
    }
  });
  eventsCount = computed(() => this.eventsCountResource.value() ?? 0);

  private groupsResource = rxResource<TopicGroup[], Topic | null>({
    params: () => this.topic(),
    stream: ({ params: topic }) => {
      if (topic) {
        return this.topicService.loadGroups(topic.id).pipe(
          tap(groups => this.updateNavigation(topic, groups)),
          catchError(() => of([]))
        );
      }
      return of([]);
    }
  });
  groups = computed(() => this.groupsResource.value() ?? []);

  private attachmentsResource = rxResource<TopicAttachment[], Topic | null>({
    params: () => this.topic(),
    stream: ({ params: topic }) => {
      if (topic) {
        return this.topicService.loadAttachments(topic.id).pipe(
          catchError(() => of([]))
        );
      }
      return of([]);
    }
  });
  attachments = computed(() => this.attachmentsResource.value() ?? []);

  private membersResource = rxResource<TopicMemberUser[], Topic | null>({
    params: () => this.topic(),
    stream: ({ params: topic }) => {
      if (topic) {
        return this.topicMemberUserService.loadItems(topic.id).pipe(
          catchError(() => of([]))
        );
      }
      return of([]);
    }
  });
  members = computed(() => this.membersResource.value() ?? []);

  tabSelected = signal<string | null>(null);
  tabTablet = signal<string>('');

  wWidth = signal<number>(isPlatformBrowser(this.platformId) ? window.innerWidth : 1280);

  navigation = signal<{ title: string, link: string[] }>({
    title: 'DEFAULT.NAV.HEADING_TOPICS',
    link: ['/']
  });

  @HostListener('window:resize')
  onResize() {
    if (isPlatformBrowser(this.platformId)) {
      this.wWidth.set(window.innerWidth);
    }
  }

  private topicResource = toSignal(
    combineLatest([
      this.route.params,
      this.route.queryParams,
      this.translate.onLangChange.pipe(startWith(null)),
      toObservable(this.userStore.isAuthenticated)
    ]).pipe(
      switchMap(([params, _queryParams, _langChange, _isAuthenticated]: [Params, Params, LangChangeEvent | null, boolean]) => {
        const topicId = params['topicId'];
        if (topicId) {
          this.topicId = topicId;
          this.loading.set(true);
          this.navigation.set({
            title: 'DEFAULT.NAV.HEADING_TOPICS',
            link: ['/', this.translate.currentLang, 'my', 'topics']
          });
          return this.topicService.loadTopic(topicId).pipe(
            tap((topic: Topic) => {
              if (topic.status === this.STATUSES.draft) {
                this.router.navigate(['/', this.translate.currentLang, 'topics', 'edit', topic.id]);
                return;
              }

              this.topic.set(topic);
              this.hideTopicContent.set(!!topic.report?.moderatedReasonType);
              this.seoService.setPageTitle(topic.title || undefined);
              this.loading.set(false);

              // Sanitize Pad URL
              if (topic.padUrl) {
                try {
                  const padURL = new URL(topic.padUrl);
                  if (padURL.searchParams.get('lang') !== this.translate.currentLang) {
                    padURL.searchParams.set('lang', this.translate.currentLang);
                  }
                  padURL.searchParams.set('theme', 'default');
                  topic.padUrl = padURL.href;
                } catch {
                  console.error('Invalid padUrl', topic.padUrl);
                }
              }

              // Tour logic
              if (isPlatformBrowser(this.platformId) && !localStorage.getItem('show-topic-tour')) {
                this.uiState.onboardingContext.set('topic');
                this.uiState.showOnboarding.set(true);
                localStorage.setItem('show-topic-tour', 'true');
              }

              const fragment = this.route.snapshot.fragment;
              if (_queryParams['argumentId']) {
                this.selectTab('discussion');
              } else if (fragment) {
                this.selectTab(fragment);
              } else if (!this.tabSelected()) {
                if (topic.status === this.STATUSES.ideation) {
                  this.selectTab('ideation');
                } else if (topic.status === this.STATUSES.voting) {
                  this.selectTab('voting');
                } else if (topic.status === this.STATUSES.followUp || topic.status === this.STATUSES.closed) {
                  this.selectTab('followUp');
                } else {
                  this.selectTab('discussion');
                }
              }

              if (_queryParams['notificationSettings']) {
                this.appTopicNotificationSettings();
              }
            }),
            catchError((err) => {
              console.error('Error loading topic:', err);
              this.loading.set(false);
              if (err.status === 401 || err.status === 403 || err.status === 404) {
                if (!this.userStore.isAuthenticated() && isPlatformBrowser(this.platformId)) {
                  this.router.navigate(['/', this.translate.currentLang, 'account', 'login'], { queryParams: { redirectSuccess: window.location.href } });
                } else {
                  this.router.navigate(['/', this.translate.currentLang, '404']);
                }
              }
              return of(null);
            })
          );
        }
        this.loading.set(false);
        return of(null);
      })
    )
  );

  ngOnInit() {
    this.topicService.reloadTopic();
  }



  // loadRelatedData has been refactored to declarative signal derivations.

  private updateNavigation(topic: Topic, groups: { id: string; name?: string }[]) {
    const isPrivate = topic.visibility === this.topicService.VISIBILITY.private;
    if (groups.length > 1) {
      this.navigation.set({
        title: isPrivate ? 'VIEWS.GROUP.HEADING_BACK_TO_MY_GROUPS' : 'VIEWS.GROUP.HEADING_BACK_TO_PUBLIC_GROUPS',
        link: ['/', this.translate.currentLang, isPrivate ? 'my' : 'public', 'groups']
      });
    } else if (groups.length === 1) {
      this.navigation.set({
        title: this.translate.instant('VIEWS.GROUP.HEADING_BACK_TO_GROUP', { title: groups[0].name }),
        link: ['/', this.translate.currentLang, 'groups', groups[0].id]
      });
    } else {
      this.navigation.set({
        title: isPrivate ? 'VIEWS.TOPICS_TOPICID.HEADING_BACK_TO_MY_TOPICS' : 'VIEWS.TOPICS_TOPICID.HEADING_BACK_TO_PUBLIC_TOPICS',
        link: ['/', this.translate.currentLang, isPrivate ? 'my' : 'public', 'topics']
      });
    }
  }

  selectTab(tab: string) {
    this.tabSelected.set(tab);
    if (this.wWidth() <= 1024) {
      this.tabTablet.set(tab);
    }
    this.router.navigate([], { fragment: tab, replaceUrl: true, queryParamsHandling: 'preserve', relativeTo: this.route });
  }

  joinTopic(topic: Topic) {
    this.topicService.joinPublic(topic.id)
      .pipe(take(1))
      .subscribe({
        next: (res: { userLevel: string }) => {
          topic.permission.level = res.userLevel;
          this.topicService.reloadTopic();
        },
        error: (err: Error) => console.error('Failed to join topic', err)
      });
  }

  startDiscussion(topic: Topic) {
    if (!this.topicService.canUpdate(topic)) return;
    import('../topic-create/components/step-topic-discussion/step-topic-discussion.component').then(m => {
      this.dialogService.open(m.StepTopicDiscussionComponent, { data: { topic } })
        .afterClosed()
        .subscribe((created: unknown) => {
          if (created) this.topicService.reloadTopic();
        });
    });
  }

  startVote(topic: Topic) {
    if (!this.topicService.canUpdate(topic)) return;
    import('../vote-create/vote-create-dialog.component').then(m => {
      this.dialogService.open(m.VoteCreateDialogComponent, { data: { topic } })
        .afterClosed()
        .subscribe((created: unknown) => {
          if (created) this.topicService.reloadTopic();
        });
    });
  }

  sendToFollowUp(topic: Topic) {
    if (!this.topicService.canUpdate(topic)) return;
    import('./components/topic-follow-up-create-dialog/topic-follow-up-create-dialog.component').then(m => {
      this.dialogService.open(m.TopicFollowUpCreateDialogComponent, {
        data: { topic }
      });
    });
  }

  appTopicNotificationSettings() {
    import('./components/topic-notification-settings/topic-notification-settings.component').then(m => {
      this.dialogService.open(m.TopicNotificationSettingsComponent, {
        data: { topicId: this.topicId }
      });
    });
  }

  openSettings(topic: Topic) {
    import('./components/topic-settings/topic-settings.component').then(m => {
      this.dialogService.open(m.TopicSettingsComponent, {
        data: { topic }
      }).afterClosed().subscribe((updated: unknown) => {
        if (updated) this.topicService.reloadTopic();
      });
    });
  }

  toggleFavourite(topic: Topic) {
    this.topicService.toggleFavourite(topic);
  }

  leaveTopic(topic: Topic) {
    const leaveDialog = this.dialogService.open(ConfirmDialogComponent, {
      data: {
        level: 'delete',
        heading: 'MODALS.TOPIC_MEMBER_USER_LEAVE_CONFIRM_HEADING',
        description: 'MODALS.TOPIC_MEMBER_USER_LEAVE_CONFIRM_TXT_ARE_YOU_SURE',
        points: ['MODALS.TOPIC_MEMBER_USER_LEAVE_CONFIRM_TXT_LEAVING_TOPIC_DESC'],
        confirmBtn: 'MODALS.TOPIC_MEMBER_USER_LEAVE_CONFIRM_BTN_YES',
        closeBtn: 'MODALS.TOPIC_MEMBER_USER_LEAVE_CONFIRM_BTN_NO'
      }
    });
    leaveDialog.afterClosed().subscribe((result: unknown) => {
      if (result === true) {
        this.topicMemberUserService.delete(topic.id, this.userStore.user()!.id)
          .pipe(take(1))
          .subscribe(() => {
            this.router.navigate(['/', this.translate.currentLang, 'my', 'topics']);
          });
      }
    });
  }

  inviteEditors(topic: Topic) {
    import('./components/topic-invite-dialog/topic-invite-dialog.component').then(m => {
      this.dialogService.open(m.TopicInviteDialogComponent, {
        data: {
          topic,
          allowedLevels: [this.topicService.LEVELS.edit, this.topicService.LEVELS.admin]
        }
      });
    });
  }

  inviteMembers(topic: Topic) {
    import('./components/topic-invite-dialog/topic-invite-dialog.component').then(m => {
      this.dialogService.open(m.TopicInviteDialogComponent, {
        data: { topic }
      });
    });
  }

  reportTopic(topic: Topic) {
    import('./components/topic-report-form/topic-report-form.component').then(m => {
      this.dialogService.open(m.TopicReportFormComponent, {
        data: { topic }
      });
    });
  }

  duplicateTopic(topic: Topic) {
    const confirm = this.dialogService.open(ConfirmDialogComponent, {
      data: {
        level: 'info',
        heading: 'VIEWS.TOPICS_TOPICID.OPTION_DUPLICATE_TOPIC',
        description: 'MODALS.TOPIC_DUPLICATE_CONFIRM_TXT_ARE_YOU_SURE',
        confirmBtn: 'MODALS.TOPIC_DUPLICATE_CONFIRM_BTN_YES',
        closeBtn: 'MODALS.TOPIC_DUPLICATE_CONFIRM_BTN_NO'
      }
    });
    confirm.afterClosed().subscribe((result: unknown) => {
      if (result === true) {
        this.topicService.duplicate(topic)
          .pipe(take(1))
          .subscribe((duplicate: Topic) => {
            const path: string[] = ['/', 'topics'];
            if (topic.status === 'voting') path.push('vote');
            else if (topic.status === 'ideation') path.push('ideation');
            path.push('edit', duplicate.id);
            this.router.navigate(path, { replaceUrl: true });
          });
      }
    });
  }

  addGroupsDialog(topic: Topic) {
    import('./components/topic-add-groups-dialog/topic-add-groups-dialog.component').then(m => {
      this.dialogService.open(m.TopicAddGroupsDialogComponent, {
        data: { topic }
      });
    });
  }

  reportReasonDialog(topic: Topic) {
    import('./components/topic-report-reason/topic-report-reason.component').then(m => {
      this.dialogService.open(m.TopicReportReasonComponent, {
        data: {
          report: {
            moderatedReasonText: topic.report?.moderatedReasonText,
            moderatedReasonType: topic.report?.moderatedReasonType
          }
        }
      });
    });
  }

  moderateTopic(topic: Topic) {
    import('./components/topic-report-moderate/topic-report-moderate.component').then(m => {
      this.dialogService.open(m.TopicReportModerateComponent, {
        data: { topic }
      });
    });
  }

  reviewTopic(topic: Topic) {
    import('./components/topic-report-review/topic-report-review.component').then(m => {
      this.dialogService.open(m.TopicReportReviewComponent, {
        data: { topic }
      });
    });
  }

  resolveTopic(topic: Topic) {
    import('./components/topic-report-resolve/topic-report-resolve.component').then(m => {
      this.dialogService.open(m.TopicReportResolveComponent, {
        data: { topic }
      });
    });
  }

  closeTopic(topic: Topic) {
    this.topicService.changeState(topic, 'closed');
  }

  deleteTopic(topic: Topic) {
    this.topicService.doDeleteTopic(topic, ['/', this.translate.currentLang, 'my', 'topics']);
  }

  downloadAttachment(attachment: TopicAttachment) {
    if (!isPlatformBrowser(this.platformId)) return;
    if (attachment.source === 'upload') {
      const prefix = this.userStore.isAuthenticated() ? '/api/users/self' : '/api';
      const url = `${this.topicService['apiUrl']}${prefix}/topics/${this.topicId}/attachments/${attachment.id}/download`;
      window.open(url, '_blank');
    } else {
      window.open(attachment.link, '_blank');
    }
  }

  takeTour() {
    this.uiState.onboardingContext.set('topic');
    this.uiState.showOnboarding.set(true);
  }
}
