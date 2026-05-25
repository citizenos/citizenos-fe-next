import { TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signal } from '@angular/core';
import { runInInjectionContext, EnvironmentInjector } from '@angular/core';
import { AddIdeaComponent } from './add-idea.component';
import { TopicIdeationService } from '../../../../../core/services/topic-ideation.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { Topic } from '../../../../../core/interfaces/topic';
import { Ideation } from '../../../../../core/interfaces/ideation';
import { Idea } from '../../../../../core/interfaces/idea';

const mockTopic = { id: 't1', status: 'ideation', country: 'EE' } as Topic;
const mockIdeation = { id: 'i1', allowAnonymous: false, demographicsConfig: null } as Ideation;

const mockCreatedIdea = { id: 'new-idea', status: 'published' } as Idea;
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
      (comp as unknown as { topic: unknown }).topic = signal(mockTopic);
      (comp as unknown as { ideation: unknown }).ideation = signal(mockIdeation);
      return comp;
    });
  }

  it('should instantiate', () => {
    expect(makeComp()).toBeTruthy();
  });

  it('statement starts empty', () => {
    expect(makeComp().ideaForm.get('statement')?.value).toBe('');
  });

  it('description starts empty', () => {
    expect(makeComp().ideaForm.get('description')?.value).toBe('');
  });

  it('publish with empty fields sets errors and does not call service', () => {
    const comp = makeComp();
    comp.publishIdea();
    expect(comp.ideaForm.invalid).toBe(true);
    expect(mockIdeationService.createIdea).not.toHaveBeenCalled();
  });

  it('publish with valid fields calls createIdea and emits ideaAdded', () => {
    const comp = makeComp();
    const emitSpy = vi.spyOn(comp.ideaAdded, 'emit');
    comp.ideaForm.patchValue({
      statement: 'My statement',
      description: 'My description'
    });
    comp.publishIdea();
    expect(mockIdeationService.createIdea).toHaveBeenCalledWith(expect.objectContaining({
      topicId: 't1',
      ideationId: 'i1',
      statement: 'My statement',
      description: 'My description',
      status: 'published',
    }));
    expect(emitSpy).toHaveBeenCalledWith(mockCreatedIdea);
  });

  it('saveDraft does not fail', () => {
    const comp = makeComp();
    comp.saveDraft();
    expect(comp).toBeTruthy();
  });

  it('close sets isOpen to false', () => {
    const comp = makeComp();
    comp.isOpen.set(true);
    comp.close();
    expect(comp.isOpen()).toBe(false);
  });
});
