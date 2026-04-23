import { Component, input, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'cos-group-create-help',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './group-create-help.component.html',
  styleUrl: './group-create-help.component.scss'
})
export class GroupCreateHelpComponent {
  step = input.required<string>();
}
