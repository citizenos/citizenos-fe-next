import { Component, input, model, output, computed, ChangeDetectionStrategy } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'cos-toggle',
  standalone: true,
  imports: [],
  templateUrl: './toggle.component.html',
  styleUrls: ['./toggle.component.scss']
})
export class ToggleComponent {
  /**
   * modelValue supports 2-way binding via [(model)].
   * Uses 'any' to ensure compatibility with various types (boolean, string, etc.) 
   * in Angular templates without requiring explicit casting.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  modelValue = model<any>(false, { alias: 'model' });

  /**
   * The value that represents the 'ON' state.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value = input<any>();

  /**
   * The value that represents the 'OFF' state (only used if 'value' is set).
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  offValue = input<any>();

  /**
   * Text to display when the toggle is 'ON'.
   */
  // eslint-disable-next-line @angular-eslint/no-input-rename
  cosToggleTextOn = input<string>('', { alias: 'textOn' });

  /**
   * Text to display when the toggle is 'OFF'.
   */
  // eslint-disable-next-line @angular-eslint/no-input-rename
  cosToggleTextOff = input<string>('', { alias: 'textOff' });

  disabled = input<boolean>(false);

  /**
   * Emits the new value after a toggle operation.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toggleClick = output<any>();

  /**
   * Computes if the toggle is currently in the 'ON' state.
   */
  isEnabled = computed(() => {
    const m = this.modelValue();
    const v = this.value();

    if (v !== undefined) {
      return m === v;
    }
    return !!m;
  });

  /**
   * Performs the toggle action based on current state and input values.
   */
  toggle() {
    if (this.disabled()) return;
    const v = this.value();
    const offV = this.offValue();
    let nextValue: any;

    if (v !== undefined) {
      if (this.modelValue() === v && offV !== undefined) {
        nextValue = offV;
      } else {
        nextValue = v;
      }
    } else {
      nextValue = !this.modelValue();
    }

    this.modelValue.set(nextValue);
    this.toggleClick.emit(nextValue);
  }
}
