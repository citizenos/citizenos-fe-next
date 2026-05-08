import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DialogCloseDirective, DialogRef } from '../../../../../shared/dialog/dialog-ref';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-download-vote-results',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, DialogCloseDirective, IconComponent],
  templateUrl: './download-vote-results.component.html'
})
export class DownloadVoteResultsComponent {
  dialogRef = inject(DialogRef);
}
