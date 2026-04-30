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
  private rafId: number | null = null;

  @HostListener('mouseenter') show() {
    if (!this.cosTooltip()) return;
    this.create();
    // Defer reading layout until the browser has painted the tooltip element,
    // otherwise getBoundingClientRect() returns zero dimensions.
    this.rafId = requestAnimationFrame(() => this.position());
  }

  @HostListener('mouseleave') hide() {
    this.destroy();
  }

  ngOnDestroy() {
    this.destroy();
  }

  private create() {
    this.destroy(); // clean up any stale tooltip
    this.tooltipEl = this.renderer.createElement('div');
    this.renderer.addClass(this.tooltipEl, 'cos-tooltip-box');
    this.renderer.setProperty(this.tooltipEl, 'textContent', this.cosTooltip());
    this.renderer.appendChild(document.body, this.tooltipEl);
  }

  private position() {
    if (!this.tooltipEl) return;
    const hostRect = this.el.nativeElement.getBoundingClientRect();
    const tipRect = this.tooltipEl.getBoundingClientRect();

    // Use fixed positioning — no window.scrollY offset needed
    let top: number;
    if (this.tooltipPos() === 'top') {
      top = hostRect.top - tipRect.height - 10;
    } else {
      top = hostRect.bottom + 10;
    }

    // Center horizontally, clamped within viewport
    let left = hostRect.left + hostRect.width / 2 - tipRect.width / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - tipRect.width - 8));

    this.renderer.setStyle(this.tooltipEl, 'top', `${top}px`);
    this.renderer.setStyle(this.tooltipEl, 'left', `${left}px`);
    // Trigger fade-in now that position is correct
    this.renderer.addClass(this.tooltipEl, 'cos-tooltip-box--visible');
  }

  private destroy() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.tooltipEl) {
      this.renderer.removeChild(document.body, this.tooltipEl);
      this.tooltipEl = null;
    }
  }
}
