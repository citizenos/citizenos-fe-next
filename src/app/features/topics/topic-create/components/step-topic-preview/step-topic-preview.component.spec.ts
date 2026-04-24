import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { StepTopicPreviewComponent } from './step-topic-preview.component';

describe('StepTopicPreviewComponent (business logic)', () => {
  let component: StepTopicPreviewComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    component = TestBed.runInInjectionContext(() => new StepTopicPreviewComponent());
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit previous on onPrevious', () => {
    const spy = vi.spyOn(component.previous, 'emit');
    component.previous.emit();
    expect(spy).toHaveBeenCalled();
  });

  it('should emit save on publish', () => {
    const spy = vi.spyOn(component.save, 'emit');
    component.save.emit();
    expect(spy).toHaveBeenCalled();
  });
});
