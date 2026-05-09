import { Directive, Component, ElementRef, Input, ViewChild, OnInit, AfterViewInit, inject } from '@angular/core';
import { TourService } from '../../core/services/tour.service';

@Component({
  selector: 'cos-tour-item-template',
  standalone: true,
  template: '<div #template style="display: none"><ng-content></ng-content></div>'
})
export class TourItemTemplateComponent implements AfterViewInit {
  @Input({ required: true }) data!: { tourid: string; index: number };
  @ViewChild('template') template?: ElementRef;

  private tourService = inject(TourService);

  ngAfterViewInit() {
    if (this.template) {
      const templateContent = Array.from(this.template.nativeElement.children);
      this.tourService.addTemplate(this.data.tourid, this.data.index, templateContent);
    }
  }
}

@Directive({
  selector: '[cosTourItem]',
  standalone: true
})
export class TourItemDirective implements OnInit {
  @Input('cosTourItem') data!: { tourid: string | string[]; index: number | number[]; position: string | string[] };

  private el = inject(ElementRef);
  private tourService = inject(TourService);

  ngOnInit(): void {
    const ids = Array.isArray(this.data.tourid) ? this.data.tourid : [this.data.tourid];

    ids.forEach((id, index) => {
      const itemIndex = this.getValue(this.data.index, index);
      const itemPosition = this.getValue(this.data.position, index);
      this.tourService.register(id, itemIndex as number, this.el, itemPosition as string);
    });
  }

  private getValue(item: string | number | string[] | number[], index: number) {
    if (Array.isArray(item)) {
      return item[index] !== undefined ? item[index] : item[0];
    }
    return item;
  }
}
