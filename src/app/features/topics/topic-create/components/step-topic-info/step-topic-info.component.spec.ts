import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { StepTopicInfoComponent } from './step-topic-info.component';

describe('StepTopicInfoComponent (business logic)', () => {
  let component: StepTopicInfoComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    component = TestBed.runInInjectionContext(() => new StepTopicInfoComponent());
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit topicUpdate on onUpdate', () => {
    const spy = vi.spyOn(component.topicUpdate, 'emit');
    component.onUpdate({ title: 'New' });
    expect(spy).toHaveBeenCalledWith({ title: 'New' });
  });

  it('should return title from signal', () => {
    vi.spyOn(component, 'topic').mockReturnValue({ title: 'Mock' } as any);
    expect(component.topic().title).toBe('Mock');
  });
});
