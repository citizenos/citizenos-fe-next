import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IllustrationComponent } from './illustration.component';
import { Component, signal } from '@angular/core';
import { By } from '@angular/platform-browser';

@Component({
  standalone: true,
  imports: [IllustrationComponent],
  template: `<cos-illustration [imagePath]="imagePath()" [altText]="altText()" />`
})
class TestHostComponent {
  imagePath = signal('test.png');
  altText = signal('Test Alt');
}

describe('IllustrationComponent', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IllustrationComponent, TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render image with correct src and alt', () => {
    const imgElement = fixture.debugElement.query(By.css('img')).nativeElement as HTMLImageElement;
    expect(imgElement.src).toContain('test.png');
    expect(imgElement.alt).toBe('Test Alt');
  });

  it('should update when inputs change', () => {
    component.imagePath.set('new.png');
    component.altText.set('New Alt');
    fixture.detectChanges();

    const imgElement = fixture.debugElement.query(By.css('img')).nativeElement as HTMLImageElement;
    expect(imgElement.src).toContain('new.png');
    expect(imgElement.alt).toBe('New Alt');
  });
});
