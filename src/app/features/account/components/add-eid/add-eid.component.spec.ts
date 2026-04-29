import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AddEidComponent } from './add-eid.component';
import { DialogRef } from '../../../../shared/dialog/dialog-ref';
import { DialogService } from '../../../../shared/dialog/dialog.service';

const dialogServiceMock = { open: vi.fn() };

function createFixture(): ComponentFixture<AddEidComponent> {
  TestBed.configureTestingModule({
    imports: [AddEidComponent, TranslateModule.forRoot()],
    providers: [
      { provide: DialogRef, useValue: { close: vi.fn() } },
      { provide: DialogService, useValue: dialogServiceMock },
    ],
    schemas: [NO_ERRORS_SCHEMA],
  }).compileComponents();
  const fixture = TestBed.createComponent(AddEidComponent);
  fixture.detectChanges();
  return fixture;
}

describe('AddEidComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.resetTestingModule();
  });

  it('renders without error', () => {
    const fixture = createFixture();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('has a close button', () => {
    const fixture = createFixture();
    const btn = fixture.nativeElement.querySelector('.btn_dialog_close');
    expect(btn).toBeTruthy();
  });

  it('doConnectEsteId opens ConnectEidComponent dialog', () => {
    const fixture = createFixture();
    fixture.componentInstance.doConnectEsteId();
    expect(dialogServiceMock.open).toHaveBeenCalled();
  });

  it('doConnectSmartId opens ConnectSmartIdComponent dialog', () => {
    const fixture = createFixture();
    fixture.componentInstance.doConnectSmartId();
    expect(dialogServiceMock.open).toHaveBeenCalled();
  });

  it('shows ID-Card/MID button', () => {
    const fixture = createFixture();
    const buttons = fixture.nativeElement.querySelectorAll('.dialog_info a');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });
});
