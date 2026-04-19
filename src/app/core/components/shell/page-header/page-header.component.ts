import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { UserStore } from '../../../state/user.store';
import { InitialsComponent } from '../../../../shared/components/initials/initials.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { ActivitiesButtonComponent } from '../../../../shared/components/activities-button/activities-button.component';

@Component({
  selector: 'cos-page-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, InitialsComponent, IconComponent, ActivitiesButtonComponent],
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss']
})
export class PageHeaderComponent {
  userStore = inject(UserStore);
}
