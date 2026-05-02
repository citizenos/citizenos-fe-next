import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DialogCloseDirective } from '../../../../../shared/dialog/dialog-ref';
import { TourService } from '../../../../../core/services/tour.service';

@Component({
  selector: 'cos-topic-onboarding',
  standalone: true,
  imports: [TranslateModule, DialogCloseDirective],
  templateUrl: './topic-onboarding.component.html',
  styleUrl: './topic-onboarding.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicOnboardingComponent {
  private tourService = inject(TourService);

  takeTour() {
    const tour = window.innerWidth <= 1024 ? 'topic_mobile' : 'topic';
    this.tourService.show(tour, 1);
  }
}
