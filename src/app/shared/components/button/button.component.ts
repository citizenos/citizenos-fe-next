import { Component, output, model, ChangeDetectionStrategy } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { IconName } from '../icon/icon.registry';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'light';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'cos-button',
  standalone: true,
  imports: [IconComponent],
  template: `
    <button
      [type]="type()"
      [disabled]="isDisabled() || isLoading()"
      [attr.aria-busy]="isLoading()"
      [attr.aria-disabled]="isDisabled()"
      [class]="'btn-' + variant() + ' btn-' + size() + (iconMode() ? ' btn-icon' : '')"
      (click)="onClick($event)"
    >
      @if (icon() && !isLoading()) {
        <cos-icon [name]="icon()!" [size]="iconSize()"></cos-icon>
      }
      
      @if (isLoading()) {
        <span class="spinner" aria-hidden="true"></span>
      }
      
      <span class="btn-content">
        <ng-content></ng-content>
      </span>
    </button>
  `,
  styleUrl: './button.component.scss'
})
export class ButtonComponent {
  variant = model<ButtonVariant>('primary');
  size = model<ButtonSize>('md');
  type = model<'button' | 'submit' | 'reset'>('button');
  
  icon = model<IconName>();
  iconMode = model<boolean>(false);
  
  isLoading = model<boolean>(false);
  isDisabled = model<boolean>(false);

  clicked = output<MouseEvent>();

  iconSize() {
    return this.size() === 'sm' ? 16 : 20;
  }

  onClick(event: MouseEvent) {
    if (!this.isDisabled() && !this.isLoading()) {
      this.clicked.emit(event);
    }
  }
}
