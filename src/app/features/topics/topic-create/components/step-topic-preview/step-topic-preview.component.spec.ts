import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { StepTopicPreviewComponent } from './step-topic-preview.component';
import { Topic } from '../../../../../core/interfaces/topic';

describe('StepTopicPreviewComponent', () => {
  let component: StepTopicPreviewComponent;
  let fixture: ComponentFixture<StepTopicPreviewComponent>;

  const mockTopic: Partial<Topic> = { title: 'Preview Topic', description: '' };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepTopicPreviewComponent, TranslateModule.forRoot()],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(StepTopicPreviewComponent, {
      set: { imports: [TranslateModule], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(StepTopicPreviewComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('topic', mockTopic);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit previous', () => {
    const spy = vi.spyOn(component.previous, 'emit');
    component.previous.emit();
    expect(spy).toHaveBeenCalled();
  });

  it('should emit save on publish', () => {
    const spy = vi.spyOn(component.save, 'emit');
    component.save.emit();
    expect(spy).toHaveBeenCalled();
  });
});
