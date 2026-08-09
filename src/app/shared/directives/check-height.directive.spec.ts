import { ElementRef } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';
import { CheckHeightDirective } from './check-height.directive';

import { TestBed } from '@angular/core/testing';

describe('CheckHeightDirective', () => {
  let elementRef: ElementRef;

  beforeEach(() => {
    elementRef = new ElementRef({ offsetHeight: 0 });
    TestBed.configureTestingModule({
      providers: [{ provide: ElementRef, useValue: elementRef }]
    });
  });

  it('should create an instance', () => {
    const directive = TestBed.runInInjectionContext(() => new CheckHeightDirective());
    expect(directive).toBeTruthy();
  });

  describe('CheckHeightDirective behavior', () => {
    let directive: CheckHeightDirective;

    beforeEach(() => {
      directive = TestBed.runInInjectionContext(() => new CheckHeightDirective());
    });

    it('should set overHeight to true if offsetHeight is greater than maxTextHeight', () => {
      elementRef.nativeElement.offsetHeight = 300;
      directive.ngAfterContentInit();
      expect(directive.overHeight).toBe(true);
    });

    it('should set overHeight to false if offsetHeight is less than or equal to maxTextHeight', () => {
      elementRef.nativeElement.offsetHeight = 100;
      directive.ngAfterContentInit();
      expect(directive.overHeight).toBe(false);
    });
  });
});
