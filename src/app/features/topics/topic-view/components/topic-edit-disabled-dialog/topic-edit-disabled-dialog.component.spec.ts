import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Component } from '@angular/core';
import { OverlayRef } from '@angular/cdk/overlay';
import { DialogRef } from '../../../../../shared/dialog/dialog-ref';
import { TopicEditDisabledDialogComponent } from './topic-edit-disabled-dialog.component';

@Component({ template: '', standalone: true })
class EmptyComponent {}

const mockOverlayRef = { dispose: () => {} } as unknown as OverlayRef;

describe('TopicEditDisabledDialogComponent', () => {
  let component: TopicEditDisabledDialogComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        provideRouter([{ path: '**', component: EmptyComponent }]),
        { provide: DialogRef, useValue: new DialogRef(mockOverlayRef) }
      ]
    });
    component = TestBed.runInInjectionContext(() => new TopicEditDisabledDialogComponent());
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
