import { Component, ElementRef, AfterContentChecked, signal, ViewEncapsulation, inject, model, ChangeDetectionStrategy } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'cos-input',
  standalone: true,
  imports: [IconComponent, TranslateModule],
  template: `
    <div class="input-container" [class.has-error]="hasError()">
      @if (label()) {
        <label [for]="inputId" class="input-label">{{ label() }}</label>
      }
      <div class="input-wrapper">
        <label class="cos_input_placeholder" [for]="inputId" [class.show]="showPlaceholder()" [innerHTML]="placeholder() || label()"></label>
        @if (!label() && !placeholder()) {
           <label [for]="inputId" class="sr-only">{{ 'COMPONENTS.ACCESSIBILITY.INPUT_FALLBACK_LABEL' | translate }}</label>
        }
        <ng-content></ng-content>
      </div>
      @if (limit()) {
        <div class="limit">{{ limit() }}</div>
      }
      @if (hasError() && errorMessage()) {
        <span [id]="errorId" class="error-message" role="alert">
          <cos-icon name="warning" [size]="14" [attr.aria-label]="'COMPONENTS.ACCESSIBILITY.WARNING' | translate"></cos-icon>
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
      position: relative;
    }

    .input-label {
      font-size: 14px;
      font-weight: 600;
      color: var(--color-text);
      margin-bottom: 8px;
    }

    .input-wrapper {
      position: relative;
      background: var(--color-surfaces);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
      display: flex;
      align-items: center;
      min-height: 48px;

      &:focus-within {
        border-color: var(--color-border-active);
        box-shadow: 0 0 0 3px var(--color-focus-ring);
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
      cursor: text;

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
    
    .limit {
        position: absolute;
        top: 0;
        right: 0;
        font-size: 12px;
        color: var(--color-text-muted);
    }
  `],
  encapsulation: ViewEncapsulation.None
})
export class InputComponent implements AfterContentChecked {
  private static idCounter = 0;

  label = model<string>('');
  placeholder = model<string>('');
  hasError = model<boolean>(false);
  errorMessage = model<string>('');
  limit = model<string>('');

  inputId = `cos-input-${InputComponent.idCounter++}`;
  errorId = `${this.inputId}-error`;

  showPlaceholder = signal<boolean>(false);
  private el = inject(ElementRef);

  ngAfterContentChecked() {
    const inputEl = this.el.nativeElement.querySelector('input, textarea');
    if (inputEl) {
      if (!inputEl.id) {
        inputEl.id = this.inputId;
      }

      inputEl.setAttribute('aria-invalid', this.hasError().toString());

      if (this.placeholder() && !inputEl.hasAttribute('aria-label')) {
        inputEl.setAttribute('aria-label', this.placeholder());
      }

      if (this.hasError() && this.errorMessage()) {
        inputEl.setAttribute('aria-describedby', this.errorId);
      } else {
        inputEl.removeAttribute('aria-describedby');
      }

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
