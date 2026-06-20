import { Component, input, output, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TopicService } from '../../../../../core/services/topic.service';
import { UserStore } from '../../../../../core/state/user.store';
import { Topic } from '../../../../../core/interfaces/topic';
import { ActivitiesButtonComponent } from '../../../../../shared/components/activities-button/activities-button.component';
import { TooltipComponent } from '../../../../../shared/components/tooltip/tooltip.component';
import { TourItemDirective } from '../../../../../shared/directives/tour-item.directive';

@Component({
  selector: 'app-topic-tabs',
  standalone: true,
  imports: [
    RouterModule,
    TranslateModule,
    ActivitiesButtonComponent,
    TooltipComponent,
    TourItemDirective],
  templateUrl: './topic-tabs.component.html',
  styleUrls: ['./topic-tabs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
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

  toggleFavourite() {
    this.topicService.toggleFavourite(this.topic());
  }

}

