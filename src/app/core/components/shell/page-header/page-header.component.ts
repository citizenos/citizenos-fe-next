import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { UserStore } from '../../../state/user.store';
import { InitialsComponent } from '../../../../shared/components/initials/initials.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { ActivitiesButtonComponent } from '../../../../shared/components/activities-button/activities-button.component';
import { GlobalSearchService } from '../../../services/global-search.service';
import { TourItemDirective } from '../../../../shared/directives/tour-item.directive';

@Component({
  selector: 'cos-page-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, InitialsComponent, IconComponent, ActivitiesButtonComponent, TourItemDirective],
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss']
})
export class PageHeaderComponent {
  userStore = inject(UserStore);
  searchService = inject(GlobalSearchService);

  toggleSearch() {
    this.searchService.showSearch.update(v => !v);
  }
}
