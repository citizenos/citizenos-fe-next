import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DialogCloseDirective } from '../../../../../shared/dialog/dialog-ref';

@Component({
  selector: 'cos-topic-settings-locked',
  standalone: true,
  imports: [TranslateModule, DialogCloseDirective],
  templateUrl: './topic-settings-locked.component.html',
  styleUrl: './topic-settings-locked.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicSettingsLockedComponent {}
