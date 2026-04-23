import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { StepVoteSettingsComponent } from './step-vote-settings.component';
import { Vote } from '../../../../../core/interfaces/vote';

describe('StepVoteSettingsComponent', () => {
  let component: StepVoteSettingsComponent;
  let fixture: ComponentFixture<StepVoteSettingsComponent>;

  const mockVote: Partial<Vote> = {
    question: '',
    type: 'regular',
    authType: 'soft',
    options: [{ value: 'Yes' }, { value: 'No' }],
    delegationIsAllowed: false,
    autoClose: [],
    endsAt: null
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepVoteSettingsComponent, TranslateModule.forRoot(), FormsModule],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(StepVoteSettingsComponent, {
      set: { imports: [TranslateModule, FormsModule], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(StepVoteSettingsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('vote', mockVote);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit voteUpdate when question changes', () => {
    const spy = vi.spyOn(component.voteUpdate, 'emit');
    component.onUpdate({ question: 'New question?' });
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ question: 'New question?' }));
  });

  it('should switch to multiple type and reset to 2 empty options', () => {
    const spy = vi.spyOn(component.voteUpdate, 'emit');
    component.setType('multiple');
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ type: 'multiple', options: [{ value: '' }, { value: '' }] }));
  });

  it('should toggle predefined option', () => {
    const spy = vi.spyOn(component.voteUpdate, 'emit');
    component.togglePredefined('Neutral');
    const emitted = spy.mock.calls[0][0] as Partial<Vote>;
    expect(emitted.options?.some(o => o.value === 'Neutral')).toBe(true);
  });

  it('should add custom option', () => {
    fixture.componentRef.setInput('vote', { ...mockVote, type: 'multiple', options: [{ value: 'A' }] });
    const spy = vi.spyOn(component.voteUpdate, 'emit');
    component.addOption();
    const emitted = spy.mock.calls[0][0] as Partial<Vote>;
    expect(emitted.options?.length).toBe(2);
  });

  it('isValid should return false when question is empty', () => {
    fixture.componentRef.setInput('vote', { ...mockVote, question: '' });
    expect(component.isValid()).toBe(false);
  });

  it('isValid should return true with question and >=2 options', () => {
    fixture.componentRef.setInput('vote', { ...mockVote, question: 'A question?', options: [{ value: 'Yes' }, { value: 'No' }] });
    expect(component.isValid()).toBe(true);
  });

  it('should not allow delegation when authType is hard', () => {
    fixture.componentRef.setInput('vote', { ...mockVote, authType: 'hard', delegationIsAllowed: false });
    const spy = vi.spyOn(component.voteUpdate, 'emit');
    component.toggleDelegation();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should toggle delegation when authType is soft', () => {
    fixture.componentRef.setInput('vote', { ...mockVote, authType: 'soft', delegationIsAllowed: false });
    const spy = vi.spyOn(component.voteUpdate, 'emit');
    component.toggleDelegation();
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ delegationIsAllowed: true }));
  });

  it('should emit previous and next', () => {
    const prevSpy = vi.spyOn(component.previous, 'emit');
    const nextSpy = vi.spyOn(component.next, 'emit');
    component.previous.emit();
    component.next.emit();
    expect(prevSpy).toHaveBeenCalled();
    expect(nextSpy).toHaveBeenCalled();
  });
});
