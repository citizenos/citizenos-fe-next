import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PostArgumentFormComponent } from './post-argument-form.component';
import { TopicArgumentService } from '../../../../../core/services/topic-argument.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { of, throwError } from 'rxjs';

const mockArgumentService = {
  save: vi.fn(),
  ARGUMENT_SUBJECT_MAXLENGTH: 200,
  ARGUMENT_TYPES_MAXLENGTH: { pro: 500, con: 500, poi: 500, reply: 250 },
};
const mockNotification = { success: vi.fn(), showRaw: vi.fn() };

describe('PostArgumentFormComponent', () => {
  let component: PostArgumentFormComponent;

  beforeEach(() => {
    vi.clearAllMocks();
    mockArgumentService.save.mockReturnValue(of({}));

    TestBed.configureTestingModule({
      providers: [
        { provide: TopicArgumentService, useValue: mockArgumentService },
        { provide: NotificationService, useValue: mockNotification },
      ]
    });

    component = TestBed.runInInjectionContext(() => new PostArgumentFormComponent());
    (component as any).topicId = () => 'topic-1';
    (component as any).discussionId = () => 'disc-1';
  });

  it('should default to pro type', () => {
    expect(component.argumentType()).toBe('pro');
  });

  it('should have all three types available', () => {
    expect(component.types).toEqual(['pro', 'con', 'poi']);
  });

  it('submit should call save with correct payload', () => {
    component.argumentType.set('con');
    component.subject.set('My subject');
    component.text.set('My text');
    component.submit();

    expect(mockArgumentService.save).toHaveBeenCalledWith(expect.objectContaining({
      type: 'con',
      subject: 'My subject',
      text: 'My text',
      topicId: 'topic-1',
      discussionId: 'disc-1',
    }));
  });

  it('submit should clear form and emit posted on success', () => {
    const postedSpy = vi.spyOn(component.posted, 'emit');
    component.subject.set('Test');
    component.text.set('Body');
    component.submit();

    expect(component.subject()).toBe('');
    expect(component.text()).toBe('');
    expect(postedSpy).toHaveBeenCalled();
  });

  it('submit should set error on failure', () => {
    mockArgumentService.save.mockReturnValue(throwError(() => ({ message: 'Server error' })));
    component.subject.set('Test');
    component.text.set('Body');
    component.submit();

    expect(component.errors()).toBe('Server error');
  });

  it('submit with empty subject calls save but trimmed value is empty', () => {
    component.subject.set('   ');
    component.text.set('Some text');
    component.submit();
    expect(mockArgumentService.save).toHaveBeenCalledWith(expect.objectContaining({ subject: '' }));
  });
});
