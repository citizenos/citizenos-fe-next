import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Component, ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TourItemDirective, TourItemTemplateComponent } from './tour-item.directive';
import { TourService } from '../../core/services/tour.service';

// ── TourItemDirective ──────────────────────────────────────────────────────

@Component({
  standalone: true,
  imports: [TourItemDirective],
  template: `<div id="anchor" [cosTourItem]="data"></div>`
})
class TourItemHostComponent {
  data: { tourid: string | string[]; index: number | number[]; position: string | string[] } = {
    tourid: 'tour-a',
    index: 0,
    position: 'bottom',
  };
}

describe('TourItemDirective', () => {
  let fixture: ComponentFixture<TourItemHostComponent>;
  let tourService: TourService;
  let registerSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TourItemHostComponent],
    }).compileComponents();

    tourService = TestBed.inject(TourService);
    registerSpy = vi.spyOn(tourService, 'register');

    fixture = TestBed.createComponent(TourItemHostComponent);
    fixture.detectChanges();
  });

  it('should create host component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should call tourService.register() on init with correct args', () => {
    expect(registerSpy).toHaveBeenCalledWith(
      'tour-a',
      0,
      expect.any(ElementRef),
      'bottom'
    );
  });

  it('should register once per single tourid', () => {
    expect(registerSpy).toHaveBeenCalledTimes(1);
  });

  it('should register for each id when tourid is an array', async () => {
    registerSpy.mockClear();
    fixture.componentInstance.data = {
      tourid: ['tour-a', 'tour-b'],
      index: [0, 1],
      position: ['bottom', 'top'],
    };
    fixture.detectChanges();
    // Re-create so ngOnInit fires with new data
    const fixture2 = TestBed.createComponent(TourItemHostComponent);
    fixture2.componentInstance.data = {
      tourid: ['tour-a', 'tour-b'],
      index: [0, 1],
      position: ['bottom', 'top'],
    };
    fixture2.detectChanges();
    expect(registerSpy).toHaveBeenCalledWith('tour-a', 0, expect.any(ElementRef), 'bottom');
    expect(registerSpy).toHaveBeenCalledWith('tour-b', 1, expect.any(ElementRef), 'top');
  });
});

// ── TourItemTemplateComponent ──────────────────────────────────────────────

@Component({
  standalone: true,
  imports: [TourItemTemplateComponent],
  template: `
    <cos-tour-item-template [data]="{ tourid: 'tour-a', index: 0 }">
      <span>Step content</span>
    </cos-tour-item-template>
  `
})
class TourItemTemplateHostComponent {}

describe('TourItemTemplateComponent', () => {
  let fixture: ComponentFixture<TourItemTemplateHostComponent>;
  let tourService: TourService;
  let addTemplateSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TourItemTemplateHostComponent],
    }).compileComponents();

    tourService = TestBed.inject(TourService);
    addTemplateSpy = vi.spyOn(tourService, 'addTemplate');

    fixture = TestBed.createComponent(TourItemTemplateHostComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should call tourService.addTemplate() after view init', () => {
    expect(addTemplateSpy).toHaveBeenCalledWith('tour-a', 0, expect.any(Array));
  });
});
