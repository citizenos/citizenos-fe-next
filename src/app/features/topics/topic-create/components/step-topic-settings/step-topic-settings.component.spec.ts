import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Topic } from '../../../../../core/interfaces/topic';
import { StepTopicSettingsComponent } from './step-topic-settings.component';

describe('StepTopicSettingsComponent', () => {
  let component: StepTopicSettingsComponent;
  let fixture: ComponentFixture<StepTopicSettingsComponent>;

  const mockTopic: Partial<Topic> = {
    visibility: 'private',
    categories: [],
    country: null,
    language: null
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepTopicSettingsComponent, TranslateModule.forRoot()],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(StepTopicSettingsComponent, {
      set: { imports: [TranslateModule], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(StepTopicSettingsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('topic', mockTopic);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit topicUpdate when visibility changes', () => {
    const spy = vi.spyOn(component.topicUpdate, 'emit');
    component.onUpdate({ visibility: 'public' });
    expect(spy).toHaveBeenCalledWith({ visibility: 'public' });
  });

  it('should emit next', () => {
    const spy = vi.spyOn(component.next, 'emit');
    component.next.emit();
    expect(spy).toHaveBeenCalled();
  });

  it('should emit previous', () => {
    const spy = vi.spyOn(component.previous, 'emit');
    component.previous.emit();
    expect(spy).toHaveBeenCalled();
  });
});
