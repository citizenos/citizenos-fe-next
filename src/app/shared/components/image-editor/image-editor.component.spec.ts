import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { ImageEditorComponent } from './image-editor.component';

describe('ImageEditorComponent', () => {
  let component: ImageEditorComponent;
  let fixture: ComponentFixture<ImageEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageEditorComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ImageEditorComponent);
    component = fixture.componentInstance;
    
    // Mock getContext to avoid JSDOM "Not implemented" errors
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      clearRect: vi.fn(),
      drawImage: vi.fn(),
      toBlob: vi.fn()
    } as unknown as CanvasRenderingContext2D);
    
    fixture.detectChanges();
  });

  it('renders without error', () => {
    expect(component).toBeTruthy();
  });

  it('canvasElement ViewChild is non-null after init', () => {
    expect(component.canvasElement).toBeTruthy();
    expect(component.canvasElement.nativeElement.tagName).toBe('CANVAS');
  });

  it('onMouseDown sets isDragging to true', () => {
    const event = new MouseEvent('mousedown', { clientX: 10, clientY: 20 });
    component.onMouseDown(event);
    expect((component as unknown as { isDragging: boolean }).isDragging).toBe(true);
  });

  it('onMouseUp sets isDragging to false', () => {
    (component as unknown as { isDragging: boolean }).isDragging = true;
    const event = new MouseEvent('mouseup', { clientX: 10, clientY: 20 });
    component.onMouseUp(event);
    expect((component as unknown as { isDragging: boolean }).isDragging).toBe(false);
  });

  it('onMouseMove calls draw() when isDragging is true', () => {
    const drawSpy = vi.spyOn(component, 'draw').mockImplementation(() => { return; });
    (component as unknown as { isDragging: boolean }).isDragging = true;
    (component as unknown as { canvas: HTMLCanvasElement }).canvas = component.canvasElement.nativeElement;
    vi.spyOn(component.canvasElement.nativeElement, 'getContext').mockReturnValue({} as unknown as CanvasRenderingContext2D);
    const event = new MouseEvent('mousemove', { clientX: 15, clientY: 25 });
    component.onMouseMove(event);
    expect(drawSpy).toHaveBeenCalled();
  });

  it('onMouseMove does not call draw() when isDragging is false', () => {
    const drawSpy = vi.spyOn(component, 'draw').mockImplementation(() => { return; });
    (component as unknown as { isDragging: boolean }).isDragging = false;
    const event = new MouseEvent('mousemove', { clientX: 15, clientY: 25 });
    component.onMouseMove(event);
    expect(drawSpy).not.toHaveBeenCalled();
  });

  it('outPutImage emits a File via item output', () => {
    const emitSpy = vi.spyOn(component.item, 'emit');
    (component as unknown as { canvas: HTMLCanvasElement }).canvas = component.canvasElement.nativeElement;
    vi.spyOn(component.canvasElement.nativeElement, 'toBlob').mockImplementation((cb: BlobCallback) => {
      cb(new Blob(['img'], { type: 'image/jpeg' }));
    });
    component.outPutImage();
    expect(emitSpy).toHaveBeenCalledWith(expect.any(File));
  });

  it('uses default canvasWidth of 320', () => {
    expect(component.canvasWidth()).toBe(320);
  });

  it('uses default canvasHeight of 320', () => {
    expect(component.canvasHeight()).toBe(320);
  });
});
