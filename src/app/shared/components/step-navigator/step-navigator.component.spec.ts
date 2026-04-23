import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Component, ComponentRef } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { StepNavigatorComponent, StepConfig } from './step-navigator.component';
import { TranslateModule } from '@ngx-translate/core';

const mockSteps: StepConfig[] = [
  { key: 'info', label: 'STEP_1', icon: 'edit' },
  { key: 'settings', label: 'STEP_2', icon: 'settings' },
  { key: 'preview', label: 'STEP_3', icon: 'eye' },
];

// Host wrapper provides required inputs via template binding, avoiding NG0950
@Component({
  standalone: true,
  imports: [StepNavigatorComponent, TranslateModule],
  template: `<cos-step-navigator [steps]="steps" [currentStep]="currentStep"></cos-step-navigator>`,
})
class TestHostComponent {
  steps: StepConfig[] = mockSteps;
  currentStep = 'info';
}

describe('StepNavigatorComponent', () => {
  let hostFixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;
  let component: StepNavigatorComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, TranslateModule.forRoot()],
    }).compileComponents();

    hostFixture = TestBed.createComponent(TestHostComponent);
    hostComponent = hostFixture.componentInstance;
    hostFixture.detectChanges();
    component = hostFixture.debugElement.query(By.directive(StepNavigatorComponent)).componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render all steps', () => {
    const tabs = hostFixture.nativeElement.querySelectorAll('.step-tab');
    expect(tabs.length).toBe(3);
  });

  it('should mark current step as active', () => {
    const tabs = hostFixture.nativeElement.querySelectorAll('.step-tab');
    expect(tabs[0].classList.contains('active')).toBe(true);
    expect(tabs[1].classList.contains('active')).toBe(false);
  });

  it('should mark previous steps as completed', () => {
    hostComponent.currentStep = 'settings';
    hostFixture.detectChanges();
    const tabs = hostFixture.nativeElement.querySelectorAll('.step-tab');
    expect(tabs[0].classList.contains('completed')).toBe(true);
    expect(tabs[1].classList.contains('active')).toBe(true);
    expect(tabs[2].classList.contains('completed')).toBe(false);
  });

  it('should emit stepChange on click', () => {
    const emitSpy = vi.spyOn(component.stepChange, 'emit');
    const tabs = hostFixture.nativeElement.querySelectorAll('.step-tab');
    tabs[1].click();
    expect(emitSpy).toHaveBeenCalledWith('settings');
  });

  it('should display step numbers', () => {
    const numbers = hostFixture.nativeElement.querySelectorAll('.step-number');
    expect(numbers[0].textContent.trim()).toBe('1.');
    expect(numbers[1].textContent.trim()).toBe('2.');
    expect(numbers[2].textContent.trim()).toBe('3.');
  });
});
