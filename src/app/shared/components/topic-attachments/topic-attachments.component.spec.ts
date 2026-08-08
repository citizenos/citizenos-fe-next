import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { TopicAttachmentsComponent } from './topic-attachments.component';
import { TopicService } from '../../../core/services/topic.service';
import { UploadService } from '../../../core/services/upload.service';
import { NotificationService } from '../../../core/services/notification.service';
import { of } from 'rxjs';
import { ElementRef } from '@angular/core';

describe('TopicAttachmentsComponent (business logic)', () => {
  let component: TopicAttachmentsComponent;
  const mockTopicService = {
    loadAttachments: vi.fn().mockReturnValue(of([])),
    updateAttachment: vi.fn().mockReturnValue(of({})),
    deleteAttachment: vi.fn().mockReturnValue(of({})),
    saveAttachment: vi.fn().mockReturnValue(of({ id: 'saved-id', name: 'saved.pdf' }))
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
    } as unknown as ElementRef<HTMLInputElement>;

    component.onUpload();

    expect(mockUploadService.upload).toHaveBeenCalledWith(
      '/api/users/self/topics/topic-1/attachments/upload',
      mockFile,
      { name: 'test.pdf', type: 'pdf', source: 'upload' }
    );
    expect(component.attachments()).toEqual([{ id: 'new-id', name: 'test.pdf' }]);
  });

  it('should save attachment and add to list on doSaveAttachment', () => {
    component.doSaveAttachment({ name: 'saved.pdf' });
    expect(mockTopicService.saveAttachment).toHaveBeenCalledWith('topic-1', { name: 'saved.pdf' });
    expect(component.attachments()).toContainEqual({ id: 'saved-id', name: 'saved.pdf' });
  });

  it('should open Dropbox chooser and save chosen file on dropboxSelect', () => {
    const mockDropbox = {
      choose: vi.fn().mockImplementation((options) => {
        options.success([{ name: 'db.pdf', bytes: 100, link: 'https://db.link' }]);
      })
    };
    (globalThis as unknown as { Dropbox: unknown }).Dropbox = mockDropbox;

    component.dropboxSelect();
    expect(mockDropbox.choose).toHaveBeenCalled();
    expect(mockTopicService.saveAttachment).toHaveBeenCalledWith('topic-1', {
      name: 'db.pdf',
      type: 'pdf',
      source: 'dropbox',
      size: 100,
      link: 'https://db.link'
    });
  });

  it('should open OneDrive and save chosen file on oneDriveSelect', () => {
    const mockOneDrive = {
      open: vi.fn().mockImplementation((options) => {
        options.success({
          value: [{
            name: 'od.pdf',
            size: 200,
            permissions: [{ link: { webUrl: 'https://od.link' } }]
          }]
        });
      })
    };
    (globalThis as unknown as { OneDrive: unknown }).OneDrive = mockOneDrive;

    component.oneDriveSelect();
    expect(mockOneDrive.open).toHaveBeenCalled();
    expect(mockTopicService.saveAttachment).toHaveBeenCalledWith('topic-1', {
      name: 'od.pdf',
      type: 'pdf',
      source: 'onedrive',
      size: 200,
      link: 'https://od.link'
    });
  });
});
