import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { TopicFollowUpCreateDialogComponent } from './topic-follow-up-create-dialog.component';
import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';
import { DialogRef } from '../../../../../shared/dialog/dialog-ref';
import { TopicService } from '../../../../../core/services/topic.service';
import { Topic } from '../../../../../core/interfaces/topic';

const mockTopic = { id: 'topic-1', title: 'Test Topic', status: 'followUp' } as unknown as Topic;

const topicServiceMock = { changeState: vi.fn() };
const dialogRefMock = { close: vi.fn() };

function createFixture(): ComponentFixture<TopicFollowUpCreateDialogComponent> {
  TestBed.configureTestingModule({
    imports: [TopicFollowUpCreateDialogComponent, TranslateModule.forRoot()],
    providers: [
      { provide: DIALOG_DATA, useValue: { topic: mockTopic } },
      { provide: DialogRef, useValue: dialogRefMock },
      { provide: TopicService, useValue: topicServiceMock },
    ],
    schemas: [NO_ERRORS_SCHEMA],
  }).compileComponents();
  const fixture = TestBed.createComponent(TopicFollowUpCreateDialogComponent);
  fixture.detectChanges();
  return fixture;
}

describe('TopicFollowUpCreateDialogComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.resetTestingModule();
  });

  it('renders without error', () => {
    const fixture = createFixture();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('has a close button', () => {
    const fixture = createFixture();
    const btn = fixture.nativeElement.querySelector('.btn_dialog_close');
    expect(btn).toBeTruthy();
  });

  it('shows the introduction content', () => {
    const fixture = createFixture();
    const intro = fixture.nativeElement.querySelector('.introduction_wrap');
    expect(intro).toBeTruthy();
  });

  it('shows info items in dialog_info', () => {
    const fixture = createFixture();
    const rows = fixture.nativeElement.querySelectorAll('.dialog_info .row');
    expect(rows.length).toBeGreaterThanOrEqual(1);
  });

  it('has a start follow-up button', () => {
    const fixture = createFixture();
    const btn = fixture.nativeElement.querySelector('.btn_medium_submit');
    expect(btn).toBeTruthy();
  });

  it('has a cancel link', () => {
    const fixture = createFixture();
    const link = fixture.nativeElement.querySelector('.dialog_footer a');
    expect(link).toBeTruthy();
  });

  it('startFollowUp calls TopicService.changeState with followUp', () => {
    const fixture = createFixture();
    fixture.componentInstance.startFollowUp();
    expect(topicServiceMock.changeState).toHaveBeenCalledWith(mockTopic, 'followUp');
  });
});
