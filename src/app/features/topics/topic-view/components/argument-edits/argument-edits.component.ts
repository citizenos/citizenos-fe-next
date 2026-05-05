import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-argument-edits',
  standalone: true,
  imports: [DatePipe, TranslateModule],
  templateUrl: './argument-edits.component.html',
  styleUrls: ['./argument-edits.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArgumentEditsComponent {
  argument = input.required<any>();
  topicId = input.required<string>();
  showEditsChange = output<boolean>();

  editsEntries(): [string, any][] {
    return Object.entries(this.argument().edits || {});
  }

  hideEdits() {
    this.showEditsChange.emit(false);
  }

  copyArgumentLink(event: MouseEvent, version: string) {
    const id = this.argument().id + '_v' + version;
    const url = `${window.location.origin}${window.location.pathname}?argumentId=${id}`;
    navigator.clipboard.writeText(url);
  }
}
