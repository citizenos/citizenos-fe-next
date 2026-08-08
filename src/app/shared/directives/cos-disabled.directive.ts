import {
  Directive,
  Input,
  ElementRef,
  SimpleChanges,
  OnChanges,
  AfterViewInit,
  inject,
} from '@angular/core';

@Directive({
  selector: '[cosDisabled]',
  standalone: true,
})
export class CosDisabledDirective implements AfterViewInit, OnChanges {
  private readonly ElementRef = inject(ElementRef);

  @Input() cosDisabled!: boolean | string | unknown;

  ngAfterViewInit(): void {
    if (this.cosDisabled) {
      this.ElementRef.nativeElement.setAttribute('disabled', 'true');
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['cosDisabled']) {
      if (changes['cosDisabled'].currentValue === true) {
        this.ElementRef.nativeElement.setAttribute('disabled', 'true');
      } else {
        this.ElementRef.nativeElement.removeAttribute('disabled');
      }
    }
  }
}
