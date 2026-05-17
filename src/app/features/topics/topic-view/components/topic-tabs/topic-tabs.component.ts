import { Component, input, output, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TopicService } from '../../../../../core/services/topic.service';
import { UserStore } from '../../../../../core/state/user.store';
import { Topic } from '../../../../../core/interfaces/topic';
import { DomainIconComponent } from '../../../../../shared/components/domain-icon/domain-icon.component';
import { ActivitiesButtonComponent } from '../../../../../shared/components/activities-button/activities-button.component';
import { TooltipComponent } from '../../../../../shared/components/tooltip/tooltip.component';
import { TourItemDirective } from '../../../../../shared/directives/tour-item.directive';

@Component({
  selector: 'app-topic-tabs',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    DomainIconComponent,
    ActivitiesButtonComponent,
    TooltipComponent,
    TourItemDirective
  ],
  templateUrl: './topic-tabs.component.html',
  styleUrls: ['./topic-tabs.component.scss']
})
export class TopicTabsComponent {
  topic = input.required<Topic>();
  tabSelected = input<string | null>(null);
  wWidth = input<number>(1280);

  tabNavigate = output<string>();

  topicService = inject(TopicService);
  userStore = inject(UserStore);

  get STATUSES() { return this.topicService.STATUSES; }

  isLoggedIn = computed(() => this.userStore.isAuthenticated());

  selectTab(tab: string) {
    this.tabNavigate.emit(tab);
  }

  toggleFavourite(topic: Topic) {
    this.topicService.toggleFavourite(topic);
  }
}
