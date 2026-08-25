import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { UiStateService } from '../../../services/ui-state.service';
import { ConfigStore } from '../../../state/config.store';
import { NotificationService } from '../../../services/notification.service';
import { FeedbackComponent } from './feedback.component';

describe('FeedbackComponent', () => {
  let component: FeedbackComponent;
  let fixture: ComponentFixture<FeedbackComponent>;
  
  const mockUiState = {
    showFeedback: signal(true)
  };

  const mockConfigStore = {
    api: {
      baseUrl: signal('http://test')
    }
  };

  const mockNotification = {
    error: vi.fn(),
    showRaw: vi.fn()
  };

  const mockHttp = {
    post: vi.fn().mockReturnValue(of({}))
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    mockUiState.showFeedback.set(true);

    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), FeedbackComponent],
      providers: [
        { provide: UiStateService, useValue: mockUiState },
        { provide: ConfigStore, useValue: mockConfigStore },
        { provide: NotificationService, useValue: mockNotification },
        { provide: HttpClient, useValue: mockHttp }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the feedback form when showFeedback is true', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.feedback_overlay_root')).toBeTruthy();
    expect(compiled.querySelector('#feedback_message')).toBeTruthy();
  });

  it('should close the feedback form when clicking cancel', () => {
    const cancelBtn = fixture.debugElement.query(By.css('cos-button[variant="ghost"]'));
    cancelBtn.triggerEventHandler('clicked', null);
    expect(mockUiState.showFeedback()).toBe(false);
  });

  it('should set error when submitting without message', () => {
    component.message = '';
    const submitBtn = fixture.debugElement.query(By.css('cos-button[variant="primary"]'));
    submitBtn.triggerEventHandler('clicked', null);
    fixture.detectChanges();

    expect(component.error()).toBe(true);
    expect(fixture.nativeElement.querySelector('.error_input')).toBeTruthy();
  });

  it('should call API and show success message on submit', () => {
    component.message = 'Test feedback';
    const submitBtn = fixture.debugElement.query(By.css('cos-button[variant="primary"]'));
    submitBtn.triggerEventHandler('clicked', null);
    fixture.detectChanges();

    expect(mockHttp.post).toHaveBeenCalled();
    expect(component.isSubmitted()).toBe(true);
    
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.feedback_submitted_title')).toBeTruthy();
  });

  it('should close the feedback form when clicking close button after submission', () => {
    component.isSubmitted.set(true);
    fixture.detectChanges();

    const closeBtn = fixture.debugElement.query(By.css('cos-button[variant="primary"]'));
    closeBtn.triggerEventHandler('clicked', null);
    expect(mockUiState.showFeedback()).toBe(false);
  });

  it('should hide the form when showFeedback signal is false', () => {
    mockUiState.showFeedback.set(false);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.feedback_overlay_root')).toBeNull();
  });
});
