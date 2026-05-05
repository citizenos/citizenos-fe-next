import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CloseWithoutSavingDialogComponent } from './close-without-saving-dialog.component';
import { DialogRef } from '../../../../../shared/dialog';
import { TranslateModule } from '@ngx-translate/core';

describe('CloseWithoutSavingDialogComponent', () => {
  let component: CloseWithoutSavingDialogComponent;
  let fixture: ComponentFixture<CloseWithoutSavingDialogComponent>;
  const mockDialogRef = { close: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [CloseWithoutSavingDialogComponent, TranslateModule.forRoot()],
      providers: [{ provide: DialogRef, useValue: mockDialogRef }]
    }).compileComponents();

    fixture = TestBed.createComponent(CloseWithoutSavingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render blue info icon', () => {
    const el: HTMLElement = fixture.nativeElement;
    const rect = el.querySelector('.icon_notification rect');
    expect(rect?.getAttribute('fill')).toBe('#1168A8');
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

  it('should render back link', () => {
    const el: HTMLElement = fixture.nativeElement;
    const links = el.querySelectorAll('[dialogclose]');
    expect(links.length).toBeGreaterThan(0);
  });
});
