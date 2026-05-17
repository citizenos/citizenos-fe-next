import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  HostListener,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DatePipe, UpperCasePipe, NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  switchMap,
  catchError,
  EMPTY,
  debounceTime,
  forkJoin,
  take
} from 'rxjs';

import { GroupDetailService } from '../../../core/services/group-detail.service';
import { GroupMemberTopicService } from '../../../core/services/group-member-topic.service';
import { GroupMemberUserService, GroupMember } from '../../../core/services/group-member-user.service';
import { ListFilterToolbarComponent, FilterConfig } from '../../../shared/components/list-filter-toolbar/list-filter-toolbar.component';
import { UserStore } from '../../../core/state/user.store';
import { Group } from '../../../core/interfaces/group';
import { Topic } from '../../../core/interfaces/topic';
import { DialogService } from '../../../shared/dialog/dialog.service';
import { GroupSettingsDialogComponent } from '../dialogs/group-settings-dialog/group-settings-dialog.component';
import { GroupInviteDialogComponent } from '../dialogs/group-invite-dialog/group-invite-dialog.component';
import { GroupAddTopicsDialogComponent } from '../dialogs/group-add-topics-dialog/group-add-topics-dialog.component';
import { GroupRequestTopicsDialogComponent } from '../dialogs/group-request-topics-dialog/group-request-topics-dialog.component';
import { TopicRequestsDialogComponent } from '../dialogs/topic-requests-dialog/topic-requests-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { countries } from '../../../core/constants/countries';
import { languages } from '../../../core/constants/all-languages';
import { InitialsComponent } from '../../../shared/components/initials/initials.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { TopicCardComponent } from '../../../shared/components/topic-card/topic-card.component';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input.component';
import { ActivitiesButtonComponent } from '../../../shared/components/activities-button/activities-button.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { CosTabsComponent, TabItem } from '../../../shared/components/tabs/tabs.component';
import { IllustrationComponent } from '../../../shared/components/illustration/illustration.component';
import { SeoService } from '../../../core/services/seo.service';

@Component({
  selector: 'cos-group-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    TranslateModule,
    DatePipe,
    UpperCasePipe,
    InitialsComponent,
    IconComponent,
    TopicCardComponent,
    SearchInputComponent,
    ActivitiesButtonComponent,
    PaginationComponent,
    ListFilterToolbarComponent,
    CosTabsComponent,
    IllustrationComponent,
    NgTemplateOutlet,
    FormsModule,
  ],
  templateUrl: './group-detail.component.html',
  styleUrls: ['./group-detail.component.scss'],
})
export class GroupDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private translate = inject(TranslateService);
  groupDetailService = inject(GroupDetailService);
  private groupMemberTopicService = inject(GroupMemberTopicService);
  private groupMemberUserService = inject(GroupMemberUserService);
  userStore = inject(UserStore);
  private dialogService = inject(DialogService);
  private seoService = inject(SeoService);

  TOPIC_STATUSES = ['draft', 'ideation', 'inProgress', 'voting', 'followUp', 'closed'];
  MEMBER_LEVELS = computed(() => Object.values(this.groupMemberUserService.LEVELS));
  TOPIC_LIMIT = 12;
  MEMBER_LIMIT = 20;

  group = signal<Group | null>(null);
  groupId = signal('');
  topics = signal<Topic[]>([]);
  topicsCount = signal(0);
  topicsPage = signal(1);
  members = signal<GroupMember[]>([]);
  membersCount = signal(0);
  membersPage = signal(1);

  tabSelected = signal('topics');
  manageTopicsOpen = signal(false);
  manageMembersOpen = signal(false);
  groupTabs = signal<TabItem[]>([
    { id: 'topics', label: 'VIEWS.GROUP.TAB_TOPICS' },
    { id: 'members', label: 'VIEWS.GROUP.TAB_MEMBERS' },
  ]);
  moreInfo = signal(false);
  moreFilters = signal(false);
  removeTopics = signal(false);
  groupActionsOpen = signal(false);
  mobileActions = signal(false);
  activeMemberMenuId = signal<string | null>(null);
  showCreateInContent = signal(false);

  topicVisibilityFilter = signal('');
  topicStatusFilter = signal('');
  topicOrderFilter = signal('');
  topicCountryFilter = signal('');
  topicLanguageFilter = signal('');
  topicSearch = signal('');
  memberSearch = signal('');

  sortedCountries = [...countries].sort((a, b) => a.name.localeCompare(b.name));
  sortedLanguages = [...languages].sort((a, b) => a.name.localeCompare(b.name));

  isLoggedIn = computed(() => this.userStore.isAuthenticated());
  isAdmin = computed(() => this.group() ? this.groupDetailService.canUpdate(this.group()!) : false);
  canShare = computed(() => {
    const g = this.group();
    return g && (g.visibility === 'public' || this.isAdmin());
  });
  totalTopicPages = computed(() => Math.max(1, Math.ceil(this.topicsCount() / this.TOPIC_LIMIT)));
  totalMemberPages = computed(() => Math.max(1, Math.ceil(this.membersCount() / this.MEMBER_LIMIT)));

  get userLang() { return this.translate.currentLang; }

  private topicFilters$ = toObservable(computed(() => ({
    visibility: this.topicVisibilityFilter(),
    status: this.topicStatusFilter(),
    orderBy: this.topicOrderFilter(),
    country: this.topicCountryFilter(),
    language: this.topicLanguageFilter(),
    search: this.topicSearch(),
  })));

  private memberFilters$ = toObservable(computed(() => ({
    search: this.memberSearch(),
  })));

  filterConfigs = computed<FilterConfig[]>(() => {
    return [
      {
        key: 'visibility',
        placeholder: 'VIEWS.GROUP.TOPICS_FILTER_TYPE',
        selectedValue: this.topicVisibilityFilter(),
        items: [
          { title: 'VIEWS.GROUP.FILTER_ALL', value: 'all' },
          ...(this.isLoggedIn() ? [{ title: 'VIEWS.GROUP.FILTER_FAVOURITED', value: 'favourite' }] : []),
          { title: 'VIEWS.GROUP.FILTER_MODERATED', value: 'showModerated' },
        ],
      },
      {
        key: 'status',
        placeholder: 'VIEWS.GROUP.TOPICS_FILTER_STATUS',
        selectedValue: this.topicStatusFilter(),
        items: [
          { title: 'TXT_TOPIC_STATUS_ALL', value: 'all' },
          ...this.TOPIC_STATUSES.map(s => ({ title: `TXT_TOPIC_STATUS_${s.toUpperCase()}`, value: s })),
        ],
      },
      {
        key: 'orderBy',
        placeholder: 'VIEWS.GROUP.TOPICS_FILTER_ORDER',
        selectedValue: this.topicOrderFilter(),
        items: [
          { title: 'VIEWS.GROUP.TOPICS_FILTERS_ORDER_ALL', value: 'all' },
          { title: 'VIEWS.GROUP.TOPICS_FILTER_ORDER_RECENT_ACTIVITY', value: 'lastActivity' },
          { title: 'VIEWS.GROUP.TOPICS_FILTER_ORDER_MOST_PARTICIPANTS', value: 'membersCount' },
          { title: 'VIEWS.GROUP.TOPICS_FILTER_ORDER_MOST_RECENT', value: 'created' },
        ],
      },
    ];
  });

  filterExtraConfigs = computed<FilterConfig[]>(() => {
    return [
      {
        key: 'country',
        placeholder: 'VIEWS.GROUP.TOPICS_FILTER_COUNTRY',
        selectedValue: this.topicCountryFilter(),
        items: [
          { title: 'VIEWS.GROUP.FILTER_ALL', value: 'all' },
          ...this.sortedCountries.map(c => ({ title: c.name, value: c.name })),
        ],
      },
      {
        key: 'language',
        placeholder: 'VIEWS.GROUP.TOPICS_FILTER_LANGUAGE',
        selectedValue: this.topicLanguageFilter(),
        items: [
          { title: 'VIEWS.GROUP.FILTER_ALL', value: 'all' },
          ...this.sortedLanguages.map(l => ({ title: l.name, value: l.name })),
        ],
      },
    ];
  });

  onFilterChange(event: { key: string; value: string }) {
    const val = event.value === 'all' ? '' : event.value;
    switch (event.key) {
      case 'visibility': this.topicVisibilityFilter.set(val); break;
      case 'status': this.topicStatusFilter.set(val); break;
      case 'orderBy': this.topicOrderFilter.set(val); break;
      case 'country': this.topicCountryFilter.set(val); break;
      case 'language': this.topicLanguageFilter.set(val); break;
    }
  }

  onSearch(value: string) {
    this.topicSearch.set(value);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.group_actions_dropdown')) {
      this.groupActionsOpen.set(false);
    }
    if (!target.closest('.button_dropdown')) {
      this.manageTopicsOpen.set(false);
      this.manageMembersOpen.set(false);
    }
    if (!target.closest('.member_actions')) {
      this.activeMemberMenuId.set(null);
    }
  }

  constructor() {
    this.route.params.pipe(
      takeUntilDestroyed(),
      switchMap(params => {
        const id = params['groupId'];
        this.groupId.set(id);
        this.resetFilters();
        return this.groupDetailService.loadGroup(id).pipe(
          catchError(err => {
            this.router.navigate(['/', this.translate.currentLang, 'error', err.status || 404]);
            return EMPTY;
          })
        );
      })
    ).subscribe(group => {
      this.group.set(group);
      this.seoService.setPageTitle(group.name);
    });

    this.route.fragment.pipe(takeUntilDestroyed()).subscribe(fragment => {
      this.tabSelected.set(fragment || 'topics');
    });

    this.topicFilters$.pipe(
      takeUntilDestroyed(),
      debounceTime(0),
    ).subscribe(() => {
      if (!this.groupId()) return;
      this.topicsPage.set(1);
      this.fetchTopics(0);
    });

    this.memberFilters$.pipe(
      takeUntilDestroyed(),
      debounceTime(0),
    ).subscribe(() => {
      if (!this.groupId()) return;
      this.membersPage.set(1);
      this.fetchMembers(0);
    });
  }

  private fetchTopics(offset: number) {
    const status = this.topicStatusFilter();
    const orderBy = this.topicOrderFilter();
    this.groupMemberTopicService.loadTopics(this.groupId(), {
      limit: this.TOPIC_LIMIT,
      offset,
      visibility: this.topicVisibilityFilter() || undefined,
      statuses: status ? [status] : undefined,
      orderBy: orderBy || undefined,
      order: orderBy ? 'desc' : undefined,
      country: this.topicCountryFilter() || undefined,
      language: this.topicLanguageFilter() || undefined,
      search: this.topicSearch() || undefined,
      include: ['event'],
    }).subscribe(result => {
      this.topics.set(result.rows);
      this.topicsCount.set(result.count);
    });
  }

  private fetchMembers(offset: number) {
    this.groupMemberUserService.loadMembers(this.groupId(), {
      limit: this.MEMBER_LIMIT,
      offset,
      search: this.memberSearch() || '',
      include: this.isAdmin() ? 'invite' : ''
    }).pipe(take(1)).subscribe((res) => {
      this.members.set(res.rows);
      this.membersCount.set(res.count);
    });
  }

  resetFilters() {
    this.topicVisibilityFilter.set('');
    this.topicStatusFilter.set('');
    this.topicOrderFilter.set('');
    this.topicCountryFilter.set('');
    this.topicLanguageFilter.set('');
    this.topicSearch.set('');
    this.memberSearch.set('');
    this.topicsPage.set(1);
    this.membersPage.set(1);
  }

  selectTab(tab: string) {
    this.router.navigate([], { fragment: tab });
  }

  setVisibility(value: string) {
    this.topicVisibilityFilter.set(value);
  }

  setStatus(value: string) {
    this.topicStatusFilter.set(value);
  }

  setOrderBy(value: string) {
    this.topicOrderFilter.set(value);
  }

  setCountry(value: string) {
    this.topicCountryFilter.set(value);
  }

  setLanguage(value: string) {
    this.topicLanguageFilter.set(value);
  }

  onTopicSearch(value: string) {
    this.topicSearch.set(value);
  }

  onMemberSearch(value: string) {
    this.memberSearch.set(value);
  }

  onTopicPageChange(page: number) {
    this.topicsPage.set(page);
    this.fetchTopics((page - 1) * this.TOPIC_LIMIT);
  }

  onMemberPageChange(page: number) {
    this.membersPage.set(page);
    this.fetchMembers((page - 1) * this.MEMBER_LIMIT);
  }


  viewPublicTopics() {
    this.router.navigate(['/', this.userLang, 'public', 'topics']);
  }

  toggleFavourite() {
    const group = this.group();
    if (!group) return;
    if (group.favourite) {
      this.groupDetailService.removeFavourite(group.id).subscribe(() => {
        this.group.update(g => g ? { ...g, favourite: false } : g);
      });
    } else {
      this.groupDetailService.addFavourite(group.id).subscribe(() => {
        this.group.update(g => g ? { ...g, favourite: true } : g);
      });
    }
  }

  joinGroup(group: Group) {
    if (!this.isLoggedIn()) {
      this.router.navigate(['/', this.userLang, 'account', 'login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    this.groupDetailService.joinPublic(group.id).subscribe((res: { level?: string; userLevel?: string }) => {
      this.group.update(g => g ? { ...g, userLevel: res?.level || res?.userLevel || 'read' } : g);
      this.fetchTopics(0);
      this.fetchMembers(0);
    });
  }

  leaveGroup() {
    const user = this.userStore.user();
    if (!user) return;
    this.groupDetailService.leaveGroup(this.groupId(), user.id).subscribe(() => {
      this.group.update(g => g ? { ...g, userLevel: null } : g);
    });
  }

  deleteGroup() {
    this.groupDetailService.deleteGroup(this.groupId()).subscribe(() => {
      this.router.navigate(['/', this.userLang, 'my', 'groups']);
    });
  }

  openSettings() {
    const g = this.group();
    if (!g) return;
    this.dialogService.open(GroupSettingsDialogComponent, { data: { group: g } })
      .afterClosed().subscribe(updated => { if (updated) this.group.set(updated as Group); });
  }

  openInvite() {
    const g = this.group();
    if (!g) return;
    this.dialogService.open(GroupInviteDialogComponent, { data: { group: g } });
  }

  openAddTopics() {
    const g = this.group();
    if (!g) return;
    this.dialogService.open(GroupAddTopicsDialogComponent, { data: { group: g } })
      .afterClosed().subscribe(saved => { if (saved) this.fetchTopics(0); });
  }

  openRequestTopics() {
    const g = this.group();
    if (!g) return;
    this.dialogService.open(GroupRequestTopicsDialogComponent, { data: { group: g } });
  }

  openTopicRequests() {
    const g = this.group();
    if (!g) return;
    this.dialogService.open(TopicRequestsDialogComponent, { data: { group: g } })
      .afterClosed().subscribe(() => this.fetchTopics(0));
  }

  removeTopicFromGroup(topicId: string) {
    this.groupMemberTopicService.removeTopicFromGroup(this.groupId(), topicId).subscribe(() => {
      this.fetchTopics((this.topicsPage() - 1) * this.TOPIC_LIMIT);
    });
  }

  updateMemberLevel(member: GroupMember, level: string) {
    if (member.level === level) return;
    const oldLevel = member.level;
    this.members.update(list => list.map(m => m.id === member.id ? { ...m, level } : m));
    const userId = member.userId ?? member.id;
    this.groupMemberUserService.updateLevel(this.groupId(), userId, level).subscribe({
      error: () => {
        this.members.update(list => list.map(m => m.id === member.id ? { ...m, level: oldLevel } : m));
      }
    });
  }

  confirmRemoveMember(member: GroupMember) {
    this.dialogService.open(ConfirmDialogComponent, {
      data: {
        level: 'delete',
        heading: 'MODALS.TOPIC_MEMBER_USER_DELETE_CONFIRM_HEADING',
        title: 'MODALS.TOPIC_MEMBER_USER_DELETE_CONFIRM_TXT_ARE_YOU_SURE',
        confirmBtn: 'MODALS.TOPIC_MEMBER_USER_DELETE_CONFIRM_YES',
        closeBtn: 'MODALS.TOPIC_MEMBER_USER_DELETE_CONFIRM_NO',
      }
    }).afterClosed().subscribe(result => {
      if (result === true) {
        const userId = member.userId ?? member.id;
        this.groupMemberUserService.removeMember(this.groupId(), userId).subscribe(() => {
          this.fetchMembers((this.membersPage() - 1) * this.MEMBER_LIMIT);
        });
      }
    });
  }

  setAllRights(level: string) {
    const groupId = this.groupId();
    const members = this.members();
    const admin = this.userStore.user();
    const saveObservables = members
      .filter(member => member.level !== level && member.userId !== admin?.id)
      .map(member => this.groupMemberUserService.updateLevel(groupId, member.userId || member.id, level));

    if (saveObservables.length) {
      forkJoin(saveObservables).subscribe(() => this.fetchMembers(0));
    }
  }

  removeAllMembers() {
    this.dialogService.open(ConfirmDialogComponent, {
      data: {
        level: 'delete',
        heading: 'MODALS.GROUP_DELETE_ALL_MEMBERS_CONFIRM_HEADING',
        title: 'MODALS.GROUP_DELETE_ALL_MEMBERS_CONFIRM_TXT_ARE_YOU_SURE',
        confirmBtn: 'MODALS.GROUP_DELETE_ALL_MEMBERS_CONFIRM_YES',
        closeBtn: 'MODALS.GROUP_DELETE_ALL_MEMBERS_CONFIRM_NO',
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        const groupId = this.groupId();
        const members = this.members();
        const admin = this.userStore.user();
        const saveObservables = members
          .filter(member => member.userId !== admin?.id)
          .map(member => this.groupMemberUserService.removeMember(groupId, member.userId || member.id));

        if (saveObservables.length) {
          forkJoin(saveObservables).subscribe(() => this.fetchMembers(0));
        }
      }
    });
  }

  removeAllTopics() {
    this.dialogService.open(ConfirmDialogComponent, {
      data: {
        level: 'delete',
        heading: 'MODALS.GROUP_DELETE_ALL_TOPICS_CONFIRM_HEADING',
        title: 'MODALS.GROUP_DELETE_ALL_TOPICS_CONFIRM_TXT_ARE_YOU_SURE',
        confirmBtn: 'MODALS.GROUP_DELETE_ALL_TOPICS_CONFIRM_YES',
        closeBtn: 'MODALS.GROUP_DELETE_ALL_TOPICS_CONFIRM_NO',
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        const groupId = this.groupId();
        const topics = this.topics();
        const saveObservables = topics.map(topic => this.groupMemberTopicService.removeTopicFromGroup(groupId, topic.id));

        if (saveObservables.length) {
          forkJoin(saveObservables).subscribe(() => this.fetchTopics(0));
        }
      }
    });
  }
}
