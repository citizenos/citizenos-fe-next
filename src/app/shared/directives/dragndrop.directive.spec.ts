import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { DragndropDirective } from './dragndrop.directive';

@Component({
  standalone: true,
  imports: [DragndropDirective],
  template: `<div dragndrop (fileDropped)="onDrop($event)"></div>`
})
class HostComponent {
  droppedFiles: FileList | null = null;
  onDrop(files: any) { this.droppedFiles = files; }
}

describe('DragndropDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    el = fixture.nativeElement.querySelector('[cosDragndrop]');
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should prevent default on dragover', () => {
    const event = new Event('dragover', { bubbles: true, cancelable: true });
    const preventSpy = vi.spyOn(event, 'preventDefault');
    el.dispatchEvent(event);
    expect(preventSpy).toHaveBeenCalled();
  });

  it('should prevent default on dragleave', () => {
    const event = new Event('dragleave', { bubbles: true, cancelable: true });
    const preventSpy = vi.spyOn(event, 'preventDefault');
    el.dispatchEvent(event);
    expect(preventSpy).toHaveBeenCalled();
  });

  it('should emit fileDropped on drop with files', () => {
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const mockFileList = { 0: file, length: 1, item: () => file } as unknown as FileList;
    const dropEvent = Object.assign(new Event('drop', { bubbles: true, cancelable: true }), {
      dataTransfer: { files: mockFileList },
      preventDefault: () => {},
      stopPropagation: () => {},
    });
    el.dispatchEvent(dropEvent);
    fixture.detectChanges();
    expect(fixture.componentInstance.droppedFiles).toBeTruthy();
  });
});
