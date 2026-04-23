import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { StepIdeationSettingsComponent } from './step-ideation-settings.component';
import { Ideation } from '../../../../../core/interfaces/ideation';

describe('StepIdeationSettingsComponent', () => {
  let component: StepIdeationSettingsComponent;
  let fixture: ComponentFixture<StepIdeationSettingsComponent>;

  const mockIdeation: Partial<Ideation> = {
    question: '',
    allowAnonymous: false,
    disableReplies: false
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepIdeationSettingsComponent, TranslateModule.forRoot(), FormsModule],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(StepIdeationSettingsComponent, {
      set: { imports: [TranslateModule, FormsModule], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(StepIdeationSettingsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('ideation', mockIdeation);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit ideationUpdate when question changes', () => {
    const spy = vi.spyOn(component.ideationUpdate, 'emit');
    component.onIdeationUpdate();
    expect(spy).toHaveBeenCalledWith(mockIdeation);
  });

  it('when allowAnonymous is toggled on, disableReplies should also become true', () => {
    fixture.componentRef.setInput('ideation', { ...mockIdeation, allowAnonymous: true });
    const spy = vi.spyOn(component.ideationUpdate, 'emit');
    component.onToggleAnonymous();
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ disableReplies: true }));
  });

  it('should emit next and previous', () => {
    const nextSpy = vi.spyOn(component.next, 'emit');
    const prevSpy = vi.spyOn(component.previous, 'emit');
    component.next.emit();
    component.previous.emit();
    expect(nextSpy).toHaveBeenCalled();
    expect(prevSpy).toHaveBeenCalled();
  });
});
