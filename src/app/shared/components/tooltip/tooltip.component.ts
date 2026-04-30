import { Component, ChangeDetectionStrategy, signal, input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'cos-tooltip',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tooltip.component.html',
  styleUrl: './tooltip.component.scss',
})
export class TooltipComponent {
  /** Heading shown at the top of the tooltip panel. */
  title = input<string>('');
  /** Optional HTML description rendered via [innerHTML]. Ignored if ng-content is used. */
  description = input<string>('');
  /** 'bottom' (default) shows arrow above panel; 'top' shows arrow below panel. */
  pos = input<'top' | 'bottom'>('bottom');
  /** If true, the info icon is hidden. Useful when wrapping a custom trigger element. */
  noIcon = input<boolean>(false);

  visible = signal(false);

  show() { this.visible.set(true); }
  hide() { this.visible.set(false); }
}
