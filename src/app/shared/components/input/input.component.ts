import { Component, ElementRef, AfterContentChecked, signal, ViewEncapsulation, inject, model, ChangeDetectionStrategy } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'cos-input',
  standalone: true,
  imports: [IconComponent, TranslateModule],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
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
