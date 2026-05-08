import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IllustrationComponent } from './illustration.component';

describe('IllustrationComponent', () => {
  let component: IllustrationComponent;
  let fixture: ComponentFixture<IllustrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IllustrationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(IllustrationComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('imagePath', '/assets/test.png');
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should render an img element', () => {
    expect(fixture.nativeElement.querySelector('img')).toBeTruthy();
  });

  it('should bind imagePath to img src', () => {
    const img = fixture.nativeElement.querySelector('img');
    expect(img.src).toContain('/assets/test.png');
  });

  it('should bind altText to img alt with default value', () => {
    const img = fixture.nativeElement.querySelector('img');
    expect(img.alt).toBe('CitizenOS Illustration');
  });

  it('should use provided altText when set', () => {
    fixture.componentRef.setInput('altText', 'Custom alt text');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('img').alt).toBe('Custom alt text');
  });
});
