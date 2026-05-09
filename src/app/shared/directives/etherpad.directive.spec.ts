import { describe, it, expect, beforeEach } from 'vitest';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EtherpadDirective } from './etherpad.directive';

@Component({
  standalone: true,
  imports: [EtherpadDirective],
  template: `<iframe [cosEtherpad]="params" width="800" height="600"></iframe>`
})
class TestHostComponent {
  params = {};
}

describe('EtherpadDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let iframe: HTMLIFrameElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    iframe = fixture.nativeElement.querySelector('iframe');
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should not update dimensions on unrelated window message', () => {
    const originalWidth = iframe.width;
    window.dispatchEvent(new MessageEvent('message', { data: { name: 'other_event', data: { width: 999, height: 999 } } }));
    expect(iframe.width).toBe(originalWidth);
  });

  it('should update iframe width on ep_resize message with larger width', () => {
    window.dispatchEvent(new MessageEvent('message', { data: { name: 'ep_resize', data: { width: 1200, height: 600 } } }));
    fixture.detectChanges();
    expect(iframe.width).toBe('1200px');
  });

  it('should update iframe height on ep_resize message with larger height', () => {
    window.dispatchEvent(new MessageEvent('message', { data: { name: 'ep_resize', data: { width: 800, height: 900 } } }));
    fixture.detectChanges();
    expect(iframe.height).toBe('900px');
  });

  it('should not update width when new width is not greater than minWidth (800)', () => {
    window.dispatchEvent(new MessageEvent('message', { data: { name: 'ep_resize', data: { width: 400, height: 600 } } }));
    fixture.detectChanges();
    expect(iframe.width).toBe('800');
  });

  it('should not update height when new height is not greater than minHeight (600)', () => {
    window.dispatchEvent(new MessageEvent('message', { data: { name: 'ep_resize', data: { width: 800, height: 200 } } }));
    fixture.detectChanges();
    expect(iframe.height).toBe('600');
  });

  it('should ignore message with no data', () => {
    expect(() => {
      window.dispatchEvent(new MessageEvent('message', { data: null }));
    }).not.toThrow();
  });
});
