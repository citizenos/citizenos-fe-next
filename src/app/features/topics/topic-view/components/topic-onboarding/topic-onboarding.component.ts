import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { ChangeDetectionStrategy, Component, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { DialogCloseDirective } from '../../../../../shared/dialog/dialog-ref';
import { TourService } from '../../../../../core/services/tour.service';

@Component({
  selector: 'cos-topic-onboarding',
  standalone: true,
  imports: [TranslateModule, DialogCloseDirective, IconComponent],
  templateUrl: './topic-onboarding.component.html',
  styleUrl: './topic-onboarding.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicOnboardingComponent {
  private tourService = inject(TourService);
  private platformId = inject(PLATFORM_ID);

  takeTour() {
    const width = isPlatformBrowser(this.platformId) ? window.innerWidth : 1280;
    const tour = width <= 1024 ? 'topic_mobile' : 'topic';
    this.tourService.show(tour, 1);
  }
}
