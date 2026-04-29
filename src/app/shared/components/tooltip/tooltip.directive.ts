import {
  Directive,
  ElementRef,
  HostListener,
  Renderer2,
  input,
  OnDestroy,
  inject,
} from '@angular/core';

/**
 * Usage: <span cosTooltip="Tooltip text">hover me</span>
 * Or with position: <span cosTooltip="text" tooltipPos="top">hover me</span>
 */
@Directive({
  selector: '[cosTooltip]',
  standalone: true,
})
export class TooltipDirective implements OnDestroy {
  cosTooltip = input<string>();
  tooltipPos = input<'top' | 'bottom'>('bottom');

  private el = inject(ElementRef);
  private renderer = inject(Renderer2);
  private tooltipEl: HTMLElement | null = null;

  @HostListener('mouseenter') show() {
    if (!this.cosTooltip()) return;
    this.create();
    this.position();
  }

  @HostListener('mouseleave') hide() {
    this.destroy();
  }

  ngOnDestroy() {
    this.destroy();
  }

  private create() {
    this.tooltipEl = this.renderer.createElement('div');
    this.renderer.addClass(this.tooltipEl, 'cos-tooltip-box');
    this.renderer.setProperty(this.tooltipEl, 'textContent', this.cosTooltip());
    this.renderer.appendChild(document.body, this.tooltipEl);
  }

  private position() {
    if (!this.tooltipEl) return;
    const hostRect = this.el.nativeElement.getBoundingClientRect();
    const tipRect = this.tooltipEl.getBoundingClientRect();
    const scroll = window.scrollY;

    let top: number;
    if (this.tooltipPos() === 'top') {
      top = hostRect.top + scroll - tipRect.height - 8;
    } else {
      top = hostRect.bottom + scroll + 8;
    }

    let left = hostRect.left + hostRect.width / 2 - tipRect.width / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - tipRect.width - 8));

    this.renderer.setStyle(this.tooltipEl, 'top', `${top}px`);
    this.renderer.setStyle(this.tooltipEl, 'left', `${left}px`);
  }

  private destroy() {
    if (this.tooltipEl) {
      this.renderer.removeChild(document.body, this.tooltipEl);
      this.tooltipEl = null;
    }
  }
}
