import { Directive, ElementRef, HostBinding, AfterContentInit } from '@angular/core';

@Directive({
  selector: '[check-height]',
  standalone: true
})
export class CheckHeightDirective implements AfterContentInit {
  offsetHeight!: any;
  @HostBinding('class.overheight') overHeight = false;

  readMore = false;
  maxTextHeight = 200;

  constructor(private elem: ElementRef) {}

  ngAfterContentInit(): void {
    this.offsetHeight = this.elem.nativeElement.offsetHeight;
    if (this.offsetHeight > this.maxTextHeight) {
      this.overHeight = true;
    }
  }
}
