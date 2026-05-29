import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateWizardShellComponent } from './create-wizard-shell.component';
import { TranslateModule } from '@ngx-translate/core';
import { Component, Input, output } from '@angular/core';
import { TopicService } from '../../../core/services/topic.service';

@Component({ selector: 'cos-domain-icon', standalone: true, template: '' })
class MockDomainIconComponent { @Input() type?: string; }

@Component({ selector: 'cos-step-navigator', standalone: true, template: '' })
class MockStepNavigatorComponent {
  @Input() steps: { key: string; label: string }[] = [];
  @Input() currentStep = '';
  stepChange = output<string>();
}

@Component({ selector: 'cos-icon', standalone: true, template: '' })
class MockIconComponent { @Input() name = ''; @Input() size?: string | number; }

const MOCK_STEPS = [
  { key: 'step1', label: 'Step 1' },
  { key: 'step2', label: 'Step 2' }
];

describe('CreateWizardShellComponent', () => {
  let component: CreateWizardShellComponent;
  let fixture: ComponentFixture<CreateWizardShellComponent>;

  const mockTopicService = {
    getDownloadUrl: vi.fn().mockReturnValue('http://api/dl/topic-1'),
    canDelete: vi.fn().mockReturnValue(true)
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateWizardShellComponent, TranslateModule.forRoot()],
      providers: [
        { provide: TopicService, useValue: mockTopicService }
      ]
    })
    .overrideComponent(CreateWizardShellComponent, {
      set: { imports: [TranslateModule, MockDomainIconComponent, MockStepNavigatorComponent, MockIconComponent] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateWizardShellComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('domainType', 'topic');
    fixture.componentRef.setInput('headingKey', 'CREATE_HEADING');
    fixture.componentRef.setInput('steps', MOCK_STEPS);
    fixture.componentRef.setInput('currentStep', 'step1');
    fixture.componentRef.setInput('topic', { id: 'topic-1' });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute isFirstStep correctly', () => {
    expect(component.isFirstStep()).toBe(true);
    fixture.componentRef.setInput('currentStep', 'step2');
    expect(component.isFirstStep()).toBe(false);
  });

  it('should compute isLastStep correctly', () => {
    expect(component.isLastStep()).toBe(false);
    fixture.componentRef.setInput('currentStep', 'step2');
    expect(component.isLastStep()).toBe(true);
  });

  it('should not render back button on first step', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.btn_medium_submit_ghost')).toBeFalsy();
  });

  it('should render back button on non-first step', async () => {
    fixture.componentRef.setInput('currentStep', 'step2');
    fixture.detectChanges();
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.btn_medium_submit_ghost')).toBeTruthy();
  });

  it('should emit footerBack when back button clicked', async () => {
    fixture.componentRef.setInput('currentStep', 'step2');
    fixture.detectChanges();
    await fixture.whenStable();
    const spy = vi.fn();
    component.footerBack.subscribe(spy);
    const el: HTMLElement = fixture.nativeElement;
    const backBtn = el.querySelector<HTMLButtonElement>('.btn_medium_submit_ghost');
    backBtn?.click();
    expect(spy).toHaveBeenCalled();
  });

  it('should emit saveDraft when save draft clicked', () => {
    const spy = vi.fn();
    component.saveDraft.subscribe(spy);
    const el: HTMLElement = fixture.nativeElement;
    const btn = el.querySelector<HTMLButtonElement>('.btn_medium_secondary');
    btn?.click();
    expect(spy).toHaveBeenCalled();
  });

  it('should emit footerContinue when continue clicked', () => {
    const spy = vi.fn();
    component.footerContinue.subscribe(spy);
    const el: HTMLElement = fixture.nativeElement;
    const btn = el.querySelector<HTMLButtonElement>('.btn_medium_submit');
    btn?.click();
    expect(spy).toHaveBeenCalled();
  });

  it('should show sidebar slot when hasSidebar is true', async () => {
    fixture.componentRef.setInput('hasSidebar', true);
    fixture.detectChanges();
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.wizard-sidebar')).toBeTruthy();
  });

  it('should not show sidebar when hasSidebar is false', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.wizard-sidebar')).toBeFalsy();
  });

  it('should call topicService.getDownloadUrl with correct topic id', () => {
    expect(component.getDownloadUrl()).toBe('http://api/dl/topic-1');
    expect(mockTopicService.getDownloadUrl).toHaveBeenCalledWith('topic-1');
  });
});
