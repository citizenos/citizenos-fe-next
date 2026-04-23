import { vi, describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TopicService } from '../../../core/services/topic.service';
import { UploadService } from '../../../core/services/upload.service';
import { NotificationService } from '../../../core/services/notification.service';
import { TopicCreateComponent } from './topic-create.component';
import { of } from 'rxjs';

const mockTopicService = { save: vi.fn(), patch: vi.fn() };
const mockUploadService = { upload: vi.fn() };
const mockNotificationService = { showRaw: vi.fn(), success: vi.fn() };

function setupProviders() {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: TopicService, useValue: mockTopicService },
      { provide: UploadService, useValue: mockUploadService },
      { provide: NotificationService, useValue: mockNotificationService }
    ]
  });
}

describe('TopicCreateComponent (business logic)', () => {
  let component: TopicCreateComponent;

  beforeEach(() => {
    vi.clearAllMocks();
    mockTopicService.save.mockReturnValue(of({ id: 'new-id', title: '', visibility: 'private', status: 'draft', categories: [] }));
    mockUploadService.upload.mockReturnValue(of(null));
    setupProviders();
    // Instantiate using injection context to avoid template/style resolution
    component = TestBed.runInInjectionContext(() => new TopicCreateComponent());
  });

  it('should start at info step', () => {
    expect(component.currentStep()).toBe('info');
  });

  it('canNavigateTo info always returns true', () => {
    expect(component.canNavigateTo('info')).toBe(true);
  });

  it('canNavigateTo settings requires title', () => {
    expect(component.canNavigateTo('settings')).toBe(false);
    component.onTopicUpdate({ title: 'New Topic' });
    expect(component.canNavigateTo('settings')).toBe(true);
  });

  it('transitionToSettings creates topic if none exists', () => {
    component.onTopicUpdate({ title: 'Test' });
    component.transitionToSettings();
    expect(mockTopicService.save).toHaveBeenCalled();
  });

  it('transitionToSettings skips save if topic already has id', () => {
    component.topic.set({ id: 'existing-id', title: 'Test' });
    component.transitionToSettings();
    expect(mockTopicService.save).not.toHaveBeenCalled();
    expect(component.currentStep()).toBe('settings');
  });

  it('saveAsDraft calls save and shows success', () => {
    component.topic.set({ title: 'Draft Topic' });
    component.saveAsDraft();
    expect(mockTopicService.save).toHaveBeenCalled();
    expect(mockNotificationService.showRaw).toHaveBeenCalledWith('success', expect.any(String));
  });

  it('publishTopic sets status to inProgress', () => {
    component.topic.set({ title: 'New Topic', id: 'topic-1' });
    component.publishTopic();
    expect(mockTopicService.save).toHaveBeenCalledWith(expect.objectContaining({ status: 'inProgress' }));
  });
});
