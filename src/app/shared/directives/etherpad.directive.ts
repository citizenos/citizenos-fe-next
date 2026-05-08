import { Directive, ElementRef, HostListener, Input, inject } from '@angular/core';

@Directive({
  selector: '[cosEtherpad]',
  standalone: true
})
export class EtherpadDirective {
  private element = inject(ElementRef);
  
  width = '';
  height = '';
  minWidth = 0;
  minHeight = 0;
  
  @Input('cosEtherpad') params: any;

  constructor() {
    const el = this.element.nativeElement;
    this.width = el.width;
    this.height = el.height;
    
    if (this.width && this.valueNotPercent(this.width)) {
      this.minWidth = parseFloat(this.width);
    }

    if (this.height && this.valueNotPercent(this.height)) {
      this.minHeight = parseFloat(this.height);
    }
  }



  private valueNotPercent(value: any) {
    return (value + '').indexOf('%') < 0;
  }

  private debounce(func: Function, timeout = 300) {
    let timer: any;
    return (...args: any) => {
      clearTimeout(timer);
      timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
  }

  @HostListener('window:message', ['$event'])
  receiveMessageHandler(e: MessageEvent) {
    if (e && e.data) {
      const msg = e.data;
      if (msg.name === 'ep_resize') {
        const width = Math.round(msg.data.width);
        const height = Math.round(msg.data.height);
        
        if (Number.isSafeInteger(width) && width > this.minWidth) {
          const newWidth = width + 'px';
          if (newWidth !== this.element.nativeElement.width) {
            this.element.nativeElement.width = newWidth;
          }
        }

        if (Number.isSafeInteger(height) && height > this.minHeight) {
          const newHeight = height + 'px';
          if (newHeight !== this.element.nativeElement.height) {
            this.element.nativeElement.height = newHeight;
          }
        }
      }
    }
  }

  @HostListener('window:scroll')
  sendScrollMessage = this.debounce(() => {
    const targetWindow = this.element.nativeElement.contentWindow;
    if (!targetWindow) return;

    let yOffsetExtra = 0;
    const mobileHeader = window.document.getElementById('mobile_header');
    if (mobileHeader) {
      yOffsetExtra = parseFloat(window.getComputedStyle(mobileHeader).height);
    }

    const data = {
      scroll: {
        top: window.pageYOffset + yOffsetExtra,
        left: window.pageXOffset
      },
      frameOffset: this.getFrameOffset()
    };

    targetWindow.postMessage({
      name: 'ep_embed_floating_toolbar_scroll',
      data: data
    }, '*');
  }, 100);

  private getFrameOffset() {
    const elem = this.element.nativeElement;

    if (!elem.getClientRects().length) {
      return { top: 0, left: 0 };
    }

    const rect = elem.getBoundingClientRect();
    const doc = elem.ownerDocument;
    const docElem = doc.documentElement;
    const win = doc.defaultView;

    if (!win) return { top: rect.top, left: rect.left };

    return {
      top: rect.top + win.pageYOffset - docElem.clientTop,
      left: rect.left + win.pageXOffset - docElem.clientLeft
    };
  }
}
