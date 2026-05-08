import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { StepIdeationSettingsComponent } from './step-ideation-settings.component';

describe('StepIdeationSettingsComponent (business logic)', () => {
  let component: StepIdeationSettingsComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    component = TestBed.runInInjectionContext(() => new StepIdeationSettingsComponent());
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default ideation values', () => {
    expect(component.ideation().question).toBe('');
    expect(component.ideation().allowAnonymous).toBe(false);
    expect(component.ideation().disableReplies).toBe(false);
  });

  it('onIdeationUpdate() should emit the current ideation state', () => {
    vi.spyOn(component, 'ideation').mockReturnValue({ question: 'What do you think?', allowAnonymous: false, disableReplies: false } as any);
    const spy = vi.spyOn(component.ideationUpdate, 'emit');
    component.onIdeationUpdate();
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ question: 'What do you think?' }));
  });

  it('when allowAnonymous is toggled on, disableReplies should also become true', () => {
    vi.spyOn(component, 'ideation').mockReturnValue({ allowAnonymous: true, disableReplies: false } as any);
    const spy = vi.spyOn(component.ideationUpdate, 'emit');
    component.onToggleAnonymous();
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ disableReplies: true }));
  });

  it('when allowAnonymous is toggled off, should not force disableReplies', () => {
    vi.spyOn(component, 'ideation').mockReturnValue({ allowAnonymous: false, disableReplies: false } as any);
    const spy = vi.spyOn(component.ideationUpdate, 'emit');
    component.onToggleAnonymous();
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ disableReplies: false }));
  });

  it('when allowAnonymous is on but disableReplies already true, should not force-override', () => {
    vi.spyOn(component, 'ideation').mockReturnValue({ allowAnonymous: true, disableReplies: true } as any);
    const spy = vi.spyOn(component.ideationUpdate, 'emit');
    component.onToggleAnonymous();
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ disableReplies: true }));
  });
});
