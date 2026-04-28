import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { DownloadVoteResultsComponent } from './download-vote-results.component';
import { DialogRef } from '../../../../../shared/dialog/dialog-ref';

describe('DownloadVoteResultsComponent', () => {
  let fixture: ComponentFixture<DownloadVoteResultsComponent>;
  let component: DownloadVoteResultsComponent;

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [DownloadVoteResultsComponent, TranslateModule.forRoot()],
      providers: [
        { provide: DialogRef, useValue: { close: vi.fn() } }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(DownloadVoteResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render edit deadline button', () => {
    const btns = fixture.nativeElement.querySelectorAll('button');
    const labels = Array.from(btns).map((b: any) => b.getAttribute('ng-reflect-dialog-close') || b.textContent);
    expect(fixture.nativeElement.textContent).toContain('COMPONENTS.DOWNLOAD_VOTING_RESULTS.BTN_EDIT_DEADLINE');
  });

  it('should render submit button', () => {
    expect(fixture.nativeElement.textContent).toContain('COMPONENTS.DOWNLOAD_VOTING_RESULTS.BTN_SUBMIT');
  });

  it('should render cancel link', () => {
    expect(fixture.nativeElement.textContent).toContain('COMPONENTS.DOWNLOAD_VOTING_RESULTS.BTN_CANCEL');
  });
});
