import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { StepVoteSettingsComponent } from './step-vote-settings.component';
import { TopicIdeationService } from '../../../../../core/services/topic-ideation.service';
import { TopicService } from '../../../../../core/services/topic.service';
import { Vote } from '../../../../../core/interfaces/vote';

describe('StepVoteSettingsComponent (business logic)', () => {
  let component: StepVoteSettingsComponent;

  const defaultVote: Partial<Vote> = {
    question: '',
    type: 'regular',
    options: [{ value: 'Yes' }, { value: 'No' }],
    authType: 'soft',
    delegationIsAllowed: false
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: TopicIdeationService, useValue: { getIdeas: vi.fn(), getFolders: vi.fn() } },
        { provide: TopicService, useValue: { canEditDescription: vi.fn().mockReturnValue(true) } }
      ]
    });
    component = TestBed.runInInjectionContext(() => new StepVoteSettingsComponent());
    // Mock the required input signal
    vi.spyOn(component, 'vote').mockReturnValue(defaultVote as unknown as Vote);
    vi.spyOn(component, 'topic').mockReturnValue({} as unknown as import('../../../../../core/interfaces/topic').Topic);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit voteUpdate when onUpdate is called', () => {
    const spy = vi.spyOn(component.voteUpdate, 'emit');
    component.onUpdate({ question: 'New?' });
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ question: 'New?' }));
  });

  it('should switch to multiple type and reset options', () => {
    const spy = vi.spyOn(component.voteUpdate, 'emit');
    component.setType('multiple');
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({
      type: 'multiple',
      options: [{ value: '' }, { value: '' }]
    }));
  });

  it('isValid should return true with question and >=2 options', () => {
    vi.spyOn(component, 'vote').mockReturnValue({
      question: 'Q?',
      options: [{ value: 'Y' }, { value: 'N' }]
    } as unknown as Vote);
    expect(component.isValid()).toBe(true);
  });
});
