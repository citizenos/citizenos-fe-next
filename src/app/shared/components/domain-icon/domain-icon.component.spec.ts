import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DomainIconComponent, DomainType } from './domain-icon.component';
import { Component, signal } from '@angular/core';
import { By } from '@angular/platform-browser';

@Component({
  standalone: true,
  imports: [DomainIconComponent],
  template: `<cos-domain-icon [type]="type()" [size]="size()" [active]="active()" />`
})
class TestHostComponent {
  type = signal<DomainType>('topic');
  size = signal(40);
  active = signal(false);
}

describe('DomainIconComponent', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DomainIconComponent, TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render correct SVG for topic type', () => {
    const svgElement = fixture.debugElement.query(By.css('svg')).nativeElement as SVGSVGElement;
    expect(svgElement).toBeTruthy();
    expect(svgElement.getAttribute('viewBox')).toBe('0 0 32 32');
    
    const rectElement = fixture.debugElement.query(By.css('rect')).nativeElement as SVGRectElement;
    expect(rectElement.getAttribute('fill')).toBe('#5C9CD0');
  });

  it('should update SVG when active is true', () => {
    component.active.set(true);
    fixture.detectChanges();

    const rectElement = fixture.debugElement.query(By.css('rect')).nativeElement as SVGRectElement;
    expect(rectElement.getAttribute('fill')).toBe('#1168A8');
  });

  it('should update SVG when type changes to ideation', () => {
    component.type.set('ideation');
    fixture.detectChanges();

    const svgElement = fixture.debugElement.query(By.css('svg')).nativeElement as SVGSVGElement;
    expect(svgElement.getAttribute('viewBox')).toBe('0 0 40 40');

    const rectElement = fixture.debugElement.query(By.css('rect')).nativeElement as SVGRectElement;
    expect(rectElement.getAttribute('fill')).toBe('#E4B722');
  });
});
