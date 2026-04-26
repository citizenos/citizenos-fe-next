import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DialogCloseDirective } from '../../../../../shared/dialog/dialog-ref';

@Component({
  selector: 'app-download-vote-results',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, DialogCloseDirective],
  templateUrl: './download-vote-results.component.html'
})
export class DownloadVoteResultsComponent {}
