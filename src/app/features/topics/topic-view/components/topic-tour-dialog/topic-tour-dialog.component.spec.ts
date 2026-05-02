import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { OverlayRef } from '@angular/cdk/overlay';
import { DialogRef } from '../../../../../shared/dialog/dialog-ref';
import { TopicTourDialogComponent } from './topic-tour-dialog.component';

const mockOverlayRef = { dispose: () => {} } as unknown as OverlayRef;

describe('TopicTourDialogComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: DialogRef, useValue: new DialogRef(mockOverlayRef) },
      ]
    });
  });

  it('should create', () => {
    const component = TestBed.runInInjectionContext(() => new TopicTourDialogComponent());
    expect(component).toBeTruthy();
  });
});
