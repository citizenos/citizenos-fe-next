import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DialogCloseDirective } from '../../../../shared/dialog/dialog-ref';
import { EstEidComponent } from '../../login/esteid/esteid.component';
import { NotificationComponent } from '../../../../shared/components/notification/notification.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-connect-eid',
  standalone: true,
  imports: [TranslateModule, DialogCloseDirective, EstEidComponent, NotificationComponent, IconComponent],
  templateUrl: './connect-eid.component.html',
})
export class ConnectEidComponent {}
