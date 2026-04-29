import { Component, OnInit, OnDestroy, inject, signal, HostListener, ChangeDetectionStrategy, PLATFORM_ID, computed, DestroyRef } from '@angular/core';
import { NgClass, isPlatformBrowser } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { switchMap, combineLatest, map, of, tap, catchError, startWith, take } from 'rxjs';

import { TopicService } from '../../../core/services/topic.service';
import { TopicIdeationService } from '../../../core/services/topic-ideation.service';
import { TopicEventService } from '../../../core/services/topic-event.service';
import { TopicVoteService } from '../../../core/services/topic-vote.service';
import { TopicMemberUserService } from '../../../core/services/topic-member-user.service';
import { UserStore } from '../../../core/state/user.store';
import { DialogService } from '../../../shared/dialog/dialog.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';

import { TopicHeaderComponent } from './components/topic-header/topic-header.component';
import { TopicContentComponent } from './components/topic-content/topic-content.component';
import { TopicInfoSidebarComponent } from './components/topic-info-sidebar/topic-info-sidebar.component';
import { TopicStateItemsComponent } from './components/topic-state-items/topic-state-items.component';
import { TopicIdeationComponent } from './components/topic-ideation/topic-ideation.component';
import { TopicDiscussionComponent } from './components/topic-discussion/topic-discussion.component';

import { Topic } from '../../../core/interfaces/topic';

@Component({
  selector: 'app-topic-view',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgClass,
    RouterModule,
    TranslateModule,
    TopicHeaderComponent,
    TopicContentComponent,
    TopicInfoSidebarComponent,
    TopicStateItemsComponent,
    TopicIdeationComponent,
    TopicDiscussionComponent,
    IconComponent
  ],
  templateUrl: './topic-view.component.html',
  styleUrls: ['./topic-view.component.scss']
})
export class TopicViewComponent implements OnInit, OnDestroy {
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
  private platformId = inject(PLATFORM_ID);
  private destroyRef = inject(DestroyRef);
  get STATUSES() { return this.topicService.STATUSES; }

  topic = signal<Topic | null>(null);
  loading = signal(true);
  ideation = signal<any>(null);
  vote = signal<any>(null);
  eventsCount = signal<number>(0);
  attachments = signal<any[]>([]);
  groups = signal<any[]>([]);
  members = signal<any[]>([]);

  topicId = '';

  tabSelected = signal<string | null>(null);
  tabTablet = signal<string>('');

  wWidth = signal<number>(isPlatformBrowser(this.platformId) ? window.innerWidth : 1280);

  navigation = signal<{title: string, link: any[]}>({
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
      this.translate.onLangChange.pipe(startWith(null))
    ]).pipe(
      switchMap(([params, queryParams]) => {
        const topicId = params['topicId'];
        if (topicId) {
          this.topicId = topicId;
          this.loading.set(true);
          this.navigation.set({
            title: 'DEFAULT.NAV.HEADING_TOPICS',
            link: ['/', this.translate.currentLang, 'my', 'topics']
          });
          return this.topicService.loadTopic(topicId).pipe(
            tap((topic: any) => {
              this.topic.set(topic);
              this.loadRelatedData(topic);
              this.loading.set(false);
              
              const fragment = this.route.snapshot.fragment;
              if (fragment) {
                this.selectTab(fragment);
              } else if (!this.tabSelected()) {
                if (topic.ideationId) {
                  this.selectTab('ideation');
                } else {
                  this.selectTab('discussion');
                }
              }
            }),
            catchError((err) => {
              console.error('Error loading topic:', err);
              this.loading.set(false);
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

  ngOnDestroy() {
    // Cleanup if necessary
  }

  loadRelatedData(topic: Topic) {
    if (topic.ideationId) {
      this.topicIdeationService.get({ topicId: topic.id, ideationId: topic.ideationId })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((ideation: any) => this.ideation.set(ideation));
    }

    if (topic.voteId) {
      this.topicVoteService.get({ topicId: topic.id, voteId: topic.voteId })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((vote: any) => this.vote.set(vote));
    }

    if (topic.status === this.topicService.STATUSES.followUp || topic.status === this.topicService.STATUSES.closed) {
      this.topicEventService.query({ topicId: topic.id })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (res: any) => this.eventsCount.set(res.count || 0),
          error: () => {}
        });
    }

    this.topicService.loadGroups(topic.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (groups: any[]) => {
          this.groups.set(groups);
          this.updateNavigation(topic, groups);
        },
        error: () => {}
      });

    this.topicService.loadAttachments(topic.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (attachments: any[]) => this.attachments.set(attachments),
        error: () => {}
      });

    this.topicMemberUserService.loadItems(topic.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (members: any[]) => this.members.set(members),
        error: () => {}
      });
  }

  private updateNavigation(topic: Topic, groups: any[]) {
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
  }

  joinTopic(topic: Topic) {
    this.topicService.joinPublic(topic.id)
      .pipe(take(1))
      .subscribe({
        next: (res: any) => {
          topic.permission.level = res.userLevel;
          this.topicService.reloadTopic();
        },
        error: (err: any) => console.error('Failed to join topic', err)
      });
  }

  startDiscussion(topic: Topic) {
    if (!this.topicService.canUpdate(topic)) return;
    import('../topic-create/components/step-topic-discussion/step-topic-discussion.component').then(m => {
      this.dialogService.open(m.StepTopicDiscussionComponent, { data: { topic } })
        .afterClosed()
        .subscribe((created: any) => {
          if (created) this.topicService.reloadTopic();
        });
    });
  }

  startVote(topic: Topic) {
    if (!this.topicService.canUpdate(topic)) return;
    import('../vote-create/vote-create-dialog.component').then(m => {
      this.dialogService.open(m.VoteCreateDialogComponent, { data: { topic } })
        .afterClosed()
        .subscribe((created: any) => {
          if (created) this.topicService.reloadTopic();
        });
    });
  }

  sendToFollowUp(topic: Topic) {
    if (!this.topicService.canUpdate(topic)) return;
    this.topicService.changeState(topic, 'followUp');
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
      }).afterClosed().subscribe((updated: any) => {
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
    leaveDialog.afterClosed().subscribe((result: any) => {
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
    // InviteEditorsComponent not yet migrated — tracked in issue ilmar-6gu
  }

  inviteMembers(topic: Topic) {
    // TopicInviteDialogComponent not yet migrated — tracked in issue ilmar-p73
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
    confirm.afterClosed().subscribe((result: any) => {
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
    // TopicAddGroupsDialogComponent not yet migrated — tracked in issue ilmar-h9i
  }

  reportReasonDialog(topic: Topic) {
    // TopicReportReasonComponent not yet migrated — tracked in issue ilmar-w2d
  }

  closeTopic(topic: Topic) {
    this.topicService.changeState(topic, 'closed');
  }

  deleteTopic(topic: Topic) {
    this.topicService.doDeleteTopic(topic, ['/', this.translate.currentLang, 'my', 'topics']);
  }

  downloadAttachment(attachment: any) {
    if (attachment.source === 'upload') {
      const url = `${this.topicService['apiUrl']}/api/users/self/topics/${this.topicId}/attachments/${attachment.id}/download`;
      window.open(url, '_blank');
    } else {
      window.open(attachment.link, '_blank');
    }
  }
}
