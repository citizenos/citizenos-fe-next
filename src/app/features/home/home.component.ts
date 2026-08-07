import { IconComponent } from '../../shared/components/icon/icon.component';
import { Component, OnInit, inject, ChangeDetectionStrategy, PLATFORM_ID, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { rxResource } from '@angular/core/rxjs-interop';

import { UserStore } from '../../core/state/user.store';
import { PublicTopicService } from '../../core/services/public-topic.service';
import { PublicGroupService } from '../../core/services/public-group.service';
import { HomeService } from './services/home.service';
import { SeoService } from '../../core/services/seo.service';

import { FeatureBoxComponent } from './components/feature-box/feature-box.component';
import { TopicCardComponent } from '../../shared/components/topic-card/topic-card.component';
import { GroupCardComponent } from '../../shared/components/group-card/group-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [
    RouterLink,
    TranslateModule,
    FeatureBoxComponent,
    TopicCardComponent,
    GroupCardComponent, IconComponent]
})
export class HomeComponent implements OnInit {
  private router = inject(Router);
  public translate = inject(TranslateService);
  private userStore = inject(UserStore);
  private topicService = inject(PublicTopicService);
  private groupService = inject(PublicGroupService);
  private homeService = inject(HomeService);
  private seoService = inject(SeoService);
  private platformId = inject(PLATFORM_ID);

  private getLimit() {
    if (isPlatformBrowser(this.platformId)) {
      if (window.innerWidth <= 600) {
        return 3;
      }
    }

    return 8;
  }

  private statsResource = rxResource({
    params: () => null,
    stream: () => this.homeService.getStats()
  });
  stats = computed(() => this.statsResource.value());

  private topicsResource = rxResource({
    params: () => this.getLimit(),
    stream: ({ params }) => this.topicService.getPreview(params)
  });
  topics = computed(() => this.topicsResource.value());

  private groupsResource = rxResource({
    params: () => this.getLimit(),
    stream: ({ params }) => this.groupService.getPreview(params)
  });
  groups = computed(() => this.groupsResource.value());

  ngOnInit() {
    this.seoService.setPageTitle();
    if (this.userStore.isAuthenticated()) {
      this.router.navigate(['/', this.translate.currentLang, 'dashboard']);
      return;
    }
  }

  createGroup() {
    const urlPath = ['/', this.translate.currentLang, 'my', 'groups', 'create'];

    if (!this.userStore.isAuthenticated()) {
      this.router.navigate(['/account/login'], { queryParams: { redirectSuccess: urlPath.join('/') } });
    } else {
      this.router.navigate(urlPath);
    }
  }
}
