import { Component, input, output, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'cos-toggle',
  standalone: true,
  imports: [],
  template: `
    <button type="button" class="toggle-container" [class.on]="model()" (click)="toggle()" role="switch" [attr.aria-checked]="model()" [attr.aria-label]="model() ? textOn() : textOff()">
      <div class="toggle-track">
        <div class="toggle-handle"></div>
      </div>
      <div class="toggle-text">
        {{ model() ? textOn() : textOff() }}
      </div>
    </button>
  `,
  styles: [`
    .toggle-container {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      user-select: none;
    }

    .toggle-track {
      width: 40px;
      height: 20px;
      background: var(--color-danger);
      border-radius: 10px;
      position: relative;
      transition: background 0.2s;
    }

    .toggle-handle {
      width: 16px;
      height: 16px;
      background: #fff;
      border-radius: 50%;
      position: absolute;
      top: 2px;
      left: 2px;
      transition: transform 0.2s;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .on .toggle-track {
      background: var(--color-success);
    }

    .on .toggle-handle {
      transform: translateX(20px);
    }

    .toggle-text {
      font-size: 14px;
      color: var(--color-text);
      font-weight: 600;
    }
  `],
  encapsulation: ViewEncapsulation.None
})
export class ToggleComponent {
  model = input<boolean>(false);
  textOn = input<string>('ON');
  textOff = input<string>('OFF');
  toggleClick = output<boolean>();

  toggle() {
    this.toggleClick.emit(!this.model());
  }
}
