import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { UserTopicService } from '../../core/services/user-topic.service';
import { PublicTopicService } from '../../core/services/public-topic.service';
import { UserGroupService } from '../../core/services/user-group.service';
import { PublicGroupService } from '../../core/services/public-group.service';
import { NewsService } from '../../core/services/news.service';
import { UiStateService } from '../../core/services/ui-state.service';
import { CreateMenuComponent } from '../../shared/components/create-menu/create-menu.component';
import { TopicCardComponent } from '../../shared/components/topic-card/topic-card.component';
import { GroupCardComponent } from '../../shared/components/group-card/group-card.component';
import { TourItemDirective } from '../../shared/directives/tour-item.directive';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { PageHeaderComponent } from '../../core/components/shell/page-header/page-header.component';
import { SeoService } from '../../core/services/seo.service';
import { News } from '../../core/interfaces/news';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, TranslateModule, CreateMenuComponent, TopicCardComponent, GroupCardComponent, TourItemDirective, IconComponent, PageHeaderComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  translate = inject(TranslateService);

  private userTopicService = inject(UserTopicService);
  private publicTopicService = inject(PublicTopicService);
  private userGroupService = inject(UserGroupService);
  private publicGroupService = inject(PublicGroupService);
  private newsService = inject(NewsService);
  private uiState = inject(UiStateService);
  private seoService = inject(SeoService);

  readonly showCreate = signal(false);

  ngOnInit() {
    this.seoService.setPageTitle('DEFAULT.NAV.LNK_DASHBOARD');
    if (!localStorage.getItem('show-dashboard-tour')) {
      this.uiState.showOnboarding.set(true);
      localStorage.setItem('show-dashboard-tour', 'true');
    }
  }

  readonly myTopics = toSignal(this.userTopicService.loadItems(), { initialValue: [] });
  readonly publicTopics = toSignal(this.publicTopicService.loadItems(), { initialValue: [] });
  readonly myGroups = toSignal(this.userGroupService.loadItems(), { initialValue: [] });
  readonly publicGroups = toSignal(this.publicGroupService.loadItems(), { initialValue: [] });

  private readonly allNews = toSignal(
    this.newsService.get().pipe(
      map((items: News[]) => items.map(item => {
        const el = document.createElement('div');
        el.innerHTML = item.content;
        const img = el.querySelector('img');
        return img ? { ...item, imageUrl: img.src } : item;
      }))
    ),
    { initialValue: [] as News[] }
  );

  readonly hasNoEngagements = computed(() => this.myTopics().length === 0);
  readonly newsItems = computed(() => this.allNews().slice(0, 4));

  toggleCreate(): void {
    this.showCreate.update(v => !v);
  }
}
