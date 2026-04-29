import { Component, input, inject, signal, effect, computed, ChangeDetectionStrategy, PLATFORM_ID } from '@angular/core';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { toSignal, toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { of, tap, switchMap, map, take } from 'rxjs';

import { TopicIdeationService } from '../../../../../core/services/topic-ideation.service';
import { TopicService } from '../../../../../core/services/topic.service';
import { UserStore } from '../../../../../core/state/user.store';
import { Topic } from '../../../../../core/interfaces/topic';
import { Ideation } from '../../../../../core/interfaces/ideation';
import { Idea, IdeaStatus } from '../../../../../core/interfaces/idea';
import { IdeaboxComponent } from '../ideabox/ideabox.component';
import { AddIdeaComponent } from '../add-idea/add-idea.component';
import { SearchInputComponent } from '../../../../../shared/components/search-input/search-input.component';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { DialogService } from '../../../../../shared/dialog/dialog.service';
import { ListFilterToolbarComponent, FilterConfig } from '../../../../../shared/components/list-filter-toolbar/list-filter-toolbar.component';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';

const PAGE_SIZE = 15;

@Component({
  selector: 'app-topic-ideation',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    TranslateModule,
    RouterModule,
    IdeaboxComponent,
    AddIdeaComponent,
    SearchInputComponent,
    PaginationComponent,
    ListFilterToolbarComponent,
    IconComponent
  ],
  templateUrl: './topic-ideation.component.html',
  styleUrls: ['./topic-ideation.component.scss'],
})
export class TopicIdeationComponent {
  topic = input.required<Topic>();
  ideation = input.required<Ideation>();

  private ideationService = inject(TopicIdeationService);
  private topicService = inject(TopicService);
  private dialogService = inject(DialogService);
  private platformId = inject(PLATFORM_ID);
  userStore = inject(UserStore);

  loading = signal(false);
  showAddIdea = signal(false);
  currentPage = signal(1);
  searchValue = signal('');
  selectedOrder = signal('');
  selectedType = signal('');
  private refreshTrigger = signal(0);
  
  private ideasResponse = toSignal(
    toObservable(computed(() => ({
      search: this.searchValue(),
      type: this.selectedType(),
      order: this.selectedOrder(),
      page: this.currentPage(),
      _v: this.refreshTrigger(),
      topic: this.topic(),
      ideation: this.ideation()
    }))).pipe(
      switchMap(({ search, type, order, page, topic, ideation }) => {
        if (!topic?.id || !ideation?.id) return of({ rows: [] as Idea[], count: 0 });
        this.loading.set(true);
        const params: Record<string, any> = {
          topicId: topic.id,
          ideationId: ideation.id,
          limit: PAGE_SIZE,
          offset: (page - 1) * PAGE_SIZE,
        };
        if (search) params['search'] = search;
        if (order) { params['orderBy'] = order; params['order'] = 'desc'; }
        if (type === 'favourite') params['favourite'] = true;
        else if (type === 'iCreated') params['authorId'] = this.userStore.user()?.id;

        return this.ideationService.getIdeas(params as any).pipe(
          tap(() => this.loading.set(false))
        );
      })
    )
  );

  ideas = computed(() => {
    const res = this.ideasResponse();
    if (!res) return [];
    return [...res.rows].sort(a => a.status === IdeaStatus.draft ? -1 : 1);
  });

  ideasCount = computed(() => {
    const res = this.ideasResponse();
    if (!res) return 0;
    return typeof res.count === 'number' ? res.count : (res.count?.total ?? 0);
  });

  Math = Math;

  ORDER_OPTIONS = [
    { value: 'all', label: 'COMPONENTS.TOPIC_IDEATION.ORDER_NEWEST' },
    { value: 'rating', label: 'COMPONENTS.TOPIC_IDEATION.ORDER_RATING' },
    { value: 'popularity', label: 'COMPONENTS.TOPIC_IDEATION.ORDER_POPULARITY' },
  ];

  TYPE_OPTIONS = [
    { value: 'all', label: 'COMPONENTS.TOPIC_IDEATION.FILTER_ALL' },
    { value: 'favourite', label: 'COMPONENTS.TOPIC_IDEATION.FILTER_FAVOURITE' },
    { value: 'iCreated', label: 'COMPONENTS.TOPIC_IDEATION.FILTER_MY_IDEAS' },
  ];

  filterConfig = computed<FilterConfig[]>(() => [
    {
      key: 'type',
      placeholder: 'COMPONENTS.TOPIC_IDEATION.FILTER_ALL',
      selectedValue: this.selectedType(),
      items: this.TYPE_OPTIONS.map(o => ({ title: o.label, value: o.value }))
    },
    {
      key: 'order',
      placeholder: 'COMPONENTS.TOPIC_IDEATION.ORDER_NEWEST',
      selectedValue: this.selectedOrder(),
      items: this.ORDER_OPTIONS.map(o => ({ title: o.label, value: o.value }))
    }
  ]);


  constructor() {
    // Reset page when search changes
    effect(() => {
      this.searchValue();
      this.currentPage.set(1);
    });
  }

  canUpdate() {
    return this.topicService.canUpdate(this.topic());
  }

  canEdit() {
    return this.topicService.canEdit(this.topic());
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

  setOrder(value: string) {
    this.selectedOrder.set(value);
    this.currentPage.set(1);
  }

  setType(value: string) {
    this.selectedType.set(value);
    this.currentPage.set(1);
  }

  onFilterChange(event: { key: string, value: string }) {
    const val = event.value === 'all' ? '' : event.value;
    if (event.key === 'type') this.setType(val);
    if (event.key === 'order') this.setOrder(val);
  }

  onPageChange(p: number) {
    this.currentPage.set(p);
  }

  onIdeaDeleted(idea: Idea) {
    this.refreshTrigger.update(n => n + 1);
  }

  onIdeaUpdated(idea: Idea) {
    this.refreshTrigger.update(n => n + 1);
  }

  onIdeaAdded(idea: Idea) {
    this.showAddIdea.set(false);
    this.currentPage.set(1);
    this.refreshTrigger.update(n => n + 1);
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
}
