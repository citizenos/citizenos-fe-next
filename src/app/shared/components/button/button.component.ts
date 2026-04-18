import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import { IconName } from '../icon/icon.registry';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'light';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'cos-button',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <button
      [type]="type()"
      [disabled]="isDisabled() || isLoading()"
      [attr.aria-busy]="isLoading()"
      [attr.aria-disabled]="isDisabled()"
      [class]="'btn-' + variant() + ' btn-' + size()"
      (click)="onClick($event)"
    >
      <cos-icon *ngIf="icon() && !isLoading()" [name]="icon()!" [size]="iconSize()"></cos-icon>
      
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
  variant = input<ButtonVariant>('primary');
  size = input<ButtonSize>('md');
  type = input<'button' | 'submit' | 'reset'>('button');
  
  icon = input<IconName>();
  
  isLoading = input<boolean>(false);
  isDisabled = input<boolean>(false);

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
