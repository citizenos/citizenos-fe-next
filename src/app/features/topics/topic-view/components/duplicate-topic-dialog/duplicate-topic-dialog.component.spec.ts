import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Component } from '@angular/core';
import { OverlayRef } from '@angular/cdk/overlay';
import { DialogRef } from '../../../../../shared/dialog/dialog-ref';
import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';
import { DuplicateTopicDialogComponent } from './duplicate-topic-dialog.component';

@Component({ template: '', standalone: true })
class EmptyComponent {}

const mockOverlayRef = { dispose: () => {} } as unknown as OverlayRef;
const mockTopic = { id: 'topic-1', title: 'Test Topic', status: 'inProgress', categories: [] };

describe('DuplicateTopicDialogComponent', () => {
  let component: DuplicateTopicDialogComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        provideRouter([{ path: '**', component: EmptyComponent }]),
        { provide: DialogRef, useValue: new DialogRef(mockOverlayRef) },
        { provide: DIALOG_DATA, useValue: { topic: mockTopic } }
      ]
    });
    component = TestBed.runInInjectionContext(() => new DuplicateTopicDialogComponent());
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose topic from dialog data', () => {
    expect(component.topic.title).toBe('Test Topic');
  });
});
