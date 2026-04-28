import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { CloseVotingComponent } from './close-voting.component';
import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';
import { DialogRef } from '../../../../../shared/dialog/dialog-ref';

const mockDialogRef = { close: vi.fn() };

describe('CloseVotingComponent — topic without ideationId', () => {
  let fixture: ComponentFixture<CloseVotingComponent>;
  let component: CloseVotingComponent;

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [CloseVotingComponent, TranslateModule.forRoot()],
      providers: [
        { provide: DIALOG_DATA, useValue: { topic: { id: 't1', ideationId: null } } },
        { provide: DialogRef, useValue: mockDialogRef }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(CloseVotingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose topic via data', () => {
    expect(component.data.topic.id).toBe('t1');
  });

  it('should not render ideation description', () => {
    expect(fixture.nativeElement.textContent).not.toContain('COMPONENTS.CLOSE_VOTING_CONFIRM.CLOSE_VOTING_DESCRIPTION');
  });
});

describe('CloseVotingComponent — topic with ideationId', () => {
  let fixture: ComponentFixture<CloseVotingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CloseVotingComponent, TranslateModule.forRoot()],
      providers: [
        { provide: DIALOG_DATA, useValue: { topic: { id: 't1', ideationId: 'idea-1' } } },
        { provide: DialogRef, useValue: { close: vi.fn() } }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(CloseVotingComponent);
    fixture.detectChanges();
  });

  it('should render ideation description', () => {
    expect(fixture.nativeElement.textContent).toContain('COMPONENTS.CLOSE_VOTING_CONFIRM.CLOSE_VOTING_DESCRIPTION');
  });
});
