import { TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runInInjectionContext, EnvironmentInjector } from '@angular/core';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

import { EditIdeaComponent } from './edit-idea.component';
import { TopicIdeationService, IdeaStatus } from '../../../../../core/services/topic-ideation.service';
import { IdeaAttachmentService } from '../../../../../core/services/idea-attachment.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { UploadService } from '../../../../../core/services/upload.service';
import { UserStore } from '../../../../../core/state/user.store';
import { ConfigStore } from '../../../../../core/state/config.store';
import { DialogService } from '../../../../../shared/dialog/dialog.service';
import { Topic } from '../../../../../core/interfaces/topic';
import { Ideation } from '../../../../../core/interfaces/ideation';
import { Idea } from '../../../../../core/interfaces/idea';
import { Attachment } from '../../../../../core/interfaces/attachment';
import { signal } from '@angular/core';

const mockTopic = { id: 't1', country: null } as unknown as Topic;
const mockIdeation = { id: 'i1', allowAnonymous: false, demographicsConfig: null, template: '' } as unknown as Ideation;
const mockIdea = {
  id: 'idea1',
  statement: 'Old statement',
  description: 'Old description',
  status: IdeaStatus.draft,
  ideationId: 'i1',
  demographics: null,
} as unknown as Idea;

const mockIdeationService = {
  updateIdea: vi.fn().mockReturnValue(of({ ...mockIdea, statement: 'New statement' })),
  deleteIdea: vi.fn().mockReturnValue(of({})),
};
const mockAttachmentService = {
  getItems: vi.fn().mockReturnValue(of({ rows: [], countTotal: 0 })),
  delete: vi.fn().mockReturnValue(of({})),
};
const mockNotification = { error: vi.fn() };
const mockUpload = { upload: vi.fn().mockReturnValue(of({ link: 'http://example.com/img.jpg' })) };
const mockUserStore = { isAuthenticated: vi.fn().mockReturnValue(true) };
const mockConfigStore = { api: { baseUrl: vi.fn().mockReturnValue('http://api') } };
const mockDialog = { open: vi.fn().mockReturnValue({ afterClosed: () => of(true) }) };

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
        { provide: UserStore, useValue: mockUserStore },
        { provide: ConfigStore, useValue: mockConfigStore },
        { provide: DialogService, useValue: mockDialog },
      ],
    });
    injector = TestBed.inject(EnvironmentInjector);
  });

  function makeComp(idea = mockIdea, ideation = mockIdeation) {
    return runInInjectionContext(injector, () => {
      const comp = new EditIdeaComponent();
      (comp as unknown as { topic: unknown }).topic = signal(mockTopic);
      (comp as unknown as { ideation: unknown }).ideation = signal(ideation);
      (comp as unknown as { idea: unknown }).idea = signal(idea);
      comp.ngOnInit();
      return comp;
    });
  }

  it('instantiates and loads existing idea data', () => {
    const comp = makeComp();
    expect(comp).toBeTruthy();
    expect(comp.statement()).toBe('Old statement');
    expect(comp.description()).toBe('Old description');
    expect(mockAttachmentService.getItems).toHaveBeenCalled();
  });

  it('loads attachments on init', () => {
    makeComp();
    expect(mockAttachmentService.getItems).toHaveBeenCalledWith(expect.objectContaining({
      topicId: 't1',
      ideationId: 'i1',
      ideaId: 'idea1',
    }));
  });

  it('isDraft returns true for draft ideas', () => {
    const comp = makeComp();
    expect(comp.isDraft()).toBe(true);
  });

  it('isDraft returns false for published ideas', () => {
    const comp = makeComp({ ...mockIdea, status: IdeaStatus.published });
    expect(comp.isDraft()).toBe(false);
  });

  it('onStatementChange updates statement signal', () => {
    const comp = makeComp();
    comp.onStatementChange('New text');
    expect(comp.statement()).toBe('New text');
  });

  it('onDescriptionChange updates description signal', () => {
    const comp = makeComp();
    comp.onDescriptionChange('New body');
    expect(comp.description()).toBe('New body');
  });

  it('publish calls updateIdea and emits ideaUpdated', () => {
    const comp = makeComp();
    const emitSpy = vi.spyOn(comp.ideaUpdated, 'emit');
    comp.onStatementChange('New statement');
    comp.onDescriptionChange('Valid description');
    comp.publish();
    expect(mockIdeationService.updateIdea).toHaveBeenCalledWith(expect.objectContaining({
      ideaId: 'idea1',
      status: IdeaStatus.published,
    }));
    expect(emitSpy).toHaveBeenCalled();
  });

  it('publish does not call updateIdea when statement is empty', () => {
    const comp = makeComp();
    comp.onStatementChange('');
    comp.onDescriptionChange('');
    comp.publish();
    expect(mockIdeationService.updateIdea).not.toHaveBeenCalled();
    expect(comp.errors()['statement']).toBeTruthy();
  });

  it('saveDraft calls updateIdea with draft status', () => {
    const comp = makeComp();
    comp.saveDraft();
    expect(mockIdeationService.updateIdea).toHaveBeenCalledWith(expect.objectContaining({
      status: IdeaStatus.draft,
    }));
  });

  it('deleteDraft calls deleteIdea and emits closed', () => {
    const comp = makeComp();
    const emitSpy = vi.spyOn(comp.closed, 'emit');
    comp.deleteDraft();
    expect(mockIdeationService.deleteIdea).toHaveBeenCalledWith(expect.objectContaining({
      topicId: 't1',
      ideaId: 'idea1',
    }));
    expect(emitSpy).toHaveBeenCalled();
  });

  it('close emits closed event when no autosave in progress', () => {
    const comp = makeComp();
    const emitSpy = vi.spyOn(comp.closed, 'emit');
    comp.close();
    expect(emitSpy).toHaveBeenCalled();
  });

  it('removeNewImage removes the image at given index', () => {
    const comp = makeComp();
    comp.newImages.set([{ file: new File([], 'a.jpg'), link: 'data:a', name: 'a.jpg' }, { file: new File([], 'b.jpg'), link: 'data:b', name: 'b.jpg' }]);
    comp.removeNewImage(0);
    expect(comp.newImages()).toHaveLength(1);
    expect(comp.newImages()[0].name).toBe('b.jpg');
  });

  it('removeImage calls attachmentService.delete and removes from list', () => {
    const comp = makeComp();
    const mockAttachment = { id: 'att1', name: 'img.jpg', link: 'http://x.com/img.jpg' } as Attachment;
    comp.images.set([mockAttachment]);
    comp.removeImage(mockAttachment, 0);
    expect(mockAttachmentService.delete).toHaveBeenCalledWith(expect.objectContaining({
      attachmentId: 'att1',
    }));
    expect(comp.images()).toHaveLength(0);
  });

  it('loggedIn returns true when authenticated', () => {
    const comp = makeComp();
    expect(comp.loggedIn()).toBe(true);
  });

  it('opens anonymous dialog when ideation.allowAnonymous is true', () => {
    const anonIdeation = { ...mockIdeation, allowAnonymous: true };
    const comp = makeComp(mockIdea, anonIdeation);
    comp.onStatementChange('S');
    comp.onDescriptionChange('D');
    comp.publish();
    expect(mockDialog.open).toHaveBeenCalledWith(expect.anything());
  });

  it('getDemographicKeys returns empty array when no config', () => {
    const comp = makeComp();
    expect(comp.getDemographicKeys()).toEqual([]);
  });

  it('getDemographicKeys returns keys from demographicsConfig', () => {
    const ideationWithDemo = { ...mockIdeation, demographicsConfig: { age: { required: true }, gender: { required: false } } };
    const comp = makeComp(mockIdea, ideationWithDemo);
    expect(comp.getDemographicKeys()).toContain('age');
    expect(comp.getDemographicKeys()).toContain('gender');
  });

  it('setResidenceValue updates residenceValue signal', () => {
    const comp = makeComp();
    comp.setResidenceValue('Tallinn');
    expect(comp.residenceValue()).toBe('Tallinn');
    expect(comp.residenceError()).toBe(false);
  });

  it('setGenderValue updates genderValue signal', () => {
    const comp = makeComp();
    comp.setGenderValue('female');
    expect(comp.genderValue()).toBe('female');
    expect(comp.genderError()).toBe(false);
  });

  it('numberOnly allows digit keycodes', () => {
    const comp = makeComp();
    const digitEvent = { which: 53, keyCode: 53 } as KeyboardEvent; // '5'
    expect(comp.numberOnly(digitEvent)).toBe(true);
  });

  it('numberOnly blocks letter keycodes', () => {
    const comp = makeComp();
    const letterEvent = { which: 65, keyCode: 65 } as KeyboardEvent; // 'a'
    expect(comp.numberOnly(letterEvent)).toBe(false);
  });
});
