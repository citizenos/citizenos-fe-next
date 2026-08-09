import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { StepIdeationSettingsComponent } from './step-ideation-settings.component';
import { Ideation } from '../../../../../core/interfaces/ideation';
import { TranslateModule } from '@ngx-translate/core';

describe('StepIdeationSettingsComponent (business logic)', () => {
  let component: StepIdeationSettingsComponent;
  let fixture: ComponentFixture<StepIdeationSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), StepIdeationSettingsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(StepIdeationSettingsComponent);
    component = fixture.componentInstance;
    // Provide a default value for the required model
    fixture.componentRef.setInput('ideation', { question: '', allowAnonymous: false, disableReplies: false });
    fixture.detectChanges();
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
    fixture.componentRef.setInput('ideation', { question: 'What do you think?', allowAnonymous: false, disableReplies: false });
    const spy = vi.spyOn(component.ideationUpdate, 'emit');
    component.onIdeationUpdate();
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ question: 'What do you think?' }));
  });

  it('when allowAnonymous is toggled on, disableReplies should also become true', () => {
    fixture.componentRef.setInput('ideation', { allowAnonymous: false, disableReplies: false });
    const spy = vi.spyOn(component.ideationUpdate, 'emit');
    component.onToggleAnonymous();
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ disableReplies: true }));
  });

  it('when allowAnonymous is toggled off, should not force disableReplies', () => {
    fixture.componentRef.setInput('ideation', { allowAnonymous: true, disableReplies: false });
    const spy = vi.spyOn(component.ideationUpdate, 'emit');
    component.onToggleAnonymous();
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ disableReplies: false }));
  });

  it('when allowAnonymous is on but disableReplies already true, should not force-override', () => {
    fixture.componentRef.setInput('ideation', { allowAnonymous: false, disableReplies: true });
    const spy = vi.spyOn(component.ideationUpdate, 'emit');
    component.onToggleAnonymous();
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ disableReplies: true }));
  });
});
