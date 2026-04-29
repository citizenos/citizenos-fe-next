import { Component, Input, Output, EventEmitter, input } from '@angular/core';

@Component({
  selector: 'cos-button',
  standalone: true,
  template: '<ng-content></ng-content>'
})
export class MockButtonComponent {
  @Input() variant: string = 'primary';
  @Input() size: string = 'md';
  @Input() isLoading: boolean = false;
  @Input() isDisabled: boolean = false;
  @Input() icon?: string;
  @Input() type: string = 'button';
}

@Component({
  selector: 'cos-input',
  standalone: true,
  template: '<ng-content></ng-content>'
})
export class MockInputComponent {
  @Input() placeholder: string = '';
  @Input() hasError: boolean = false;
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
