import { Component, input, inject, signal, OnInit, effect } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { switchMap, map, BehaviorSubject, combineLatest, take } from 'rxjs';

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

const PAGE_SIZE = 15;

@Component({
  selector: 'app-topic-ideation',
  standalone: true,
  imports: [
    DatePipe,
    TranslateModule,
    RouterModule,
    IdeaboxComponent,
    AddIdeaComponent,
    SearchInputComponent,
    PaginationComponent,
  ],
  templateUrl: './topic-ideation.component.html',
  styleUrls: ['./topic-ideation.component.scss'],
})
export class TopicIdeationComponent implements OnInit {
  topic = input.required<Topic>();
  ideation = input.required<Ideation>();

  private ideationService = inject(TopicIdeationService);
  private topicService = inject(TopicService);
  private dialogService = inject(DialogService);
  userStore = inject(UserStore);

  ideas = signal<Idea[]>([]);
  ideasCount = signal(0);
  loading = signal(false);
  showAddIdea = signal(false);
  currentPage = signal(1);
  searchValue = signal('');

  searchFilter = new BehaviorSubject('');
  typeFilter = new BehaviorSubject('');
  orderFilter = new BehaviorSubject('');
  page = new BehaviorSubject(1);

  Math = Math;

  ORDER_OPTIONS = [
    { value: '', label: 'COMPONENTS.TOPIC_IDEATION.ORDER_NEWEST' },
    { value: 'rating', label: 'COMPONENTS.TOPIC_IDEATION.ORDER_RATING' },
    { value: 'popularity', label: 'COMPONENTS.TOPIC_IDEATION.ORDER_POPULARITY' },
  ];

  TYPE_OPTIONS = [
    { value: '', label: 'COMPONENTS.TOPIC_IDEATION.FILTER_ALL' },
    { value: 'favourite', label: 'COMPONENTS.TOPIC_IDEATION.FILTER_FAVOURITE' },
    { value: 'iCreated', label: 'COMPONENTS.TOPIC_IDEATION.FILTER_MY_IDEAS' },
  ];

  selectedOrder = signal('');
  selectedType = signal('');

  constructor() {
    effect(() => {
      const val = this.searchValue();
      this.searchFilter.next(val);
      this.currentPage.set(1);
      this.page.next(1);
    });
  }

  ngOnInit() {
    combineLatest([this.searchFilter, this.typeFilter, this.orderFilter, this.page])
      .pipe(
        switchMap(([search, type, order, page]) => {
          this.loading.set(true);
          const params: Record<string, any> = {
            topicId: this.topic().id,
            ideationId: this.ideation().id,
            limit: PAGE_SIZE,
            offset: (page - 1) * PAGE_SIZE,
          };
          if (search) params['search'] = search;
          if (order) { params['orderBy'] = order; params['order'] = 'desc'; }
          if (type === 'favourite') params['favourite'] = true;
          else if (type === 'iCreated') params['authorId'] = this.userStore.user()?.id;
          return this.ideationService.getIdeas(params as any);
        }),
        map(res => {
          this.loading.set(false);
          return res;
        })
      )
      .subscribe(res => {
        const sorted = [...res.rows].sort(a => a.status === IdeaStatus.draft ? -1 : 1);
        this.ideas.set(sorted);
        this.ideasCount.set(typeof res.count === 'number' ? res.count : (res.count?.total ?? 0));
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
    this.orderFilter.next(value);
    this.currentPage.set(1);
    this.page.next(1);
  }

  setType(value: string) {
    this.selectedType.set(value);
    this.typeFilter.next(value);
    this.currentPage.set(1);
    this.page.next(1);
  }

  onPageChange(p: number) {
    this.currentPage.set(p);
    this.page.next(p);
  }

  onIdeaDeleted(idea: Idea) {
    this.ideas.update(list => list.filter(i => i.id !== idea.id));
    this.ideasCount.update(c => c - 1);
  }

  onIdeaUpdated(idea: Idea) {
    this.ideas.update(list => list.map(i => i.id === idea.id ? idea : i));
  }

  onIdeaAdded(idea: Idea) {
    this.showAddIdea.set(false);
    this.page.next(1);
    this.searchFilter.next(this.searchFilter.value);
  }

  exportIdeas() {
    const url = this.ideationService.downloadIdeas(this.topic().id, this.ideation().id);
    window.open(url);
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
