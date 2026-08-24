import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit, PLATFORM_ID, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { rxResource } from '@angular/core/rxjs-interop';
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

  private platformId = inject(PLATFORM_ID);

  readonly showCreate = signal(false);

  ngOnInit() {
    this.seoService.setPageTitle('DEFAULT.NAV.LNK_DASHBOARD');
    if (isPlatformBrowser(this.platformId) && !localStorage.getItem('show-dashboard-tour')) {
      this.uiState.showOnboarding.set(true);
      localStorage.setItem('show-dashboard-tour', 'true');
    }
  }

  readonly myTopics = this.userTopicService.items;
  readonly publicTopics = this.publicTopicService.items;
  readonly myGroups = this.userGroupService.items;
  readonly publicGroups = this.publicGroupService.items;

  private readonly newsResource = rxResource({
    params: () => null,
    stream: () => this.newsService.get().pipe(
      map((items: News[]) => items.map(item => {
        const el = document.createElement('div');
        el.innerHTML = item.content;
        const img = el.querySelector('img');
        return img ? { ...item, imageUrl: img.src } : item;
      }))
    )
  });

  private readonly allNews = computed(() => this.newsResource.value() || [] as News[]);

  readonly hasNoEngagements = computed(() => this.myTopics().length === 0);
  readonly newsItems = computed(() => this.allNews().slice(0, 4));

  toggleCreate(): void {
    this.showCreate.update(v => !v);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.showCreate()) {
      const target = event.target as HTMLElement;
      if (!target.closest('#create_menu_wrap') && !target.closest('#dashboard_create_btn')) {
        this.showCreate.set(false);
      }
    }
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.showCreate()) {
      this.showCreate.set(false);
    }
  }
}
