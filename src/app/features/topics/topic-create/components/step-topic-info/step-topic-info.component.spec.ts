import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { StepTopicInfoComponent } from './step-topic-info.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { Topic } from '../../../../../core/interfaces/topic';

describe('StepTopicInfoComponent', () => {
  let component: StepTopicInfoComponent;
  let fixture: ComponentFixture<StepTopicInfoComponent>;

  const mockTopic: Partial<Topic> = {
    title: '',
    intro: '',
    imageUrl: null
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        StepTopicInfoComponent,
        TranslateModule.forRoot(),
        FormsModule
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(StepTopicInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit topicUpdate on title change', () => {
    const emitSpy = vi.spyOn(component.topicUpdate, 'emit');
    component.onUpdate({ title: 'New Title' });
    expect(emitSpy).toHaveBeenCalledWith({ title: 'New Title' });
  });

  it('should disable next button if title is missing', () => {
    fixture.componentRef.setInput('topic', { ...mockTopic, title: '' });
    fixture.detectChanges();
    const nextBtn = fixture.nativeElement.querySelector('.btn-primary');
    expect(nextBtn.disabled).toBe(true);
  });

  it('should enable next button if title is present', async () => {
    fixture.componentRef.setInput('topic', { ...mockTopic, title: 'Valid Title' });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const nextBtn = fixture.nativeElement.querySelector('.btn-primary');
    expect(nextBtn.disabled).toBe(false);
  });

  it('should emit imageFileUpdate when image is chosen', () => {
    const emitSpy = vi.spyOn(component.imageFileUpdate, 'emit');
    const mockFile = new File([''], 'test.png', { type: 'image/png' });
    component.onImageChange(mockFile);
    expect(emitSpy).toHaveBeenCalledWith(mockFile);
  });
});
