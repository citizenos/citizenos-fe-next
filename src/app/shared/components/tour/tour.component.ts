import { Component, ElementRef, inject, computed, ViewChild, Renderer2, HostListener, effect, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TourService } from '../../../core/services/tour.service';
import { UserStore } from '../../../core/state/user.store';
import { IconComponent } from '../icon/icon.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'cos-tour',
  standalone: true,
  imports: [TranslateModule, IconComponent],
  template: `
    @if (tourService.showTour()) {
      <div id="tour_container">
        <div #arrow class="tour_arrow"></div>
        <div #tourBox class="tour_box">
          <button class="tour_close" (click)="closeTour($event)">
             <cos-icon name="close" [size]="16"></cos-icon>
          </button>
          
          <div class="tour_content">
             <div #tourContent></div>
          </div>

          <div class="tour_footer">
            <div class="tour_pagination">
              @for (idx of itemIndexes(); track idx) {
                <div class="dot" [class.active]="idx === tourService.activeItem()"></div>
              }
            </div>
            <div class="tour_actions">
              @if (activeIndex() > 0) {
                <button class="btn_prev" (click)="prevItem($event)">{{ 'COMPONENTS.TOUR.BTN_PREVIOUS' | translate }}</button>
              }
              <button class="btn_next" (click)="nextItem($event)">
                {{ (activeIndex() === itemIndexes().length - 1 ? 'COMPONENTS.TOUR.BTN_FINISH' : 'COMPONENTS.TOUR.BTN_NEXT') | translate }}
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    #tour_container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 10001;
    }

    .tour_box {
      position: absolute;
      width: 320px;
      background: var(--color-background);
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      padding: 24px;
      pointer-events: auto;
      z-index: 10002;
    }

    .tour_close {
      position: absolute;
      top: 12px;
      right: 12px;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--color-text-muted);
    }

    .tour_content {
      margin-bottom: 24px;
      font-size: 14px;
      line-height: 1.6;
    }

    .tour_footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .tour_pagination {
      display: flex;
      gap: 6px;
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--color-border);
    }

    .dot.active {
      background: var(--color-primary);
    }

    .tour_actions {
      display: flex;
      gap: 12px;
    }

    .btn_prev, .btn_next {
      padding: 8px 16px;
      border-radius: 4px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      border: none;
    }

    .btn_prev {
      background: transparent;
      color: var(--color-primary);
    }

    .btn_next {
      background: var(--color-primary);
      color: white;
    }

    .tour_arrow {
      position: absolute;
      width: 0;
      height: 0;
      border: 8px solid transparent;
      z-index: 10003;
      pointer-events: none;
    }

    .tour_arrow.top_arrow { border-bottom-color: var(--color-background); }
    .tour_arrow.bottom_arrow { border-top-color: var(--color-background); }
    .tour_arrow.left_arrow { border-right-color: var(--color-background); }
    .tour_arrow.right_arrow { border-left-color: var(--color-background); }
  `]
})
export class TourComponent implements OnDestroy {
  @ViewChild('arrow') arrow!: ElementRef;
  @ViewChild('tourBox') tourBox!: ElementRef;
  @ViewChild('tourContent') contentEl!: ElementRef;

  public tourService = inject(TourService);
  public auth = inject(UserStore);
  private renderer = inject(Renderer2);

  itemIndexes = computed(() => {
    const tourId = this.tourService.activeTour();
    const items = this.tourService.items()[tourId];
    return items ? items.map(item => item.index).sort((a, b) => a - b) : [];
  });

  private templateSignal = toSignal(this.tourService.activeTemplate$);

  constructor() {
    effect(() => {
      const template = this.templateSignal();
      if (template && template.length > 0) {
        this.setContent(template);
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

  setContent(template: Node[]) {
    if (this.contentEl) {
      const el = this.contentEl.nativeElement;
      while (el.firstChild) el.removeChild(el.firstChild);
      if (Array.isArray(template)) {
        template.forEach(node => el.appendChild(node.cloneNode(true)));
      }
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

    if (!item || !this.tourBox || !this.arrow) return;

    // Find visible element
    const itemEl = item.elements.find(e => {
       const el = e.el.nativeElement;
       return el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0;
    }) || item.elements[0];

    if (!itemEl) return;

    const el = itemEl.el.nativeElement;
    const rect = el.getBoundingClientRect();
    const tourBox = this.tourBox.nativeElement;
    const arrow = this.arrow.nativeElement;
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
