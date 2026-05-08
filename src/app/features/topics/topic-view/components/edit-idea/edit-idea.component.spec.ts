import { TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runInInjectionContext, EnvironmentInjector } from '@angular/core';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

import { EditIdeaComponent } from './edit-idea.component';
import { TopicIdeationService } from '../../../../../core/services/topic-ideation.service';
import { IdeaAttachmentService } from '../../../../../core/services/idea-attachment.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { UploadService } from '../../../../../core/services/upload.service';

const mockTopic = { id: 't1' } as any;
const mockIdeation = { id: 'i1', allowAnonymous: false, demographicsConfig: null } as any;
const mockIdea = { id: 'idea1', statement: 'Old statement', description: 'Old description', status: 'draft', ideationId: 'i1' } as any;

const mockIdeationService = {
  updateIdea: vi.fn().mockReturnValue(of({ ...mockIdea, statement: 'New statement' })),
};
const mockAttachmentService = {
  getItems: vi.fn().mockReturnValue(of({ rows: [], countTotal: 0 })),
  delete: vi.fn().mockReturnValue(of({})),
};
const mockNotification = { addError: vi.fn() };
const mockUpload = { uploadIdeaImage: vi.fn() };

describe('EditIdeaComponent', () => {
  let injector: EnvironmentInjector;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: TopicIdeationService, useValue: mockIdeationService },
        { provide: IdeaAttachmentService, useValue: mockAttachmentService },
        { provide: NotificationService, useValue: mockNotification },
        { provide: UploadService, useValue: mockUpload },
      ],
    });
    injector = TestBed.inject(EnvironmentInjector);
  });

  function makeComp() {
    return runInInjectionContext(injector, () => {
      const comp = new EditIdeaComponent();
      (comp as any).topic = vi.fn().mockReturnValue(mockTopic);
      (comp as any).ideation = vi.fn().mockReturnValue(mockIdeation);
      (comp as any).idea = vi.fn().mockReturnValue(mockIdea);
      comp.ngOnInit();
      return comp;
    });
  }

  it('should instantiate and load data', () => {
    const comp = makeComp();
    expect(comp).toBeTruthy();
    expect(comp.statement()).toBe('Old statement');
    expect(comp.description()).toBe('Old description');
    expect(mockAttachmentService.getItems).toHaveBeenCalled();
  });

  it('publish calls updateIdea and emits ideaUpdated', () => {
    const comp = makeComp();
    const emitSpy = vi.spyOn(comp.ideaUpdated, 'emit');
    comp.onStatementChange('New statement');
    comp.publish();
    expect(mockIdeationService.updateIdea).toHaveBeenCalledWith(expect.objectContaining({
      ideaId: 'idea1',
      statement: 'New statement',
      status: 'published'
    }));
    expect(emitSpy).toHaveBeenCalled();
  });

  it('close emits closed event', () => {
    const comp = makeComp();
    const emitSpy = vi.spyOn(comp.closed, 'emit');
    comp.close();
    expect(emitSpy).toHaveBeenCalled();
  });
});
