import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { IdeationCreateComponent } from './ideation-create.component';
import { TopicService } from '../../../core/services/topic.service';
import { TopicIdeationService } from '../../../core/services/topic-ideation.service';
import { UploadService } from '../../../core/services/upload.service';
import { NotificationService } from '../../../core/services/notification.service';
import { of } from 'rxjs';

const mockTopic = { id: 'topic-1', title: 'Test', visibility: 'private', status: 'draft', categories: [] };
const mockIdeation = { id: 'ideation-1', question: '', allowAnonymous: false, disableReplies: false };
const mockTopicService = { save: vi.fn(), patch: vi.fn(), loadTopic: vi.fn() };
const mockIdeationService = { save: vi.fn(), update: vi.fn(), get: vi.fn() };
const mockUploadService = { upload: vi.fn() };
const mockNotificationService = { success: vi.fn(), showRaw: vi.fn() };

describe('IdeationCreateComponent (business logic)', () => {
  let component: IdeationCreateComponent;

  beforeEach(() => {
    vi.clearAllMocks();
    mockTopicService.save.mockReturnValue(of(mockTopic));
    mockTopicService.patch.mockReturnValue(of(mockTopic));
    mockTopicService.loadTopic.mockReturnValue(of(mockTopic));
    mockIdeationService.save.mockReturnValue(of(mockIdeation));
    mockIdeationService.update.mockReturnValue(of(mockIdeation));
    mockIdeationService.get.mockReturnValue(of(mockIdeation));

    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'topics/:id', component: class { } }]),
        { provide: TopicService, useValue: mockTopicService },
        { provide: TopicIdeationService, useValue: mockIdeationService },
        { provide: UploadService, useValue: mockUploadService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: ActivatedRoute, useValue: { snapshot: { params: {} } } }
      ]
    });
    component = TestBed.runInInjectionContext(() => new IdeationCreateComponent());
  });

  it('should start at info step', () => {
    expect(component.currentStep()).toBe('info');
  });

  it('saveToSettings should save topic and ideation if no id', () => {
    component.saveToSettings();
    expect(mockTopicService.save).toHaveBeenCalled();
  });

  it('saveToSettings should skip save if topic has id', () => {
    component.topicModel.set({ id: 'existing-id', title: 'Test' });
    component.saveToSettings();
    expect(mockTopicService.save).not.toHaveBeenCalled();
    expect(component.currentStep()).toBe('settings');
  });

  it('onTopicUpdate merges updates', () => {
    component.onTopicUpdate({ title: 'New Title' });
    expect(component.topicModel().title).toBe('New Title');
  });

  it('onIdeationUpdate merges updates', () => {
    component.onIdeationUpdate({ question: 'What do you think?' });
    expect(component.ideationModel().question).toBe('What do you think?');
  });

  it('onPublish patches topic with ideation status', () => {
    component.topicModel.set({ ...mockTopic });
    component.ideationModel.set({ id: 'ideation-1', question: 'A question' });
    component.onPublish();
    expect(mockTopicService.patch).toHaveBeenCalledWith(expect.objectContaining({ status: 'ideation' }));
  });
});
