import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { Component, input, output, inject, ChangeDetectionStrategy, PLATFORM_ID } from '@angular/core';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { Argument } from '../../../../../core/interfaces/discussion';
import { NotificationService } from '../../../../../core/services/notification.service';

@Component({
  selector: 'app-argument-edits',
  standalone: true,
  imports: [DatePipe, TranslateModule, IconComponent],
  templateUrl: './argument-edits.component.html',
  styleUrls: ['./argument-edits.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArgumentEditsComponent {
  argument = input.required<Argument>();
  topicId = input.required<string>();
  showEdits = input<boolean>(false);
  showEditsChange = output<boolean>();

  private notification = inject(NotificationService);
  private platformId = inject(PLATFORM_ID);

  editsEntries(): [string, { subject?: string | null; text?: string | null; createdAt?: string; type?: string | null }][] {
    return Object.entries(this.argument().edits || {});
  }

  hideEdits() {
    this.showEditsChange.emit(false);
  }

  copyArgumentLink(event: MouseEvent, version: string) {
    if (isPlatformBrowser(this.platformId)) {
      const id = this.argument().id + '_v' + version;
      const url = `${window.location.origin}${window.location.pathname}?argumentId=${id}`;
      navigator.clipboard.writeText(url).then(() => {
        this.notification.success('VIEWS.TOPICS_TOPICID.ARGUMENT_LNK_COPIED');
      });
    }
  }
}
