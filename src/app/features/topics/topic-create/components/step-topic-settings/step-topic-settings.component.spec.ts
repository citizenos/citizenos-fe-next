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

  it('should have default visibility private', () => {
    const defaultTopic = TestBed.runInInjectionContext(() => new StepTopicSettingsComponent()).topic();
    expect(defaultTopic.visibility).toBe('private');
  });

  it('should emit topicUpdate when onUpdate is called with visibility', () => {
    const spy = vi.spyOn(component.topicUpdate, 'emit');
    component.onUpdate({ visibility: 'public' });
    expect(spy).toHaveBeenCalledWith({ visibility: 'public' });
  });

  it('should emit topicUpdate when onUpdate is called with country', () => {
    const spy = vi.spyOn(component.topicUpdate, 'emit');
    component.onUpdate({ country: 'EE' });
    expect(spy).toHaveBeenCalledWith({ country: 'EE' });
  });

  it('should emit topicUpdate when onUpdate is called with categories', () => {
    const spy = vi.spyOn(component.topicUpdate, 'emit');
    component.onUpdate({ categories: ['environment'] });
    expect(spy).toHaveBeenCalledWith({ categories: ['environment'] });
  });
});
