import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { UserStore } from '../../core/state/user.store';
import { PublicTopicService } from '../../core/services/public-topic.service';
import { PublicGroupService } from '../../core/services/public-group.service';
import { HomeService } from './services/home.service';

import { FeatureBoxComponent } from './components/feature-box/feature-box.component';
import { TopicCardComponent } from '../../shared/components/topic-card/topic-card.component';
import { GroupCardComponent } from '../../shared/components/group-card/group-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [
    RouterLink,
    TranslateModule,
    FeatureBoxComponent,
    TopicCardComponent,
    GroupCardComponent
  ]
})
export class HomeComponent implements OnInit {
  private router = inject(Router);
  public translate = inject(TranslateService);
  private userStore = inject(UserStore);
  private topicService = inject(PublicTopicService);
  private groupService = inject(PublicGroupService);
  private homeService = inject(HomeService);

  private getLimit() {
    return window.innerWidth < 560 ? 3 : 8;
  }

  stats = toSignal(this.homeService.getStats());
  topics = toSignal(this.topicService.getPreview(this.getLimit()));
  groups = toSignal(this.groupService.getPreview(this.getLimit()));

  ngOnInit() {
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
