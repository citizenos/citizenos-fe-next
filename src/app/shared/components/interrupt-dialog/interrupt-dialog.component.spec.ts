import { MockIconComponent } from '../../testing/mocks';

import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InterruptDialogComponent } from './interrupt-dialog.component';
import { DialogRef } from '../../dialog';
import { TranslateModule } from '@ngx-translate/core';
import { Component } from '@angular/core';
import { DialogCloseDirective } from '../../dialog';

@Component({ selector: 'cos-notifications', standalone: true, template: '' })
class MockNotificationsComponent {}

describe('InterruptDialogComponent', () => {
  let component: InterruptDialogComponent;
  let fixture: ComponentFixture<InterruptDialogComponent>;
  const mockDialogRef = { close: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [InterruptDialogComponent, TranslateModule.forRoot()],
      providers: [{ provide: DialogRef, useValue: mockDialogRef }]
    })
    .overrideComponent(InterruptDialogComponent, {
      set: { imports: [TranslateModule, DialogCloseDirective, MockNotificationsComponent,
          MockIconComponent] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterruptDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render warning header', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.dialog_header.warning')).toBeTruthy();
  });

  it('should render orange warning SVG icon', () => {
    const el: HTMLElement = fixture.nativeElement;
    const svgRect = el.querySelector('.icon_notification rect');
    expect(svgRect?.getAttribute('fill')).toBe('#F39129');
  });

  it('should render heading', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('h4.title')).toBeTruthy();
  });

  it('should render close button', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.btn_dialog_close')).toBeTruthy();
  });

  it('should render submit button', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.btn_big_submit')).toBeTruthy();
  });

  it('should render cancel link', () => {
    const el: HTMLElement = fixture.nativeElement;
    const cancel = el.querySelector('[dialogclose]');
    expect(cancel).toBeTruthy();
  });

  it('should render two info_row sections', () => {
    const el: HTMLElement = fixture.nativeElement;
    const rows = el.querySelectorAll('.info_row');
    expect(rows.length).toBeGreaterThanOrEqual(2);
  });
});
