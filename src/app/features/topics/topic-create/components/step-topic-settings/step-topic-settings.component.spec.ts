import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { StepTopicSettingsComponent } from './step-topic-settings.component';

describe('StepTopicSettingsComponent (business logic)', () => {
  let component: StepTopicSettingsComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    component = TestBed.runInInjectionContext(() => new StepTopicSettingsComponent());
    vi.spyOn(component, 'topic').mockReturnValue({
      visibility: 'private',
      categories: [],
      country: null,
      language: null
    } as any);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit topicUpdate when onUpdate is called', () => {
    const spy = vi.spyOn(component.topicUpdate, 'emit');
    component.onUpdate({ visibility: 'public' });
    expect(spy).toHaveBeenCalledWith({ visibility: 'public' });
  });
});
