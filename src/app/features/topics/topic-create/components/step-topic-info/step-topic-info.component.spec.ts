import { vi, describe, it, expect, beforeEach } from 'vitest';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { StepTopicInfoComponent } from './step-topic-info.component';
import { Topic } from '../../../../../core/interfaces/topic';

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
    vi.spyOn(component, 'topic').mockReturnValue({ title: 'Mock' } as unknown as Topic);
    expect(component.topic().title).toBe('Mock');
  });

  it('should open blocks reactively when existing topic data loads asynchronously', () => {
    const topicSignal = signal<Partial<Topic>>({
      title: '',
      description: '<html><head></head><body></body></html>',
    });
    vi.spyOn(component, 'topic').mockImplementation(() => topicSignal());

    TestBed.flushEffects();
    expect(component.block().title).toBe(false);
    expect(component.block().description).toBe(false);

    topicSignal.set({
      title: 'Existing Topic Title',
      intro: 'Existing intro',
      description: '<html><body><h1>Existing Topic Title</h1><p>Existing content</p></body></html>',
      padUrl: 'https://etherpad.test/p/11111111-2222-3333-4444-555555555555?jwt=abc',
    });

    TestBed.flushEffects();
    expect(component.block().title).toBe(true);
    expect(component.block().intro).toBe(true);
    expect(component.block().description).toBe(true);
  });
});
