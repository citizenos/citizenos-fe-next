import { Directive, ElementRef, HostBinding, AfterContentInit, inject } from '@angular/core';

@Directive({
  selector: '[cosCheckHeight]',
  standalone: true,
})
export class CheckHeightDirective implements AfterContentInit {
  private elem = inject(ElementRef);

  offsetHeight!: number;
  @HostBinding('class.overheight') overHeight = false;

  readMore = false;
  maxTextHeight = 200;

  ngAfterContentInit(): void {
    this.offsetHeight = this.elem.nativeElement.offsetHeight;
    if (this.offsetHeight > this.maxTextHeight) {
      this.overHeight = true;
    }
  }
}
