import { Directive, ElementRef, inject, AfterViewInit } from '@angular/core';

@Directive({
  selector: '[download]',
  standalone: true,
})
export class DownloadDirective implements AfterViewInit {
  private el = inject(ElementRef);

  ngAfterViewInit() {
    this.el.nativeElement.addEventListener('click', this.linkClickHandler.bind(this));
  }

  linkClickHandler(e: MouseEvent) {
    const element = e.target as HTMLLinkElement;
    if (element.href) {
      window.open(element.href, '_blank');
    }
  }
}
