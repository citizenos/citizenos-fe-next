import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { StepTopicDiscussionComponent } from './step-topic-discussion.component';
import { Topic } from '../../../../../core/interfaces/topic';

describe('StepTopicDiscussionComponent', () => {
  let component: StepTopicDiscussionComponent;
  let fixture: ComponentFixture<StepTopicDiscussionComponent>;

  const mockTopic: Partial<Topic> = { id: 'topic-1', title: 'Test', description: '' };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepTopicDiscussionComponent, TranslateModule.forRoot()],
      providers: [provideRouter([])],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(StepTopicDiscussionComponent, {
      set: { imports: [TranslateModule], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(StepTopicDiscussionComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('topic', mockTopic);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to members page on invite editors click', () => {
    const spy = vi.spyOn(component['router'], 'navigate');
    component.onInviteEditors();
    expect(spy).toHaveBeenCalledWith(['/topics', 'topic-1', 'members']);
  });

  it('should not navigate if topic has no id', () => {
    fixture.componentRef.setInput('topic', { title: 'Test' });
    const spy = vi.spyOn(component['router'], 'navigate');
    component.onInviteEditors();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should emit next', () => {
    const spy = vi.spyOn(component.next, 'emit');
    component.next.emit();
    expect(spy).toHaveBeenCalled();
  });

  it('should emit previous', () => {
    const spy = vi.spyOn(component.previous, 'emit');
    component.previous.emit();
    expect(spy).toHaveBeenCalled();
  });
});
