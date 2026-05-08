import { Component, Input, Output, EventEmitter, input } from '@angular/core';

@Component({
  selector: 'cos-button',
  standalone: true,
  template: '<ng-content></ng-content>'
})
export class MockButtonComponent {
  @Input() variant = 'primary';
  @Input() size = 'md';
  @Input() isLoading = false;
  @Input() isDisabled = false;
  @Input() icon?: string;
  @Input() type = 'button';
}

@Component({
  selector: 'cos-input',
  standalone: true,
  template: '<ng-content></ng-content>'
})
export class MockInputComponent {
  @Input() placeholder = '';
  @Input() hasError = false;
}

@Component({
  selector: 'cos-icon',
  standalone: true,
  template: '<i></i>'
})
export class MockIconComponent {
  name = input<string>();
  size = input<string | number>(24);
}
