import { ElementRef } from '@angular/core';
import { describe, it, expect } from 'vitest';
import { CosDisabledDirective } from './cos-disabled.directive';

describe('CosDisabledDirective', () => {
  it('should create an instance', () => {
    const elementRefMock = { nativeElement: document.createElement('div') } as ElementRef;
    const directive = new CosDisabledDirective(elementRefMock);
    expect(directive).toBeTruthy();
  });

  describe('CosDisabledDirective behavior', () => {
    it('should set ElementRef correctly', () => {
      const elementRefMock = { nativeElement: document.createElement('div') } as ElementRef;
      const directive = new CosDisabledDirective(elementRefMock);
      expect(directive['ElementRef']).toBe(elementRefMock);
    });

    it('should set disabled attribute on init if cosDisabled is true', () => {
      const element = document.createElement('button');
      const elementRefMock = { nativeElement: element } as ElementRef;
      const directive = new CosDisabledDirective(elementRefMock);
      directive.cosDisabled = true;
      directive.ngAfterViewInit();
      expect(element.getAttribute('disabled')).toBe('true');
    });

    it('should set disabled attribute on change to true', () => {
      const element = document.createElement('button');
      const elementRefMock = { nativeElement: element } as ElementRef;
      const directive = new CosDisabledDirective(elementRefMock);
      
      const changesMock = {
        cosDisabled: {
          currentValue: true,
          previousValue: false,
          firstChange: false,
          isFirstChange: () => false
        }
      };
      directive.ngOnChanges(changesMock as any);
      expect(element.getAttribute('disabled')).toBe('true');
    });

    it('should remove disabled attribute on change to false', () => {
      const element = document.createElement('button');
      element.setAttribute('disabled', 'true');
      const elementRefMock = { nativeElement: element } as ElementRef;
      const directive = new CosDisabledDirective(elementRefMock);
      
      const changesMock = {
        cosDisabled: {
          currentValue: false,
          previousValue: true,
          firstChange: false,
          isFirstChange: () => false
        }
      };
      directive.ngOnChanges(changesMock as any);
      expect(element.getAttribute('disabled')).toBeNull();
    });
  });
});
