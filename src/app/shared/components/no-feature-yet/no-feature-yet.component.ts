import { Component, Input } from '@angular/core';

@Component({
  selector: 'cos-no-feature-yet',
  templateUrl: './no-feature-yet.component.html',
  styleUrls: ['./no-feature-yet.component.scss'],
  standalone: true
})
export class NoFeatureYetComponent {
  @Input() background: 'surface' | 'discussion' = 'surface';
}
