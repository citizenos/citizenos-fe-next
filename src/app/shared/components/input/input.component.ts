import { Component, ContentChild, ElementRef, AfterContentChecked, input, signal, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'cos-input',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="input-container" [class.has-error]="hasError()">
      <div class="input-wrapper">
        <div class="cos_input_placeholder" [class.show]="showPlaceholder()" [innerHTML]="placeholder()"></div>
        <ng-content></ng-content>
      </div>
      @if (hasError() && errorMessage()) {
        <span class="error-message" role="alert">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M8.89438 1.78863C8.52586 1.05158 7.47405 1.05158 7.10553 1.78863L0.723562 14.5526C0.391112 15.2175 0.874608 15.9998 1.61799 15.9998H14.3819C15.1253 15.9998 15.6088 15.2175 15.2763 14.5526L8.89438 1.78863ZM6.99996 6.99977C6.99996 6.44749 7.44767 5.99977 7.99996 5.99977C8.55224 5.99977 8.99996 6.44749 8.99996 6.99977V9.99977C8.99996 10.5521 8.55224 10.9998 7.99996 10.9998C7.44767 10.9998 6.99996 10.5521 6.99996 9.99977V6.99977ZM6.99996 12.9998C6.99996 12.4475 7.44767 11.9998 7.99996 11.9998C8.55224 11.9998 8.99996 12.4475 8.99996 12.9998C8.99996 13.5521 8.55224 13.9998 7.99996 13.9998C7.44767 13.9998 6.99996 13.5521 6.99996 12.9998Z" fill="currentColor"/>
          </svg>
          {{ errorMessage() }}
        </span>
      }
    </div>
  `,
  styles: [`
    cos-input {
      display: block;
      width: 100%;
    }
    
    .input-container {
      display: flex;
      flex-direction: column;
      width: 100%;
      margin-bottom: var(--spacing-md);
      position: relative;
    }
    
    .input-wrapper {
      position: relative;
      background: var(--color-surfaces);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      transition: border-color 0.2s;
      display: flex;
      align-items: center;
      min-height: 48px;
      
      &:focus-within {
        border-color: var(--color-link);
      }
    }
    
    .cos_input_placeholder {
      display: none;
      position: absolute;
      font-size: 11px;
      line-height: 14px;
      top: 4px;
      left: 16px;
      color: var(--color-text-muted);
      z-index: 2;
      pointer-events: none;
      font-family: 'Noto Sans', sans-serif;

      &.show {
        display: flex;
      }
    }

    cos-input input, cos-input textarea {
      width: 100%;
      padding: 16px;
      border: none !important;
      background: transparent !important;
      color: var(--color-text);
      font-family: 'Noto Sans', sans-serif !important;
      font-size: 14px;
      outline: none !important;
      box-shadow: none !important;
      height: 48px;
      box-sizing: border-box;
      
      &::placeholder {
        color: var(--color-text-muted);
        opacity: 0.7;
      }

      &.with_value {
        padding-top: 22px;
        padding-bottom: 10px;
      }
    }
    
    .has-error {
      .input-wrapper {
        border-color: var(--color-danger);
      }
    }
    
    .error-message {
      font-size: 12px;
      color: var(--color-danger);
      margin-top: 4px;
      display: flex;
      align-items: center;
      gap: 4px;

      svg { flex-shrink: 0; }
    }
  `],
  encapsulation: ViewEncapsulation.None
})
export class InputComponent implements AfterContentChecked {
  placeholder = input<string>('');
  hasError = input<boolean>(false);
  errorMessage = input<string>('');
  
  showPlaceholder = signal<boolean>(false);

  constructor(private el: ElementRef) {}

  ngAfterContentChecked() {
    const inputEl = this.el.nativeElement.querySelector('input, textarea');
    if (inputEl) {
      const hasValue = !!inputEl.value?.length;
      this.showPlaceholder.set(hasValue);
      
      if (hasValue) {
        inputEl.classList.add('with_value');
      } else {
        inputEl.classList.remove('with_value');
      }
    }
  }
}
