import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { TopicAttachmentsComponent } from './topic-attachments.component';
import { TopicService } from '../../../core/services/topic.service';
import { UploadService } from '../../../core/services/upload.service';
import { NotificationService } from '../../../core/services/notification.service';
import { of } from 'rxjs';

describe('TopicAttachmentsComponent (business logic)', () => {
  let component: TopicAttachmentsComponent;
  const mockTopicService = {
    loadAttachments: vi.fn().mockReturnValue(of([])),
    updateAttachment: vi.fn().mockReturnValue(of({})),
    deleteAttachment: vi.fn().mockReturnValue(of({}))
  };
  const mockUploadService = {
    upload: vi.fn().mockReturnValue(of({ id: 'new-id', name: 'test.pdf' }))
  };
  const mockNotificationService = {
    showRaw: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: TopicService, useValue: mockTopicService },
        { provide: UploadService, useValue: mockUploadService },
        { provide: NotificationService, useValue: mockNotificationService }
      ]
    });
    component = TestBed.runInInjectionContext(() => new TopicAttachmentsComponent());
    // @ts-expect-error - setting required input
    component.topic = () => ({ id: 'topic-1' });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load attachments on init', () => {
    component.ngOnInit();
    expect(mockTopicService.loadAttachments).toHaveBeenCalledWith('topic-1');
  });

  it('should call uploadService.upload with /upload path on onUpload', () => {
    const mockFile = new File(['hello'], 'test.pdf', { type: 'application/pdf' });
    const mockInputElement = {
      files: [mockFile]
    };
    component.attachmentInput = {
      nativeElement: mockInputElement
    } as any;

    component.onUpload();

    expect(mockUploadService.upload).toHaveBeenCalledWith(
      '/api/users/self/topics/topic-1/attachments/upload',
      mockFile,
      { name: 'test.pdf' }
    );
    expect(component.attachments()).toEqual([{ id: 'new-id', name: 'test.pdf' }]);
  });
});
