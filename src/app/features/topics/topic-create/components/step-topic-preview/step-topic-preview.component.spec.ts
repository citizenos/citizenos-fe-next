import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { StepTopicPreviewComponent } from './step-topic-preview.component';
import { runInInjectionContext } from '@angular/core';

describe('StepTopicPreviewComponent', () => {
  let component: StepTopicPreviewComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    component = TestBed.runInInjectionContext(() => new StepTopicPreviewComponent());
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default empty topic input', () => {
    expect(component.topic()).toEqual({ title: '', description: '' });
  });

  it('should have null ideation and vote by default', () => {
    expect(component.ideation()).toBeNull();
    expect(component.vote()).toBeNull();
  });
});
