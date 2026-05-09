import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { NEVER } from 'rxjs';
import { TourComponent } from './tour.component';
import { TourService, TourItem } from '../../../core/services/tour.service';
import { UserStore } from '../../../core/state/user.store';

const mockTourService = {
  showTour: signal(false),
  activeTour: signal(''),
  activeItem: signal(0),
  items: signal<Record<string, TourItem[]>>({}),
  activeTemplate$: NEVER,
  hide: vi.fn(),
  next: vi.fn(),
  previous: vi.fn(),
};
const mockUserStore = { user: signal(null) };

describe('TourComponent', () => {
  let component: TourComponent;
  let fixture: ComponentFixture<TourComponent>;

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [TourComponent, TranslateModule.forRoot()],
      providers: [
        { provide: TourService, useValue: mockTourService },
        { provide: UserStore, useValue: mockUserStore },
      ],
    })
      .overrideComponent(TourComponent, { set: { imports: [TranslateModule], schemas: [NO_ERRORS_SCHEMA] } })
      .compileComponents();

    fixture = TestBed.createComponent(TourComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should expose tourService', () => {
    expect(component.tourService).toBe(mockTourService);
  });

  it('closeTour() should call tourService.hide()', () => {
    component.closeTour(new MouseEvent('click'));
    expect(mockTourService.hide).toHaveBeenCalled();
  });

  it('nextItem() should call tourService.next()', () => {
    component.nextItem(new MouseEvent('click'));
    expect(mockTourService.next).toHaveBeenCalled();
  });

  it('prevItem() should call tourService.previous()', () => {
    component.prevItem(new MouseEvent('click'));
    expect(mockTourService.previous).toHaveBeenCalled();
  });
});
