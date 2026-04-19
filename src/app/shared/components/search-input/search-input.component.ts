import { Component, input, output, model, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputComponent } from '../input/input.component';
import { IconComponent } from '../icon/icon.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [CommonModule, InputComponent, IconComponent, FormsModule],
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
      @if (value()) {
        <button class="clear-button" (click)="clearValue()" aria-label="Clear Search">
          <cos-icon name="close" size="20"></cos-icon>
        </button>
      }
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
      z-index: 10;
      display: flex;
      align-items: center;
      color: var(--color-text-muted, #727C84);
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
    }
    .clear-button:hover {
      background: rgba(0, 0, 0, 0.05);
      color: var(--color-text, #2C3B47);
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
