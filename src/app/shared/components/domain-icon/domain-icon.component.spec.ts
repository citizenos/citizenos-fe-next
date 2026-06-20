import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentRef } from '@angular/core';
import { DomainIconComponent, DomainType } from './domain-icon.component';

describe('DomainIconComponent', () => {
  let component: DomainIconComponent;
  let fixture: ComponentFixture<DomainIconComponent>;
  let componentRef: ComponentRef<DomainIconComponent>;

  const TYPES: DomainType[] = ['topic', 'ideation', 'vote', 'follow-up'];
  const EXPECTED_COLORS: Record<DomainType, string> = {
    topic: '#5C9CD0',
    ideation: '#E4B722',
    vote: '#98DAA2',
    'follow-up': '#E3A8CC',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DomainIconComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DomainIconComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('type', 'topic');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render an svg element', () => {
    expect(fixture.nativeElement.querySelector('svg')).toBeTruthy();
  });

  it.each(TYPES)('should render correct background color for type "%s"', (type) => {
    componentRef.setInput('type', type);
    fixture.detectChanges();
    const rect = fixture.nativeElement.querySelector('rect');
    expect(rect?.getAttribute('fill')).toBe(EXPECTED_COLORS[type]);
  });

  it('should use default size of 40', () => {
    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg?.getAttribute('width')).toBe('40');
    expect(svg?.getAttribute('height')).toBe('40');
  });

  it('should apply custom size', () => {
    componentRef.setInput('size', 24);
    fixture.detectChanges();
    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg?.getAttribute('width')).toBe('24');
    expect(svg?.getAttribute('height')).toBe('24');
  });

  it('config() returns an object with bgColor and path for every type', () => {
    TYPES.forEach(type => {
      componentRef.setInput('type', type);
      fixture.detectChanges();
      const cfg = component.config();
      expect(cfg).toBeDefined();
      expect(cfg?.bgColor).toBeTruthy();
      expect(cfg?.path).toBeTruthy();
    });
  });
});
