import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DialogCloseDirective } from '../../../../shared/dialog/dialog-ref';
import { SmartIdComponent } from '../../login/smart-id/smart-id.component';
import { NotificationComponent } from '../../../../shared/components/notification/notification.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-connect-smart-id',
  standalone: true,
  imports: [TranslateModule, DialogCloseDirective, SmartIdComponent, NotificationComponent, IconComponent],
  templateUrl: './connect-smart-id.component.html',
})
export class ConnectSmartIdComponent {}
