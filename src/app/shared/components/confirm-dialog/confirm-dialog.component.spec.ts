import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmDialogComponent } from './confirm-dialog.component';
import { DIALOG_DATA, DialogRef } from '../../dialog';
import { ConfirmDialogData } from './confirm-dialog.component';
import { TranslateModule } from '@ngx-translate/core';

describe('ConfirmDialogComponent', () => {
  let component: ConfirmDialogComponent;
  let fixture: ComponentFixture<ConfirmDialogComponent>;
  const mockDialogRef = { close: vi.fn() };

  function setup(data: ConfirmDialogData) {
    TestBed.overrideProvider(DIALOG_DATA, { useValue: data });
    fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent, TranslateModule.forRoot()],
      providers: [
        { provide: DIALOG_DATA, useValue: {} },
        { provide: DialogRef, useValue: mockDialogRef }
      ]
    }).compileComponents();
  });

  it('should create with minimal data', () => {
    setup({});
    expect(component).toBeTruthy();
  });

  it('should default level to warn when not provided', () => {
    setup({});
    expect(component.data.level).toBe('warn');
  });

  it('should render heading when provided', () => {
    setup({ heading: 'HEADING_KEY', level: 'warn' });
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('#dialog-title')).toBeTruthy();
  });

  it('should not render heading element when heading is absent', () => {
    setup({ level: 'info' });
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('#dialog-title')).toBeFalsy();
  });

  it('should render confirm button when confirmBtn provided', () => {
    setup({ confirmBtn: 'CONFIRM_BTN_KEY' });
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.btn_big_submit')).toBeTruthy();
  });

  it('should not render confirm button when confirmBtn absent', () => {
    setup({});
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.btn_big_submit')).toBeFalsy();
  });

  it('should render close button when closeBtn provided', () => {
    setup({ closeBtn: 'CLOSE_BTN_KEY' });
    const el: HTMLElement = fixture.nativeElement;
    const closeLink = el.querySelector('[dialogclose]');
    expect(closeLink).toBeTruthy();
  });

  it('should render points section when points provided', () => {
    setup({ points: ['POINT_A', 'POINT_B'] });
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.dialog_info_wrap')).toBeTruthy();
  });

  it('should not render info section when no points/info/sections', () => {
    setup({ title: 'Title only' });
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.dialog_info_wrap')).toBeFalsy();
  });

  it('should render sections heading and points', () => {
    setup({
      sections: [{ heading: 'SECTION_HEADING', points: ['POINT_1'] }]
    });
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.small_heading')).toBeTruthy();
    expect(el.querySelectorAll('.info_row').length).toBeGreaterThan(0);
  });

  it('should set safeIcon when svg is provided', () => {
    setup({ svg: '<svg></svg>' });
    expect(component.safeIcon).not.toBeNull();
  });

  it('should apply error class to header for delete level', () => {
    setup({ level: 'delete', heading: 'HEAD' });
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.dialog_header.error')).toBeTruthy();
  });
});
