import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IconComponent } from './icon.component';
import { IconRegistryService } from './icon.registry';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('IconComponent', () => {
  let component: IconComponent;
  let fixture: ComponentFixture<IconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconComponent],
      providers: [IconRegistryService]
    }).compileComponents();

    fixture = TestBed.createComponent(IconComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render SVG content from registry', () => {
    fixture.componentRef.setInput('name', 'smart-id');
    fixture.detectChanges();
    
    const svgElement = fixture.nativeElement.querySelector('svg');
    expect(svgElement.innerHTML).toContain('<path');
    expect(svgElement.getAttribute('viewBox')).toBe('0 0 48 48');
  });

  it('should set numeric width and height attributes', () => {
    fixture.componentRef.setInput('name', 'smart-id');
    fixture.componentRef.setInput('size', 32);
    fixture.detectChanges();
    
    const svgElement = fixture.nativeElement.querySelector('svg');
    expect(svgElement.getAttribute('width')).toBe('32');
    expect(svgElement.getAttribute('height')).toBe('32');
  });

  it('should remove width and height attributes when size is "auto" or other string', () => {
    fixture.componentRef.setInput('name', 'smart-id');
    fixture.componentRef.setInput('size', 'auto');
    fixture.detectChanges();
    
    const svgElement = fixture.nativeElement.querySelector('svg');
    expect(svgElement.getAttribute('width')).toBeNull();
    expect(svgElement.getAttribute('height')).toBeNull();
  });

  it('should render empty content for invalid icon name', () => {
    fixture.componentRef.setInput('name', 'invalid' as any);
    fixture.detectChanges();
    
    const svgElement = fixture.nativeElement.querySelector('svg');
    expect(svgElement.innerHTML).toBe('');
  });
});
