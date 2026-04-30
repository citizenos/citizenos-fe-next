import { ChangeDetectionStrategy, Component, inject, ViewEncapsulation } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { UpperCasePipe } from '@angular/common';

import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';
import { DialogCloseDirective } from '../../../../../shared/dialog/dialog-ref';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';

export interface IdeaReportReasonData {
  report: {
    moderatedReasonText: string;
    moderatedReasonType: string;
  };
}

@Component({
  selector: 'app-idea-report-reason',
  standalone: true,
  imports: [TranslateModule, IconComponent, DialogCloseDirective, UpperCasePipe],
  templateUrl: './idea-report-reason.component.html',
  styleUrls: ['./idea-report-reason.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class IdeaReportReasonComponent {
  public data = inject<IdeaReportReasonData>(DIALOG_DATA);
}
