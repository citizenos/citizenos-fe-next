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

  it('deadlineEnabled starts false', () => {
    expect(component.deadlineEnabled()).toBe(false);
  });

  it('toggleDeadline flips deadlineEnabled', () => {
    component.toggleDeadline();
    expect(component.deadlineEnabled()).toBe(true);
    component.toggleDeadline();
    expect(component.deadlineEnabled()).toBe(false);
  });

  it('onQuestionChange emits updated discussion', () => {
    const emitSpy = vi.spyOn(component.discussionChange, 'emit');
    component.onQuestionChange('New question');
    expect(emitSpy).toHaveBeenCalledWith({ question: 'New question', deadline: null });
  });

  it('onDeadlineChange emits updated discussion with deadline', () => {
    const emitSpy = vi.spyOn(component.discussionChange, 'emit');
    component.onDeadlineChange('2026-12-01T10:00');
    expect(emitSpy).toHaveBeenCalledWith({ question: '', deadline: '2026-12-01T10:00' });
  });
});
