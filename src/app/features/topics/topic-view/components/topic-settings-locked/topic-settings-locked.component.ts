import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DialogCloseDirective } from '../../../../../shared/dialog/dialog-ref';

@Component({
  selector: 'cos-topic-settings-locked',
  standalone: true,
  imports: [TranslateModule, DialogCloseDirective, IconComponent],
  templateUrl: './topic-settings-locked.component.html',
  styleUrl: './topic-settings-locked.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicSettingsLockedComponent {}
