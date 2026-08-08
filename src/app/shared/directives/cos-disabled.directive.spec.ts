import { ElementRef, SimpleChanges } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';
import { CosDisabledDirective } from './cos-disabled.directive';
import { TestBed } from '@angular/core/testing';

describe('CosDisabledDirective', () => {
  let elementRefMock: ElementRef;

  beforeEach(() => {
    elementRefMock = { nativeElement: document.createElement('div') } as ElementRef;
    TestBed.configureTestingModule({
      providers: [
        { provide: ElementRef, useValue: elementRefMock }
      ]
    });
  });

  it('should create an instance', () => {
    TestBed.runInInjectionContext(() => {
      const directive = new CosDisabledDirective();
      expect(directive).toBeTruthy();
    });
  });

  describe('CosDisabledDirective behavior', () => {
    it('should set disabled attribute on init if cosDisabled is true', () => {
      const element = document.createElement('button');
      const elRef = { nativeElement: element } as ElementRef;
      
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [{ provide: ElementRef, useValue: elRef }]
      });

      TestBed.runInInjectionContext(() => {
        const directive = new CosDisabledDirective();
        directive.cosDisabled = true;
        directive.ngAfterViewInit();
        expect(element.getAttribute('disabled')).toBe('true');
      });
    });

    it('should set disabled attribute on change to true', () => {
      const element = document.createElement('button');
      const elRef = { nativeElement: element } as ElementRef;

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [{ provide: ElementRef, useValue: elRef }]
      });

      TestBed.runInInjectionContext(() => {
        const directive = new CosDisabledDirective();
        const changesMock = {
          cosDisabled: {
            currentValue: true,
            previousValue: false,
            firstChange: false,
            isFirstChange: () => false
          }
        };
        directive.ngOnChanges(changesMock as unknown as SimpleChanges);
        expect(element.getAttribute('disabled')).toBe('true');
      });
    });

    it('should remove disabled attribute on change to false', () => {
      const element = document.createElement('button');
      element.setAttribute('disabled', 'true');
      const elRef = { nativeElement: element } as ElementRef;

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [{ provide: ElementRef, useValue: elRef }]
      });

      TestBed.runInInjectionContext(() => {
        const directive = new CosDisabledDirective();
        const changesMock = {
          cosDisabled: {
            currentValue: false,
            previousValue: true,
            firstChange: false,
            isFirstChange: () => false
          }
        };
        directive.ngOnChanges(changesMock as unknown as SimpleChanges);
        expect(element.getAttribute('disabled')).toBeNull();
      });
    });
  });
});
