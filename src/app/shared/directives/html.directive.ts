import { Directive, ElementRef, inject, AfterViewInit } from '@angular/core';

@Directive({
  selector: '[cosHtmlwrap]',
  standalone: true,
})
export class HtmlDirective implements AfterViewInit {
  private wrapper = inject(ElementRef);

  ngAfterViewInit() {
    if (this.wrapper) {
      const links = this.wrapper.nativeElement.querySelectorAll('a');
      links.forEach((link: HTMLAnchorElement) => {
        link.addEventListener('click', this.linkClickHandler.bind(this));
      });
    }
  }

  linkClickHandler(e: MouseEvent) {
    const element = e.target as HTMLLinkElement;
    if (element.href) {
      window.open(element.href, '_blank');
    }
  }
}
