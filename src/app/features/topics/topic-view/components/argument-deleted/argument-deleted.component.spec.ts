import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArgumentDeletedComponent } from './argument-deleted.component';
import { DialogService } from '../../../../../shared/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { Argument } from '../../../../../core/interfaces/discussion';

const BASE_ARG = {
  id: 'arg1',
  creator: { id: 'user1', name: 'Alice' },
  deletedBy: { id: 'mod1', name: 'Moderator' },
  deletedReasonType: 'abuse',
  deletedReasonText: 'Violation of community guidelines.'
};

describe('ArgumentDeletedComponent', () => {
  let component: ArgumentDeletedComponent;
  let fixture: ComponentFixture<ArgumentDeletedComponent>;
  const mockDialogService = { open: vi.fn().mockReturnValue({ afterClosed: () => ({ subscribe: vi.fn() }) }) };

  function setup(argument: Argument) {
    fixture.componentRef.setInput('argument', argument);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [ArgumentDeletedComponent, TranslateModule.forRoot()],
      providers: [{ provide: DialogService, useValue: mockDialogService }]
    }).compileComponents();

    fixture = TestBed.createComponent(ArgumentDeletedComponent);
    component = fixture.componentInstance;
    setup({ ...BASE_ARG });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the orange warning SVG', () => {
    const el: HTMLElement = fixture.nativeElement;
    const svg = el.querySelector('svg rect[fill="#F39129"]');
    expect(svg).toBeTruthy();
  });

  it('should show moderator deleted block when deletedReasonType and deletedReasonText are set', () => {
    const el: HTMLElement = fixture.nativeElement;
    const boldEl = el.querySelector('.bold');
    expect(boldEl).toBeTruthy();
  });

  it('should show WHY link when moderator deleted', () => {
    const el: HTMLElement = fixture.nativeElement;
    const links = el.querySelectorAll('.buttons_wrap button.btn_link');
    expect(links.length).toBeGreaterThanOrEqual(1);
  });

  it('should call dialog.open with ArgumentWhyDialogComponent on showReason', () => {
    component.showReason();
    expect(mockDialogService.open).toHaveBeenCalledWith(
      expect.anything(),
      { data: { argument: BASE_ARG } }
    );
  });

  it('should emit showDeletedArgument true and set isArgumentVisible on showArgument', () => {
    const spy = vi.fn();
    component.showDeletedArgument.subscribe(spy);
    component.showArgument();
    expect(component.isArgumentVisible()).toBe(true);
    expect(spy).toHaveBeenCalledWith(true);
  });

  it('should hide VIEW ANYWAY link after showArgument is called', async () => {
    component.showArgument();
    fixture.detectChanges();
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    const links = el.querySelectorAll('.buttons_wrap button.btn_link');
    expect(links.length).toBe(1); // only WHY remains
  });

  it('should show self-deleted block when deletedBy === creator and no reason', () => {
    setup({ ...BASE_ARG, deletedBy: { id: 'user1', name: 'Alice' }, deletedReasonType: null, deletedReasonText: null });
    const el: HTMLElement = fixture.nativeElement;
    const bold = el.querySelector('.bold');
    expect(bold).toBeTruthy();
  });

  it('should not show WHY link in self-deleted block', () => {
    setup({ ...BASE_ARG, deletedBy: { id: 'user1', name: 'Alice' }, deletedReasonType: null, deletedReasonText: null });
    const el: HTMLElement = fixture.nativeElement;
    const links = el.querySelectorAll('.buttons_wrap button.btn_link');
    expect(links.length).toBe(1); // only VIEW ANYWAY
  });
});
