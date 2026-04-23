import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ImageUploadComponent } from './image-upload.component';
import { TranslateModule } from '@ngx-translate/core';
import { NotificationService } from '../../../core/services/notification.service';

describe('ImageUploadComponent', () => {
  let component: ImageUploadComponent;
  let fixture: ComponentFixture<ImageUploadComponent>;
  let notificationService: NotificationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageUploadComponent, TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ImageUploadComponent);
    component = fixture.componentInstance;
    notificationService = TestBed.inject(NotificationService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show upload area when no image', () => {
    expect(component.hasImage()).toBe(false);
    const uploadArea = fixture.nativeElement.querySelector('.upload-area');
    expect(uploadArea).toBeTruthy();
  });

  it('should not show preview when no image', () => {
    const preview = fixture.nativeElement.querySelector('.image-preview');
    expect(preview).toBeNull();
  });

  it('should show preview when imageUrl is set', () => {
    fixture.componentRef.setInput('imageUrl', 'https://example.com/test.jpg');
    fixture.detectChanges();
    expect(component.hasImage()).toBe(true);
  });

  it('should emit null and imageRemoved when removeImage is called', () => {
    const fileEmitSpy = vi.spyOn(component.imageFileChange, 'emit');
    const removeEmitSpy = vi.spyOn(component.imageRemoved, 'emit');
    component.previewUrl.set('data:image/png;base64,abc');
    component.removeImage();
    expect(fileEmitSpy).toHaveBeenCalledWith(null);
    expect(removeEmitSpy).toHaveBeenCalled();
    expect(component.previewUrl()).toBeNull();
  });

  it('should prevent default on dragover', () => {
    const event = new DragEvent('dragover');
    const preventSpy = vi.spyOn(event, 'preventDefault');
    component.onDragOver(event);
    expect(preventSpy).toHaveBeenCalled();
  });
});
