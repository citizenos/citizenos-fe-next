import { Component, ElementRef, inject, computed, ViewChild, viewChild, Renderer2, HostListener, effect, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { UpperCasePipe } from '@angular/common';
import { TourService } from '../../../core/services/tour.service';
import { UserStore } from '../../../core/state/user.store';
import { TourItemTemplateComponent } from '../../directives/tour-item.directive';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'cos-tour',
  standalone: true,
  imports: [TranslateModule, TourItemTemplateComponent, UpperCasePipe],
  templateUrl: './tour.component.html',
  styleUrl: './tour.component.scss'
})
export class TourComponent implements OnDestroy {
  arrow = viewChild<ElementRef>('arrow');
  tourBox = viewChild<ElementRef>('tourBox');
  contentEl = viewChild<ElementRef>('tourContent');

  public tourService = inject(TourService);
  public auth = inject(UserStore);
  private renderer = inject(Renderer2);

  itemIndexes = computed(() => {
    const tourId = this.tourService.activeTour();
    const items = this.tourService.items()[tourId];
    return items ? items.map(item => item.index).sort((a, b) => a - b) : [];
  });

  public templateSignal = toSignal(this.tourService.activeTemplate$);

  public showItem = computed(() => {
    const template = this.templateSignal();
    return !!(template && template.length > 0);
  });

  constructor() {
    effect(() => {
      const template = this.templateSignal();
      const contentEl = this.contentEl();
      if (template && template.length > 0 && contentEl) {
        this.setContent(template, contentEl);
        // Small delay to ensure DOM is updated before positioning
        setTimeout(() => this.setPosition(), 0);
      }
    });
  }

  @HostListener('window:keydown.escape')
  onEscape() {
    this.tourService.hide();
  }

  @HostListener('window:resize')
  onResize() {
    if (this.tourService.showTour()) {
       this.setPosition();
    }
  }

  ngOnDestroy() {
     this.tourService.hide();
  }

  setContent(template: Node[], contentEl: ElementRef) {
    const el = contentEl.nativeElement;
    if (Array.isArray(template)) {
      el.replaceChildren(...template);
    }
  }

  activeIndex() {
    return this.itemIndexes().indexOf(this.tourService.activeItem());
  }

  nextItem(event: Event) {
    event.stopPropagation();
    this.tourService.next();
  }

  prevItem(event: Event) {
    event.stopPropagation();
    this.tourService.previous();
  }

  closeTour(event: Event) {
    event.stopPropagation();
    this.tourService.hide();
  }

  setPosition() {
    const tourId = this.tourService.activeTour();
    const itemId = this.tourService.activeItem();
    const items = this.tourService.items()[tourId];
    const item = items?.find(i => i.index === itemId);

    const tourBoxEl = this.tourBox();
    const arrowEl = this.arrow();

    if (!item || !tourBoxEl || !arrowEl) return;

    // Find visible element
    const itemEl = item.elements.find(e => {
       const el = e.el.nativeElement;
       return el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0;
    }) || item.elements[0];

    if (!itemEl) return;

    const el = itemEl.el.nativeElement;
    const rect = el.getBoundingClientRect();
    const tourBox = tourBoxEl.nativeElement;
    const arrow = arrowEl.nativeElement;
    const tourRect = tourBox.getBoundingClientRect();

    let top = 0;
    let left = 0;
    let arrowTop = 0;
    let arrowLeft = 0;

    // Reset arrow classes
    this.renderer.removeClass(arrow, 'top_arrow');
    this.renderer.removeClass(arrow, 'bottom_arrow');
    this.renderer.removeClass(arrow, 'left_arrow');
    this.renderer.removeClass(arrow, 'right_arrow');

    switch (itemEl.position) {
      case 'top':
        top = rect.top - tourRect.height - 12;
        left = rect.left + rect.width / 2 - tourRect.width / 2;
        arrowTop = rect.top - 12;
        arrowLeft = rect.left + rect.width / 2 - 8;
        this.renderer.addClass(arrow, 'bottom_arrow');
        break;
      case 'bottom':
        top = rect.bottom + 12;
        left = rect.left + rect.width / 2 - tourRect.width / 2;
        arrowTop = rect.bottom - 4;
        arrowLeft = rect.left + rect.width / 2 - 8;
        this.renderer.addClass(arrow, 'top_arrow');
        break;
      case 'left':
        top = rect.top + rect.height / 2 - tourRect.height / 2;
        left = rect.left - tourRect.width - 12;
        arrowTop = rect.top + rect.height / 2 - 8;
        arrowLeft = rect.left - 12;
        this.renderer.addClass(arrow, 'right_arrow');
        break;
      case 'right':
        top = rect.top + rect.height / 2 - tourRect.height / 2;
        left = rect.right + 12;
        arrowTop = rect.top + rect.height / 2 - 8;
        arrowLeft = rect.right - 4;
        this.renderer.addClass(arrow, 'left_arrow');
        break;
    }

    // Keep in viewport
    if (left < 10) left = 10;
    if (left + tourRect.width > window.innerWidth - 10) left = window.innerWidth - tourRect.width - 10;
    if (top < 10) top = 10;

    this.renderer.setStyle(tourBox, 'top', `${top + window.scrollY}px`);
    this.renderer.setStyle(tourBox, 'left', `${left + window.scrollX}px`);
    this.renderer.setStyle(arrow, 'top', `${arrowTop + window.scrollY}px`);
    this.renderer.setStyle(arrow, 'left', `${arrowLeft + window.scrollX}px`);

    el.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' });
  }
}
