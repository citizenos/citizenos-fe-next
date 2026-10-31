import { Component, input, inject, signal, computed, ChangeDetectionStrategy, PLATFORM_ID, HostListener } from '@angular/core';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { DropdownComponent } from '../../../../../shared/components/dropdown/dropdown.component';
import { NoFeatureYetComponent } from '../../../../../shared/components/no-feature-yet/no-feature-yet.component';

import { DatePipe, isPlatformBrowser, AsyncPipe, TitleCasePipe } from '@angular/common';
import { toObservable, rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { of, switchMap, take, map, catchError, BehaviorSubject, combineLatest, tap, shareReplay } from 'rxjs';

import { TopicIdeationService } from '../../../../../core/services/topic-ideation.service';
import { TopicService } from '../../../../../core/services/topic.service';
import { UserStore } from '../../../../../core/state/user.store';
import { AuthDialogService } from '../../../../../core/services/auth-dialog.service';
import { Topic } from '../../../../../core/interfaces/topic';
import { Ideation, IdeationFolder, IdeaVoter } from '../../../../../core/interfaces/ideation';
import { Idea, IdeaStatus } from '../../../../../core/interfaces/idea';
import { IdeaboxComponent } from '../ideabox/ideabox.component';
import { AddIdeaComponent } from '../add-idea/add-idea.component';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { DialogService } from '../../../../../shared/dialog/dialog.service';
import { CosDropdownDirective } from '../../../../../shared/directives/cos-dropdown.directive';
import { InitialsComponent } from '../../../../../shared/components/initials/initials.component';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { municipalities } from '../../../../../core/services/municipality.service';
import { AddIdeasToFolderComponent } from '../add-ideas-to-folder/add-ideas-to-folder.component';
import { CreateIdeaFolderComponent } from '../create-idea-folder/create-idea-folder.component';
import { EditIdeaFolderComponent } from '../edit-idea-folder/edit-idea-folder.component';
import { EditIdeationDeadlineComponent } from '../edit-ideation-deadline/edit-ideation-deadline.component';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';

@Component({
  selector: 'app-topic-ideation',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonComponent,
    DatePipe,
    TitleCasePipe,
    FormsModule,
    TranslateModule,
    RouterModule,
    IdeaboxComponent,
    AddIdeaComponent,
    PaginationComponent,
    DropdownComponent, NoFeatureYetComponent,
    CosDropdownDirective,
    InitialsComponent,
    InputComponent,
    AsyncPipe
  , IconComponent],
  templateUrl: './topic-ideation.component.html',
  styleUrls: ['./topic-ideation.component.scss'],
})
export class TopicIdeationComponent {
  topic = input.required<Topic>();
  ideation = input.required<Ideation>();

  private safeTopic = computed(() => {
    try {
      return this.topic();
    } catch {
      return null;
    }
  });

  private safeIdeation = computed(() => {
    try {
      return this.ideation();
    } catch {
      return null;
    }
  });

  private ideationService = inject(TopicIdeationService);
  private topicService = inject(TopicService);
  private dialogService = inject(DialogService);
  private platformId = inject(PLATFORM_ID);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public translate = inject(TranslateService);
  private authDialog = inject(AuthDialogService);
  userStore = inject(UserStore);

  PAGE_SIZE = 15;
  AGE_LIMIT = 110;
  municipalities = municipalities;
  loading = computed(() => this.ideasResource.isLoading());
  showAddIdea = signal(false);
  currentPage = signal(1);
  searchValue = signal('');
  selectedOrder = signal('');
  selectedType = signal('');
  selectedParticipants = signal<IdeaVoter | null>(null);
  selectedAge = signal<string[]>([]);
  selectedGender = signal<string>('');
  selectedResidence = signal<string>('');
  
  tabSelected = signal<'ideas' | 'folders' | 'folder'>(
    this.route.snapshot?.queryParams?.['folderId'] ? 'folder' : 'ideas'
  );
  selectedFolder = signal<IdeationFolder | null>(null);
  folderId = signal<string>(this.route.snapshot?.queryParams?.['folderId'] || '');
  foldersLoadedCount = signal<number | null>(null);
  foldersCount = computed(() => this.foldersLoadedCount() ?? (this.ideation()?.folders?.count || 0));
  loadFolders$ = new BehaviorSubject<void>(undefined);

  dialog = this.dialogService;
  IdeationFolderService = {
    query: (params: Parameters<TopicIdeationService['getFolders']>[0]) => {
      return this.ideationService.getFolders(params);
    },
    get: (params: { topicId: string; ideationId: string; folderId: string }) => {
      return this.ideationService.getFolder(params);
    }
  };
  
  private refreshTrigger = signal(0);
  private refreshFoldersTrigger = signal(0);
  
  wWidth = signal(isPlatformBrowser(this.platformId) ? window.innerWidth : 1200);

  @HostListener('window:resize')
  onResize() {
    if (isPlatformBrowser(this.platformId)) {
      this.wWidth.set(window.innerWidth);
    }
  }

  showSearch = signal(false);
  mobileFiltersOpen = signal(false);
  activeMobileFilter = signal<'type' | 'order' | 'participants' | 'age' | 'gender' | 'residence' | null>(null);
  ageList = Array.from({ length: this.AGE_LIMIT }, (_, i) => i + 1);

  mobileIdeaFiltersList = signal(false);
  mobileIdeaFilters = signal({
    type: false as boolean | string,
    orderBy: false as boolean | string,
    participants: false as boolean | Record<string, unknown>,
    age: false as boolean | string,
    gender: false as boolean | string,
    residence: false as boolean | string
  });
  mobileAges = signal<string[]>([]);

  participants$ = toObservable(computed(() => ({ topicId: this.topic?.()?.id, ideationId: this.ideation?.()?.id }))).pipe(
    switchMap(({ topicId, ideationId }) => {
      if (!topicId || !ideationId || !this.ideationService?.participants) return of([] as IdeaVoter[]);
      return this.ideationService.participants({ topicId, ideationId }).pipe(
        catchError(() => of({ rows: [] as IdeaVoter[], count: 0 })),
        map(res => res.rows)
      );
    })
  );

  private ideasParams = computed(() => ({
    search: this.searchValue(),
    type: this.selectedType(),
    order: this.selectedOrder(),
    page: this.currentPage(),
    participant: this.selectedParticipants(),
    age: this.selectedAge(),
    gender: this.selectedGender(),
    residence: this.selectedResidence(),
    folderId: this.folderId() || this.selectedFolder()?.id,
    _v: this.refreshTrigger(),
    topic: this.topic(),
    ideation: this.ideation(),
    tab: this.tabSelected()
  }));

  private ideasResource = rxResource({
    params: () => this.ideasParams(),
    stream: ({ params }) => {
      const { search, type, order, page, participant, age, gender, residence, folderId, topic, ideation, tab } = params;
      if (!topic?.id || !ideation?.id || tab === 'folders' || (tab === 'folder' && !folderId)) return of({ rows: [] as Idea[], count: 0 });
      const req: Record<string, unknown> = {
        limit: this.PAGE_SIZE,
        offset: (page - 1) * this.PAGE_SIZE,
      };
      if (search) req['search'] = search;
      if (order) { req['orderBy'] = order; req['order'] = 'desc'; }
      if (type === 'favourite') req['favourite'] = true;
      else if (type === 'iCreated') req['authorId'] = this.userStore.user()?.id;
      else if (type === 'showModerated') req['showModerated'] = true;

      if (participant) req['authorId'] = participant.id;
      if (age.length) req['age'] = age;
      if (gender) req['gender'] = gender;
      if (residence) req['residence'] = residence;
      if (folderId) req['folderId'] = folderId;

      return this.ideationService.getIdeas({ topicId: topic.id, ideationId: ideation.id, ...req }).pipe(
        catchError((err) => {
          console.error('Error loading ideas', err);
          return of({ rows: [] as Idea[], count: 0 });
        })
      );
    }
  });

  ideas = computed(() => {
    try {
      const res = this.ideasResource.hasValue() ? this.ideasResource.value() : null;
      if (!res?.rows) return [];
      return [...res.rows].sort(a => a.status === IdeaStatus.draft ? -1 : 1);
    } catch {
      return [];
    }
  });

  ideasCount = computed(() => {
    try {
      const res = this.ideasResource.hasValue() ? this.ideasResource.value() : null;
      if (!res) return 0;
      return res.count;
    } catch {
      return 0;
    }
  });

  folders$ = combineLatest([
    toObservable(computed(() => ({ topicId: this.topic()?.id, ideationId: this.ideation()?.id }))),
    this.loadFolders$
  ]).pipe(
    switchMap(([{ topicId, ideationId }]) => {
      if (!topicId || !ideationId || !this.ideationService?.getFolders) return of({ rows: [] as IdeationFolder[], count: 0 });
      return this.ideationService.getFolders({ topicId, ideationId }).pipe(
        catchError((err) => {
          console.error('Error loading folders', err);
          return of({ rows: [] as IdeationFolder[], count: 0 });
        })
      );
    }),
    tap((res: { rows: IdeationFolder[]; count?: number }) => {
      const rows = Array.isArray(res) ? res : (res?.rows ?? []);
      const count = Array.isArray(res) ? res.length : (res?.count ?? rows.length);
      this.foldersLoadedCount.set(count);
      if (this.selectedFolder()) {
        const updated = rows.find(f => f.id === this.selectedFolder()?.id);
        if (updated) {
          this.selectedFolder.set(updated);
        }
      }
    }),
    map((res: { rows: IdeationFolder[] }) => Array.isArray(res) ? res : (res?.rows ?? [])),
    shareReplay(1)
  );

  filtersSet = computed(() => {
    const p = this.ideasParams();
    return !!(p.search || p.type || p.order || p.participant || p.age.length || p.gender || p.residence);
  });

  sortedSelectedAges = computed(() => {
    return this.selectedAge().map(Number).sort((a, b) => a - b).join(', ');
  });

  isCountryEstonia = computed(() => this.topic().country === 'ee');
  
  hasDemograficsField = computed(() => {
    const config = this.ideation().demographicsConfig;
    return {
        age: config?.['age'],
        gender: config?.['gender'],
        residence: config?.['residence']
    };
  });

  Math = Math;

  constructor() {
    this.folders$.pipe(takeUntilDestroyed()).subscribe();

    combineLatest([
      toObservable(this.safeTopic),
      toObservable(this.safeIdeation),
      this.route.queryParams
    ]).pipe(takeUntilDestroyed()).subscribe(([topic, ideation, params]) => {
      const fId = params?.['folderId'];
      if (fId) {
        this.folderId.set(fId);
        this.tabSelected.set('folder');
        if (this.selectedFolder()?.id !== fId && topic?.id && ideation?.id) {
          this.IdeationFolderService.query({
            topicId: topic.id,
            ideationId: ideation.id,
            folderId: fId
          }).pipe(
            take(1),
            catchError(() => of({ rows: [] as IdeationFolder[], count: 0 }))
          ).subscribe(foldersRes => {
            const folder = foldersRes?.rows?.find((f: IdeationFolder) => f.id === fId);
            if (folder) {
              this.selectedFolder.set(folder);
            } else if (this.ideationService.getFolder) {
              this.ideationService.getFolder({
                topicId: topic.id,
                ideationId: ideation.id,
                folderId: fId
              }).pipe(
                take(1),
                catchError(() => of(null))
              ).subscribe(f => {
                if (f) {
                  this.selectedFolder.set(f);
                }
              });
            }
          });
        }
      } else {
        if (this.tabSelected() === 'folder') {
          this.selectedFolder.set(null);
          this.folderId.set('');
          this.tabSelected.set('folders');
        }
      }
    });
  }

  canUpdate() {
    return this.topicService.canUpdate(this.topic());
  }

  canEdit() {
    return this.topicService.canEdit(this.topic());
  }

  canManageFolders() {
    return this.canUpdate();
  }

  canEditDeadline() {
    return this.canEdit() && this.topic().status === this.topicService.STATUSES.ideation;
  }

  hasIdeationEndedExpired() {
    return this.ideationService.hasIdeationEndedExpired(this.topic(), this.ideation());
  }

  hasIdeationEnded() {
    return this.ideationService.hasIdeationEnded(this.topic(), this.ideation());
  }

  selectTab(tab: 'ideas' | 'folders') {
    this.tabSelected.set(tab);
    this.selectedFolder.set(null);
    this.folderId.set('');
    this.currentPage.set(1);
    this.router.navigate([], { queryParams: { folderId: null }, queryParamsHandling: 'merge', preserveFragment: true });
  }

  viewFolder(folder: IdeationFolder) {
    this.selectedFolder.set(folder);
    this.folderId.set(folder.id);
    this.tabSelected.set('folder');
    this.currentPage.set(1);
    this.router.navigate([], { queryParams: { folderId: folder.id }, queryParamsHandling: 'merge', preserveFragment: true });
  }

  leaveFolder() {
    this.selectedFolder.set(null);
    this.folderId.set('');
    this.tabSelected.set('folders');
    this.currentPage.set(1);
    this.router.navigate([], { queryParams: { folderId: null }, queryParamsHandling: 'merge', preserveFragment: true });
  }

  setType(value: string) {
    this.selectedType.set(value);
    this.currentPage.set(1);
  }

  orderBy(value: string) {
    this.selectedOrder.set(value);
    this.currentPage.set(1);
  }

  setParticipant(user: IdeaVoter | null = null) {
    this.selectedParticipants.set(user);
    this.currentPage.set(1);
  }

  setAge(age: number | string) {
    if (age === '') {
        this.selectedAge.set([]);
    } else {
        const current = [...this.selectedAge()];
        const index = current.indexOf(age.toString());
        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(age.toString());
        }
        this.selectedAge.set([...current]);
    }
    this.currentPage.set(1);
  }

  setGender(gender: string) {
    this.selectedGender.set(gender);
    this.currentPage.set(1);
  }

  setResidence(residence: string) {
    this.selectedResidence.set(residence);
    this.currentPage.set(1);
  }

  setSearch(search: string) {
    this.searchValue.set(search);
    this.currentPage.set(1);
  }

  openSearch(event?: Event) {
    event?.stopPropagation();
    this.showSearch.set(true);
    setTimeout(() => {
      const input = document.querySelector('.search_input input') as HTMLInputElement;
      input?.focus();
    });
  }

  closeSearch(event?: Event) {
    event?.stopPropagation();
    this.showSearch.set(false);
  }

  clearAllFilters() {
    this.selectedType.set('');
    this.selectedOrder.set('');
    this.selectedParticipants.set(null);
    this.selectedAge.set([]);
    this.selectedGender.set('');
    this.selectedResidence.set('');
    this.searchValue.set('');
    this.currentPage.set(1);
  }

  doClearFilters() {
    this.clearAllFilters();
  }

  toggleMobileFilters() {
    this.mobileFiltersOpen.update(open => !open);
  }

  openMobileFilter(filter: 'type' | 'order' | 'participants' | 'age' | 'gender' | 'residence') {
    this.activeMobileFilter.set(filter);
  }

  get activeTypeLabel(): string {
    const val = this.selectedType();
    if (!val) return this.translate.instant('COMPONENTS.TOPIC_IDEATION.FILTER_ALL');
    if (val === 'iCreated') return this.translate.instant('COMPONENTS.TOPIC_IDEATION.FILTER_TYPE_YOUR_IDEAS');
    if (val === 'favourite') return this.translate.instant('COMPONENTS.TOPIC_IDEATION.FILTER_TYPE_FAVOURITES');
    if (val === 'showModerated') return this.translate.instant('COMPONENTS.TOPIC_IDEATION.FILTER_TYPE_MODERATED');
    return this.translate.instant('COMPONENTS.TOPIC_IDEATION.FILTER_ALL');
  }

  get activeOrderLabel(): string {
    const val = this.selectedOrder();
    if (!val) return this.translate.instant('COMPONENTS.TOPIC_IDEATION.FILTER_ALL');
    if (val === 'likes') return this.translate.instant('COMPONENTS.TOPIC_IDEATION.FILTER_ORDER_MOST_LIKED');
    if (val === 'recent') return this.translate.instant('COMPONENTS.TOPIC_IDEATION.FILTER_ORDER_MOST_RECENT');
    if (val === 'replies') return this.translate.instant('COMPONENTS.TOPIC_IDEATION.FILTER_ORDER_MOST_REPLIES');
    return this.translate.instant('COMPONENTS.TOPIC_IDEATION.FILTER_ALL');
  }

  get activeParticipantLabel(): string {
    return this.selectedParticipants()?.name || this.translate.instant('COMPONENTS.TOPIC_IDEATION.FILTER_ALL');
  }

  get activeAgeLabel(): string {
    return this.selectedAge().length > 0 ? this.sortedSelectedAges() : this.translate.instant('COMPONENTS.TOPIC_IDEATION.FILTER_ALL');
  }

  get activeGenderLabel(): string {
    const g = this.selectedGender();
    if (!g) return this.translate.instant('COMPONENTS.TOPIC_IDEATION.FILTER_ALL');
    const key = 'VIEWS.IDEATION_CREATE.DEMOGRAPHICS_DATA_GENDER_' + (g === 'other' ? 'OTHER_PLACEHOLDER' : g.toUpperCase());
    return this.translate.instant(key);
  }

  get activeResidenceLabel(): string {
    const r = this.selectedResidence();
    if (!r) return this.translate.instant('COMPONENTS.TOPIC_IDEATION.FILTER_ALL');
    if (r === 'other') return this.translate.instant('VIEWS.IDEATION_CREATE.DEMOGRAPHICS_DATA_RESIDENCE_OTHER_PLACEHOLDER');
    return r.charAt(0).toUpperCase() + r.slice(1);
  }

  onPageChange(p: number) {
    this.currentPage.set(p);
  }

  onIdeaDeleted(_idea: Idea) {
    this.refreshTrigger.update(n => n + 1);
    this.loadFolders$.next();
    this.refreshFoldersTrigger.update(n => n + 1);
    try {
      this.ideasResource.reload();
    } catch (e) {
      console.debug(e);
    }
  }

  onIdeaUpdated(_idea: Idea) {
    this.refreshTrigger.update(n => n + 1);
    this.loadFolders$.next();
    this.refreshFoldersTrigger.update(n => n + 1);
    try {
      this.ideasResource.reload();
    } catch (e) {
      console.debug(e);
    }
  }

  onIdeaAdded(_idea: Idea) {
    this.showAddIdea.set(false);
    this.currentPage.set(1);
    this.refreshTrigger.update(n => n + 1);
    this.loadFolders$.next();
    this.refreshFoldersTrigger.update(n => n + 1);
    try {
      this.ideasResource.reload();
    } catch (e) {
      console.debug(e);
    }
  }

  addIdea() {
    if (this.hasIdeationEnded()) return;
    
    if (!this.userStore.isAuthenticated()) {
      const dialogRef = this.authDialog.openLogin(this.router.url);
      dialogRef.afterClosed().pipe(take(1)).subscribe((success) => {
        if (success || this.userStore.isAuthenticated()) {
          this.showAddIdea.set(true);
        }
      });
      return;
    }
    
    this.showAddIdea.set(true);
  }

  exportIdeas() {
    if (isPlatformBrowser(this.platformId)) {
      const url = this.ideationService.downloadIdeas(this.topic().id, this.ideation().id);
      window.open(url);
    }
  }

  closeIdeation() {
    const dialog = this.dialogService.open(ConfirmDialogComponent, {
      data: {
        level: 'warn',
        heading: 'COMPONENTS.CLOSE_IDEATION_CONFIRM.HEADING',
        description: 'COMPONENTS.CLOSE_IDEATION_CONFIRM.ARE_YOU_SURE',
        sections: [{ heading: '', points: ['COMPONENTS.CLOSE_IDEATION_CONFIRM.CANNOT_UNDO'] }],
        confirmBtn: 'COMPONENTS.CLOSE_IDEATION_CONFIRM.CONFIRM_YES',
        closeBtn: 'COMPONENTS.CLOSE_IDEATION_CONFIRM.CONFIRM_NO',
      },
    });
    dialog.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        const saveData = { topicId: this.topic().id, ideationId: this.ideation().id, deadline: new Date() };
        this.ideationService.update(saveData).pipe(take(1)).subscribe(() => {
          this.topicService.reloadTopic();
        });
      }
    });
  }

  addFolder() {
    const dialog = this.dialogService.open(CreateIdeaFolderComponent, {
        data: {
            topicId: this.topic().id,
            ideationId: this.ideation().id
        }
    });
    dialog.afterClosed().subscribe(result => {
        if (result) {
            this.loadFolders$.next();
            this.refreshFoldersTrigger.update(n => n + 1);
        }
    });
  }

  editFolder(folder: IdeationFolder) {
    const dialog = this.dialogService.open(EditIdeaFolderComponent, {
        data: {
            topicId: this.topic().id,
            ideationId: this.ideation().id,
            folder: folder
        }
    });
    dialog.afterClosed().subscribe(result => {
        if (result) {
            this.loadFolders$.next();
            this.refreshFoldersTrigger.update(n => n + 1);
            if (this.selectedFolder()?.id === folder.id) {
                this.IdeationFolderService.query({
                    topicId: this.topic().id,
                    ideationId: this.ideation().id,
                    folderId: folder.id
                }).pipe(take(1)).subscribe((foldersRes) => {
                    const updated = foldersRes?.rows?.find((f: IdeationFolder) => f.id === folder.id);
                    if (updated) {
                        this.selectedFolder.set(updated);
                    }
                });
            }
        }
    });
  }

  editDeadline() {
    const dialog = this.dialogService.open(EditIdeationDeadlineComponent, {
      data: {
        ideation: this.ideation(),
        topic: this.topic(),
      },
    });
    dialog.afterClosed().subscribe(() => {
        // Topic reload is handled in dialog
    });
  }

  deleteFolder(folder: IdeationFolder) {
    const dialog = this.dialogService.open(ConfirmDialogComponent, {
        data: {
            level: 'delete',
            heading: 'MODALS.TOPIC_IDEATION_FOLDER_DELETE_CONFIRM_HEADING',
            points: ['MODALS.TOPIC_IDEATION_FOLDER_DELETE_CONFIRM_TXT_ARE_YOU_SURE'],
            confirmBtn: 'MODALS.TOPIC_IDEATION_FOLDER_DELETE_CONFIRM_BTN_YES',
            closeBtn: 'MODALS.TOPIC_IDEATION_FOLDER_DELETE_CONFIRM_BTN_NO',
        }
    });
    dialog.afterClosed().subscribe(confirmed => {
        if (confirmed) {
            this.ideationService.deleteFolder({
                topicId: this.topic().id,
                ideationId: this.ideation().id,
                folderId: folder.id
            }).pipe(take(1)).subscribe(() => {
                this.loadFolders$.next();
                this.refreshFoldersTrigger.update(n => n + 1);
                if (this.selectedFolder()?.id === folder.id) {
                    this.leaveFolder();
                }
            });
        }
    });
  }

  addIdeasToFolder(folder: IdeationFolder) {
    const dialogRef = this.dialog.open(AddIdeasToFolderComponent, {
        data: {
            folder,
            topicId: this.topic().id,
            ideationId: this.ideation().id
        }
    });
    dialogRef.afterClosed().subscribe((res) => {
        if (res) {
            try {
                this.ideasResource.reload();
            } catch (e) {
                console.debug(e);
            }
            this.refreshTrigger.update(n => n + 1);
            this.loadFolders$.next();
            this.refreshFoldersTrigger.update(n => n + 1);
            this.IdeationFolderService.query({
                topicId: this.topic().id,
                ideationId: this.ideation().id,
                folderId: folder.id
            }).pipe(take(1)).subscribe((foldersRes) => {
                const updated = foldersRes?.rows?.find((f: IdeationFolder) => f.id === folder.id);
                if (updated) {
                    this.selectedFolder.set(updated);
                }
            });
        }
    });
  }

  showMobileOverlay() {
    return this.activeMobileFilter() !== null;
  }

  closeMobileFilter() {
    this.activeMobileFilter.set(null);
    this.mobileIdeaFilters.set({
        type: false,
        orderBy: false,
        participants: false,
        age: false,
        gender: false,
        residence: false
    });
  }

  setMobileAges(age: number | string) {
    const current = this.mobileAges();
    if (age === '') {
        this.mobileAges.set([]);
    } else {
        const index = current.indexOf(age.toString());
        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(age.toString());
        }
        this.mobileAges.set([...current]);
    }
  }

  applyAgeFilter() {
    this.selectedAge.set([...this.mobileAges()]);
    this.currentPage.set(1);
  }

  TopicService = this.topicService;
}
