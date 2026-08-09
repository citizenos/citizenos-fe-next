import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DuplicateTopicDialogComponent } from './duplicate-topic-dialog.component';
import { DialogRef } from '../../../../../shared/dialog/dialog-ref';
import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';

const mockTopic = { id: 'topic-1', title: 'Test Topic', status: 'inProgress', categories: [] };

describe('DuplicateTopicDialogComponent', () => {
  let component: DuplicateTopicDialogComponent;
  let fixture: ComponentFixture<DuplicateTopicDialogComponent>;
  const mockDialogRef = { close: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [DuplicateTopicDialogComponent, TranslateModule.forRoot()],
      providers: [
        { provide: DialogRef, useValue: mockDialogRef },
        { provide: DIALOG_DATA, useValue: { topic: mockTopic } },
      ],
    })
      .overrideComponent(DuplicateTopicDialogComponent, { set: { schemas: [NO_ERRORS_SCHEMA] } })
      .compileComponents();

    fixture = TestBed.createComponent(DuplicateTopicDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should expose topic from dialog data', () => {
    expect(component.topic.title).toBe('Test Topic');
  });

  it('should display topic title in the template', () => {
    expect(fixture.nativeElement.textContent).toContain('Test Topic');
  });

  it('should render the heading', () => {
    const heading = fixture.nativeElement.querySelector('.title');
    expect(heading).toBeTruthy();
  });

  it('confirm button should close dialog with true', () => {
    const btn = fixture.nativeElement.querySelector('.btn_big_submit') as HTMLElement;
    btn.click();
    expect(mockDialogRef.close).toHaveBeenCalledWith(true);
  });

  it('cancel link should close dialog', () => {
    const cancel = fixture.nativeElement.querySelector('.btn_link') as HTMLElement;
    cancel.click();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });
});
