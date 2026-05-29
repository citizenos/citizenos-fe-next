import { MockIconComponent } from '../../../../../shared/testing/mocks';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { TopicTourDialogComponent } from './topic-tour-dialog.component';
import { DialogRef } from '../../../../../shared/dialog/dialog-ref';

describe('TopicTourDialogComponent', () => {
  let component: TopicTourDialogComponent;
  let fixture: ComponentFixture<TopicTourDialogComponent>;
  const mockDialogRef = { close: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [TopicTourDialogComponent, TranslateModule.forRoot()],
      providers: [{ provide: DialogRef, useValue: mockDialogRef }],
    })
      .overrideComponent(TopicTourDialogComponent, { set: { schemas: [NO_ERRORS_SCHEMA] } })
      .compileComponents();

    fixture = TestBed.createComponent(TopicTourDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should render the tour title', () => {
    const title = fixture.nativeElement.querySelector('[translate="VIEWS.TOPICS_TOPICID.TUTORIAL_TITLE"]');
    expect(title).toBeTruthy();
  });

  it('should render the tour description', () => {
    const desc = fixture.nativeElement.querySelector('[translate="VIEWS.TOPICS_TOPICID.TUTORIAL_DESC"]');
    expect(desc).toBeTruthy();
  });

  it('should have a take-the-tour button that closes dialog with true', () => {
    const btn = fixture.nativeElement.querySelector('button[translate="VIEWS.TOPICS_TOPICID.TUTORIAL_BTN_TAKE_THE_TOUR"]');
    expect(btn).toBeTruthy();
    btn.click();
    expect(mockDialogRef.close).toHaveBeenCalledWith(true);
  });

  it('should have a skip link that closes the dialog', () => {
    const skip = fixture.nativeElement.querySelector('a[dialogClose]');
    expect(skip).toBeTruthy();
    skip.click();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });
});
