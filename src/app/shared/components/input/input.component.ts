import { Component, ContentChild, ElementRef, AfterContentChecked, input, signal, ViewEncapsulation, inject } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'cos-input',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="input-container" [class.has-error]="hasError()">
      <div class="input-wrapper">
        <div class="cos_input_placeholder" [class.show]="showPlaceholder()" [innerHTML]="placeholder()"></div>
        <ng-content></ng-content>
      </div>
      @if (hasError() && errorMessage()) {
        <span class="error-message" role="alert">
          <cos-icon name="warning" [size]="14"></cos-icon>
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
      font-size: 12px;
      line-height: 16px;
      top: 4px;
      left: 16px;
      color: #727C84;
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

      cos-icon { flex-shrink: 0; }
    }
  `],
  encapsulation: ViewEncapsulation.None
})
export class InputComponent implements AfterContentChecked {
  placeholder = input<string>('');
  hasError = input<boolean>(false);
  errorMessage = input<string>('');
  
  showPlaceholder = signal<boolean>(false);
  private el = inject(ElementRef);

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
