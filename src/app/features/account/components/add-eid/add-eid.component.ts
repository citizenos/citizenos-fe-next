import { Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DialogService } from '../../../../shared/dialog/dialog.service';
import { DialogCloseDirective } from '../../../../shared/dialog/dialog-ref';
import { NotificationComponent } from '../../../../shared/components/notification/notification.component';
import { ConnectEidComponent } from '../connect-eid/connect-eid.component';
import { ConnectSmartIdComponent } from '../connect-smart-id/connect-smart-id.component';

@Component({
  selector: 'app-add-eid',
  standalone: true,
  imports: [TranslateModule, DialogCloseDirective, NotificationComponent],
  templateUrl: './add-eid.component.html',
  styleUrl: './add-eid.component.scss',
})
export class AddEidComponent {
  private dialog = inject(DialogService);

  doConnectEsteId() {
    this.dialog.open(ConnectEidComponent);
  }

  doConnectSmartId() {
    this.dialog.open(ConnectSmartIdComponent);
  }
}
