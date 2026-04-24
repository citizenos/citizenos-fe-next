import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'cos-group-create-help',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule],
  templateUrl: './group-create-help.component.html',
  styleUrl: './group-create-help.component.scss'
})
export class GroupCreateHelpComponent {
  step = input.required<string>();
}
