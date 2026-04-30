import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { UpperCasePipe } from '@angular/common';

import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';
import { DialogCloseDirective } from '../../../../../shared/dialog/dialog-ref';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';

export interface TopicReportReasonData {
  report: {
    moderatedReasonText: string;
    moderatedReasonType: string;
  };
}

@Component({
  selector: 'app-topic-report-reason',
  standalone: true,
  imports: [TranslateModule, IconComponent, DialogCloseDirective, UpperCasePipe],
  templateUrl: './topic-report-reason.component.html',
  styleUrls: ['./topic-report-reason.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopicReportReasonComponent {
  public data = inject<TopicReportReasonData>(DIALOG_DATA);
}
