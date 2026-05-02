import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Component } from '@angular/core';
import { OverlayRef } from '@angular/cdk/overlay';
import { DialogRef } from '../../../../../shared/dialog/dialog-ref';
import { TopicSettingsDisabledDialogComponent } from './topic-settings-disabled-dialog.component';

@Component({ template: '', standalone: true })
class EmptyComponent {}

const mockOverlayRef = { dispose: () => {} } as unknown as OverlayRef;

describe('TopicSettingsDisabledDialogComponent', () => {
  let component: TopicSettingsDisabledDialogComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        provideRouter([{ path: '**', component: EmptyComponent }]),
        { provide: DialogRef, useValue: new DialogRef(mockOverlayRef) }
      ]
    });
    component = TestBed.runInInjectionContext(() => new TopicSettingsDisabledDialogComponent());
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
