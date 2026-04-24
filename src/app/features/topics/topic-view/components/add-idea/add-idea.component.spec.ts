import { TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runInInjectionContext, EnvironmentInjector } from '@angular/core';
import { AddIdeaComponent } from './add-idea.component';
import { TopicIdeationService } from '../../../../../core/services/topic-ideation.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

const mockTopic = { id: 't1', status: 'ideation', country: 'EE' } as any;
const mockIdeation = { id: 'i1', allowAnonymous: false, demographicsConfig: null } as any;

const mockCreatedIdea = { id: 'new-idea', status: 'published' } as any;
const mockIdeationService = {
  createIdea: vi.fn().mockReturnValue(of(mockCreatedIdea)),
  updateIdea: vi.fn().mockReturnValue(of(mockCreatedIdea)),
};
const mockNotification = { addError: vi.fn() };

describe('AddIdeaComponent', () => {
  let injector: EnvironmentInjector;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: TopicIdeationService, useValue: mockIdeationService },
        { provide: NotificationService, useValue: mockNotification },
      ],
    });
    injector = TestBed.inject(EnvironmentInjector);
  });

  function makeComp() {
    return runInInjectionContext(injector, () => {
      const comp = new AddIdeaComponent();
      (comp as any).topic = vi.fn().mockReturnValue(mockTopic);
      (comp as any).ideation = vi.fn().mockReturnValue(mockIdeation);
      return comp;
    });
  }

  it('should instantiate', () => {
    expect(makeComp()).toBeTruthy();
  });

  it('statement starts empty', () => {
    expect(makeComp().statement()).toBe('');
  });

  it('description starts empty', () => {
    expect(makeComp().description()).toBe('');
  });

  it('publish with empty fields sets errors and does not call service', () => {
    const comp = makeComp();
    comp.publish();
    expect(comp.errors()['statement']).toBeTruthy();
    expect(mockIdeationService.createIdea).not.toHaveBeenCalled();
  });

  it('publish with valid fields calls createIdea and emits ideaAdded', () => {
    const comp = makeComp();
    const emitSpy = vi.spyOn(comp.ideaAdded, 'emit');
    comp.onStatementChange('My statement');
    comp.onDescriptionChange('My description');
    comp.publish();
    expect(mockIdeationService.createIdea).toHaveBeenCalledWith(expect.objectContaining({
      topicId: 't1',
      ideationId: 'i1',
      statement: 'My statement',
      description: 'My description',
      status: 'published',
    }));
    expect(emitSpy).toHaveBeenCalledWith(mockCreatedIdea);
  });

  it('saveDraft calls createIdea with draft status', () => {
    const comp = makeComp();
    comp.onStatementChange('Draft title');
    comp.saveDraft();
    expect(mockIdeationService.createIdea).toHaveBeenCalledWith(expect.objectContaining({ status: 'draft' }));
  });

  it('close emits closed event', () => {
    const comp = makeComp();
    const emitSpy = vi.spyOn(comp.closed, 'emit');
    comp.close();
    expect(emitSpy).toHaveBeenCalled();
  });
});
