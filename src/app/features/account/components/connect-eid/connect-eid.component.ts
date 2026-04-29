import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DialogCloseDirective } from '../../../../shared/dialog/dialog-ref';
import { EstEidComponent } from '../../login/esteid/esteid.component';
import { NotificationComponent } from '../../../../shared/components/notification/notification.component';

@Component({
  selector: 'app-connect-eid',
  standalone: true,
  imports: [TranslateModule, DialogCloseDirective, EstEidComponent, NotificationComponent],
  templateUrl: './connect-eid.component.html',
})
export class ConnectEidComponent {}
