import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
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
import { CreateMenuComponent } from '../../shared/components/create-menu/create-menu.component';
import { TopicCardComponent } from '../../shared/components/topic-card/topic-card.component';
import { GroupCardComponent } from '../../shared/components/group-card/group-card.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { DashboardListSectionComponent } from '../../shared/components/dashboard-list-section/dashboard-list-section.component';
import { PageHeaderComponent } from '../../core/components/shell/page-header/page-header.component';
import { News } from '../../core/interfaces/news';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, TranslateModule, CreateMenuComponent, TopicCardComponent, GroupCardComponent, IconComponent, PageHeaderComponent, DashboardListSectionComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  translate = inject(TranslateService);

  private userTopicService = inject(UserTopicService);
  private publicTopicService = inject(PublicTopicService);
  private userGroupService = inject(UserGroupService);
  private publicGroupService = inject(PublicGroupService);
  private newsService = inject(NewsService);

  readonly showCreate = signal(false);

  readonly myTopics = toSignal(this.userTopicService.items$, { initialValue: [] });
  readonly publicTopics = toSignal(this.publicTopicService.items$, { initialValue: [] });
  readonly myGroups = toSignal(this.userGroupService.getPreview(8), { initialValue: [] });
  readonly publicGroups = toSignal(this.publicGroupService.getPreview(8), { initialValue: [] });

  private readonly allNews = toSignal(
    this.newsService.get().pipe(
      map((items: News[]) => items.map(item => {
        const match = item.content.match(/<img[^>]+src="([^"]+)"/);
        return match ? { ...item, imageUrl: match[1] } : item;
      }))
    ),
    { initialValue: [] }
  );

  readonly hasNoEngagements = computed(() => this.myTopics().length === 0);
  readonly newsItems = computed(() => this.allNews().slice(0, 4));

  toggleCreate(): void {
    this.showCreate.update(v => !v);
  }
}
