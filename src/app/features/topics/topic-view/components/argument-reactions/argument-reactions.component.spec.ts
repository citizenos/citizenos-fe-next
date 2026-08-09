import { MockIconComponent } from '../../../../../shared/testing/mocks';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArgumentReactionsComponent } from './argument-reactions.component';
import { TopicArgumentService } from '../../../../../core/services/topic-argument.service';
import { DIALOG_DATA, DialogRef } from '../../../../../shared/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { Component, Input } from '@angular/core';

@Component({ selector: 'cos-initials', standalone: true, template: '' })
class MockInitialsComponent { @Input() name = ''; }

@Component({ selector: 'cos-notifications', standalone: true, template: '' })
class MockNotificationComponent { }

@Component({ selector: 'cos-pagination', standalone: true, template: '' })
class MockPaginationComponent {
  @Input() totalPages = 0;
  @Input() page = 1;
}

const MOCK_MEMBERS = [
  { name: 'Alice', imageUrl: null, vote: 'up' },
  { name: 'Bob', imageUrl: 'http://example.com/bob.jpg', vote: 'down' },
];

describe('ArgumentReactionsComponent', () => {
  let component: ArgumentReactionsComponent;
  let fixture: ComponentFixture<ArgumentReactionsComponent>;

  const mockArgumentService = {
    votes: vi.fn().mockReturnValue(of({ rows: MOCK_MEMBERS }))
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [ArgumentReactionsComponent, TranslateModule.forRoot()],
      providers: [
        { provide: DIALOG_DATA, useValue: { commentId: 'c1', topicId: 't1', discussionId: 'd1' } },
        { provide: DialogRef, useValue: { close: vi.fn() } },
        { provide: TopicArgumentService, useValue: mockArgumentService }
      ]
    })
    .overrideComponent(ArgumentReactionsComponent, {
      set: { imports: [TranslateModule, MockInitialsComponent, MockPaginationComponent,
          MockIconComponent, MockNotificationComponent] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArgumentReactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call votes service on init', () => {
    expect(mockArgumentService.votes).toHaveBeenCalledWith({ discussionId: 'd1', commentId: 'c1', topicId: 't1' });
  });

  it('should populate members from API response', () => {
    expect(component.members()).toHaveLength(2);
  });

  it('should set totalPages based on member count', () => {
    expect(component.totalPages()).toBe(1);
  });

  it('should render member rows', () => {
    const el: HTMLElement = fixture.nativeElement;
    const rows = el.querySelectorAll('.row_list');
    expect(rows.length).toBe(2);
  });

  it('should render profile image when imageUrl is set', () => {
    const el: HTMLElement = fixture.nativeElement;
    const imgs = el.querySelectorAll('img.profile_image');
    expect(imgs.length).toBe(1);
  });

  it('should show empty message when no members', async () => {
    mockArgumentService.votes.mockReturnValue(of({ rows: [] }));
    component.ngOnInit();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.members()).toHaveLength(0);
  });

  it('loadPage updates page signal', () => {
    component.loadPage(2);
    expect(component.page()).toBe(2);
  });

  it('isOnPage returns true for items on current page', () => {
    expect(component.isOnPage(0, 1)).toBe(true);
    expect(component.isOnPage(9, 1)).toBe(true);
    expect(component.isOnPage(10, 1)).toBe(false);
    expect(component.isOnPage(10, 2)).toBe(true);
  });

  it('should have a close button with dialogClose', () => {
    const el: HTMLElement = fixture.nativeElement;
    const closeEl = el.querySelector('.btn_dialog_close');
    expect(closeEl).toBeTruthy();
  });
});
