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

  it('when allowAnonymous is toggled on, disableReplies should also become true', () => {
    vi.spyOn(component, 'ideation').mockReturnValue({ allowAnonymous: true, disableReplies: false } as any);
    const spy = vi.spyOn(component.ideationUpdate, 'emit');
    component.onToggleAnonymous();
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ disableReplies: true }));
  });
});
