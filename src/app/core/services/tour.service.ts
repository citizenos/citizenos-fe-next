import { ElementRef, Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { combineLatest, Observable, of, switchMap } from 'rxjs';

export interface TourItem {
  index: number;
  elements: { el: ElementRef<HTMLElement>; position: string }[];
  position: string;
}

@Injectable({
  providedIn: 'root'
})
export class TourService {
  items = signal<Record<string, TourItem[]>>({});
  showTour = signal(false);
  activeTour = signal('');
  activeItem = signal(0);

  private overlay = document.createElement('div');
  templates = signal<Record<string, { index: number; template: Node[] }[]>>({});

  constructor() {
    this.overlay.classList.add('tour_overlay');
  }

  register(id: string, index: number, element: ElementRef<HTMLElement>, position: string) {
    this.items.update(prev => {
      const updated = { ...prev };
      if (!updated[id]) {
        updated[id] = [{ index, elements: [{ el: element, position }], position }];
        return updated;
      }

      const tourItems = [...updated[id]];
      const itemIndex = tourItems.findIndex(item => item.index === index);

      if (itemIndex === -1) {
        tourItems.push({ index, elements: [{ el: element, position }], position });
      } else {
        const item = { ...tourItems[itemIndex] };
        const elements = [...item.elements];
        const elIdx = elements.findIndex(e => e.el.nativeElement.id === element.nativeElement.id);

        if (elIdx !== -1) {
          elements[elIdx] = { el: element, position };
        } else {
          elements.push({ el: element, position });
        }
        item.elements = elements;
        tourItems[itemIndex] = item;
      }
      updated[id] = tourItems;
      return updated;
    });
  }

  addTemplate(id: string, index: number, template: Node[]) {
    this.templates.update(prev => {
      const updated = { ...prev };
      const templateData = Array.isArray(template) ? [...template] : [template];

      if (!updated[id]) {
        updated[id] = [{ index, template: templateData }];
        return updated;
      }

      const tourTemplates = [...updated[id]];
      const existingIdx = tourTemplates.findIndex(t => t.index === index);
      if (existingIdx === -1) {
        tourTemplates.push({ index, template: templateData });
      }
      updated[id] = tourTemplates;
      return updated;
    });
  }

  get activeTemplate$(): Observable<Node[]> {
    return combineLatest([
      toObservable(this.activeTour),
      toObservable(this.activeItem)
    ]).pipe(
      switchMap(([tourId, itemId]) => {
        const templates = this.templates()[tourId];
        if (templates) {
          const templateItem = templates.find(t => t.index === itemId);
          if (templateItem) {
            this.updateTourItemClasses(tourId, itemId);
            return of(templateItem.template);
          }
        }
        return of([] as Node[]);
      })
    );
  }

  private updateTourItemClasses(tourId: string, itemId: number) {
    const tourItems = this.items()[tourId];
    if (tourItems) {
      tourItems.forEach(item => {
        item.elements.forEach(element => {
          element.el.nativeElement.classList.remove('tour_item');
          if (item.index === itemId) {
            element.el.nativeElement.classList.add('tour_item');
          }
        });
      });
    }
  }

  show(id: string, index: number) {
    const existingOverlay = document.body.querySelector('.tour_overlay');
    if (!existingOverlay) {
      document.body.appendChild(this.overlay);
    }
    this.activeTour.set(id);
    this.activeItem.set(index);
    this.showTour.set(true);
  }

  hide() {
    document.querySelectorAll('.tour_overlay').forEach(overlay => overlay.remove());
    document.querySelectorAll('.tour_item').forEach(item => item.classList.remove('tour_item'));
    this.showTour.set(false);
    this.activeTour.set('');
    this.activeItem.set(0);
  }

  next() {
    const tourId = this.activeTour();
    const index = this.activeItem();
    const tourItems = this.items()[tourId];

    if (tourItems) {
      const itemIndexes = tourItems.map(item => item.index).sort((a, b) => a - b);
      const curIdxInSorted = itemIndexes.indexOf(index);
      if (curIdxInSorted !== -1 && curIdxInSorted < itemIndexes.length - 1) {
        this.activeItem.set(itemIndexes[curIdxInSorted + 1]);
      } else {
        this.hide();
      }
    }
  }

  previous() {
    const tourId = this.activeTour();
    const index = this.activeItem();
    const tourItems = this.items()[tourId];

    if (tourItems) {
      const itemIndexes = tourItems.map(item => item.index).sort((a, b) => a - b);
      const curIdxInSorted = itemIndexes.indexOf(index);
      if (curIdxInSorted > 0) {
        this.activeItem.set(itemIndexes[curIdxInSorted - 1]);
      }
    }
  }
}
