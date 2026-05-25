import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { StepTopicDiscussionComponent } from './step-topic-discussion.component';

describe('StepTopicDiscussionComponent (business logic)', () => {
  let component: StepTopicDiscussionComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    component = TestBed.runInInjectionContext(() => new StepTopicDiscussionComponent());
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onQuestionChange emits updated discussion', () => {
    const emitSpy = vi.spyOn(component.discussionChange, 'emit');
    component.onQuestionChange('New question');
    expect(emitSpy).toHaveBeenCalledWith({ question: 'New question', deadline: null });
  });

  it('onDeadlineChange emits updated discussion with deadline', () => {
    const emitSpy = vi.spyOn(component.discussionChange, 'emit');
    const futureDate = new Date('2026-12-01T10:00:00Z');
    component.onDeadlineChange(futureDate);
    expect(emitSpy).toHaveBeenCalledWith({ question: '', deadline: futureDate.toISOString() });
  });
});
