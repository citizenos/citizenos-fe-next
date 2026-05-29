import {
  ChangeDetectionStrategy, Component, ViewChild, ElementRef, AfterViewInit,
  OnChanges, SimpleChanges, HostListener, input, output
} from '@angular/core';

@Component({
  selector: 'cos-image-editor',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './image-editor.component.html',
  styleUrl: './image-editor.component.scss'
})
export class ImageEditorComponent implements AfterViewInit, OnChanges {
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;

  file = input<File>();
  // eslint-disable-next-line @angular-eslint/no-input-rename
  canvasWidth = input<number>(320, { alias: 'width' });
  // eslint-disable-next-line @angular-eslint/no-input-rename
  canvasHeight = input<number>(320, { alias: 'heigth' });
  item = output<File>();

  private canvas: HTMLCanvasElement | null = null;
  private offsetX = 0;
  private offsetY = 0;
  private isDragging = false;
  private startX = 0;
  private startY = 0;
  private downX = 0;
  private downY = 0;
  private upX = 0;
  private upY = 0;
  private image = new Image();
  private imageWidth = 320;
  private imageHeight = 320;
  scale = 1;

  ngAfterViewInit() {
    this.setInitialImage();
  }

  ngOnChanges(_changes: SimpleChanges) {
    if (this.canvasElement) {
      this.setInitialImage();
    }
  }

  setInitialImage() {
    this.canvas = this.canvasElement.nativeElement;
    const offset = this.canvasElement.nativeElement.getBoundingClientRect();
    this.offsetX = offset.x;
    this.offsetY = offset.y;
    const context = this.canvas.getContext('2d');
    if (this.file()) {
      this.image.src = URL.createObjectURL(this.file()!);
      this.image.onload = () => {
        if (context) {
          this.imageWidth = this.image.width;
          this.imageHeight = this.image.height;
          context.clearRect(0, 0, this.canvas!.width, this.canvas!.height);
          context.drawImage(this.image, 0, 0, this.imageWidth, this.imageHeight, 0, 0, this.canvasWidth(), this.canvasHeight());
        }
      };
    }
  }

  draw() {
    if (!this.canvas) return;
    const context = this.canvas.getContext('2d');
    if (!context) return;
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    context.drawImage(this.image, this.startX, this.startY, this.imageWidth, this.imageHeight, 0, 0, this.canvasWidth(), this.canvasHeight());
    this.outPutImage();
  }

  @HostListener('wheel', ['$event'])
  onMouseWheel(event: WheelEvent) {
    event.preventDefault();
    const delta = Math.sign(event.deltaY);
    const context = this.canvas?.getContext('2d');
    if (context) {
      if (delta > 0) {
        this.scale += 0.1;
      } else {
        this.scale -= 0.1;
      }
      this.draw();
    }
  }

  @HostListener('mouseout', ['$event'])
  onMouseOut(event: MouseEvent) {
    if (this.isDragging) {
      this.upX = event.clientX - this.offsetX;
      this.upY = event.clientY - this.offsetY;
    }
    this.isDragging = false;
  }

  onMouseDown(event: MouseEvent) {
    this.isDragging = true;
    this.downX = event.clientX - this.offsetX + this.upX;
    this.downY = event.clientY - this.offsetY + this.upY;
  }

  onMouseUp(event: MouseEvent) {
    if (this.isDragging) {
      this.upX = event.clientX - this.offsetX;
      this.upY = event.clientY - this.offsetY;
    }
    this.isDragging = false;
  }

  onMouseMove(event: MouseEvent) {
    this.startX = event.clientX - this.offsetX - this.downX + this.upX;
    this.startY = event.clientY - this.offsetY - this.downY + this.upY;
    const context = this.canvas?.getContext('2d');
    if (this.isDragging && context) {
      this.draw();
    }
  }

  outPutImage() {
    if (!this.canvas) return;
    this.canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'profileimage.jpg', { type: 'image/jpeg' });
        this.item.emit(file);
      }
    }, 'image/jpeg');
  }
}
