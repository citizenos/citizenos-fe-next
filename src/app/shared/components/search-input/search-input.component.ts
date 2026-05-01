import { Component, input, model, ViewEncapsulation } from '@angular/core';
import { InputComponent } from '../input/input.component';
import { IconComponent } from '../icon/icon.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [InputComponent, IconComponent, FormsModule],
  template: `
    <div class="search-input-wrapper">
      <div class="search-icon">
        <cos-icon name="search" size="24"></cos-icon>
      </div>
      <cos-input [placeholder]="placeholder()">
        <input type="text"
               [ngModel]="value()"
               (ngModelChange)="onValueChange($event)"
               [placeholder]="placeholder()" />
      </cos-input>
      <button class="clear-button" (click)="clearValue()" aria-label="Clear Search">
        <cos-icon name="close" size="20"></cos-icon>
      </button>
    </div>
  `,
  styles: [`
    .search-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
    }
    .search-icon {
      position: absolute;
      left: 12px;
      top: 15px;
      z-index: 10;
      display: flex;
      align-items: center;
      color: var(--color-text-muted, #727C84);
      cos-icon {
        width: 24px;
        height: 24px;
      }
    }
    .search-input-wrapper cos-input {
      width: 100%;
    }
    .search-input-wrapper cos-input input {
      padding-left: 44px !important; /* Space for the search icon */
      padding-right: 44px !important; /* Space for the clear button */
    }
    .clear-button {
      position: absolute;
      right: 12px;
      z-index: 10;
      background: transparent;
      border: none;
      padding: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      color: var(--color-text-muted, #727C84);
      transition: background 0.2s ease-in-out, color 0.2s ease-in-out;

      cos-icon {
        transition: transform 0.3s ease-in-out;
      }
    }
    .clear-button:hover {
      background: var(--color-background-hover);
      color: var(--color-text, #2C3B47);

      cos-icon {
        transform: rotate(90deg);
      }
    }
  `],
  encapsulation: ViewEncapsulation.None
})
export class SearchInputComponent {
  placeholder = input<string>('Search...');
  value = model<string>('');

  onValueChange(newValue: string) {
    this.value.set(newValue);
  }

  clearValue() {
    this.value.set('');
  }
}
