import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArgumentWhyDialogComponent } from './argument-why-dialog.component';
import { DIALOG_DATA, DialogRef } from '../../../../../shared/dialog';
import { TranslateModule } from '@ngx-translate/core';

const MOCK_ARGUMENT = {
  id: 'arg1',
  deletedReasonType: 'abuse',
  deletedReasonText: 'This content violates community guidelines.'
};

describe('ArgumentWhyDialogComponent', () => {
  let component: ArgumentWhyDialogComponent;
  let fixture: ComponentFixture<ArgumentWhyDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArgumentWhyDialogComponent, TranslateModule.forRoot()],
      providers: [
        { provide: DIALOG_DATA, useValue: { argument: { ...MOCK_ARGUMENT } } },
        { provide: DialogRef, useValue: { close: vi.fn() } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ArgumentWhyDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose argument from DIALOG_DATA', () => {
    expect(component.argument.id).toBe('arg1');
    expect(component.argument.deletedReasonType).toBe('abuse');
  });

  it('should render the moderation reason text', () => {
    const el: HTMLElement = fixture.nativeElement;
    const textEl = el.querySelector('.text');
    expect(textEl?.innerHTML).toContain(MOCK_ARGUMENT.deletedReasonText);
  });

  it('should have a close element with dialogClose', () => {
    const el: HTMLElement = fixture.nativeElement;
    const closeEl = el.querySelector('[dialogclose]') || el.querySelector('[dialogClose]');
    expect(closeEl).toBeTruthy();
  });
});
