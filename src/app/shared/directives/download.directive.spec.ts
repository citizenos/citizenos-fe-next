import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { DownloadDirective } from './download.directive';

@Component({
  standalone: true,
  imports: [DownloadDirective],
  template: `<div download><a href="http://example.com/file.pdf">Download</a></div>`
})
class HostComponent {}

describe('DownloadDirective', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should open link in new tab on click', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
    link.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(openSpy).toHaveBeenCalledWith('http://example.com/file.pdf', '_blank');
    openSpy.mockRestore();
  });
});
