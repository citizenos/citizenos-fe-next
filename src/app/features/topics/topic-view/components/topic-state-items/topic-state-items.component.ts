import { Component, output, inject, ChangeDetectionStrategy, model } from '@angular/core';
import { NgClass, DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TopicService } from '../../../../../core/services/topic.service';
import { TopicIdeationService } from '../../../../../core/services/topic-ideation.service';
import { TopicArgumentService } from '../../../../../core/services/topic-argument.service';
import { TopicVoteService } from '../../../../../core/services/topic-vote.service';
import { UserStore } from '../../../../../core/state/user.store';
import { Topic } from '../../../../../core/interfaces/topic';
import { Ideation } from '../../../../../core/interfaces/ideation';
import { Vote } from '../../../../../core/interfaces/vote';
import { TopicVote } from '../../../../../core/interfaces/topic';

import { DomainIconComponent } from '../../../../../shared/components/domain-icon/domain-icon.component';

@Component({
  selector: 'app-topic-state-items',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass, DatePipe, TranslateModule, DomainIconComponent],
  templateUrl: './topic-state-items.component.html',
  styleUrls: ['./topic-state-items.component.scss']
})
export class TopicStateItemsComponent {
  topic = model.required<Topic>();
  
  // These could be passed down, but the component could also query them if it has id.
  // For UI representation, let's allow passing signals or objects
  ideation = model<Ideation | null>(null);
  vote = model<Vote | TopicVote | any>(null);
  eventCount = model<number>(0);
  
  // We can inject services to check logic
  topicService = inject(TopicService);
  topicIdeationService = inject(TopicIdeationService);
  topicArgumentService = inject(TopicArgumentService);
  topicVoteService = inject(TopicVoteService);
  userStore = inject(UserStore);

  navigateTab = output<string>();
  startDiscussion = output<Topic>();
  startVote = output<Topic>();
  sendToFollowUp = output<Topic>();

  argumentCount = this.topicArgumentService.count;

  get isLoggedIn() { return this.userStore.isAuthenticated; }

  get STATUSES() {
    return this.topicService.STATUSES;
  }

  canUpdate(topic: Topic): boolean {
    return this.topicService.canUpdate(topic);
  }

  getDaysUntil(dateString: string | Date): number {
    const end = new Date(dateString);
    end.setHours(23, 59, 59, 999);
    const start = new Date();
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  ideationDeadlineBar(ideation: Ideation | null) {
    if (ideation && ideation.deadline) {
      const createdAt = new Date(ideation.createdAt).getTime();
      const deadline = new Date(ideation.deadline).getTime();
      const now = new Date().getTime();
      if (now >= deadline) return 100;
      return ((now - createdAt) / (deadline - createdAt)) * 100;
    }
    return 0;
  }

  getArgumentPercentage(count: number) {
    const total = this.argumentCount.value.total;
    if (total === 0) return 0;
    return (count / total) * 100;
  }
}
