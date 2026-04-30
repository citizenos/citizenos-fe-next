import { Component, ChangeDetectionStrategy, signal, input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

/**
 * A rich hoverable tooltip matching the legacy design.
 * Shows an info icon; on hover, displays a dark panel with a title, HTML body,
 * and a directional arrow.
 *
 * Usage:
 *   <cos-tooltip [title]="'My heading'" [description]="'<b>Rich</b> HTML content'">
 *   </cos-tooltip>
 *
 *   Or with ng-content for custom body:
 *   <cos-tooltip [title]="'My heading'">
 *     <p>Custom HTML body here.</p>
 *   </cos-tooltip>
 */
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

  visible = signal(false);

  show() { this.visible.set(true); }
  hide() { this.visible.set(false); }
}
