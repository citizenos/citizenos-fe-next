import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NavComponent } from './nav.component';
import { UserStore } from '../../../state/user.store';
import { DialogService } from '../../../../shared/dialog';

describe('NavComponent', () => {
  let fixture: ComponentFixture<NavComponent>;
  let component: NavComponent;
  let userStoreMock: any;
  let dialogServiceMock: any;

  beforeEach(async () => {
    userStoreMock = {
      isAuthenticated: vi.fn().mockReturnValue(false),
      user: vi.fn().mockReturnValue(null),
      logout: vi.fn().mockResolvedValue(undefined)
    };
    dialogServiceMock = {
      open: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [NavComponent, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: UserStore, useValue: userStoreMock },
        { provide: DialogService, useValue: dialogServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle navigation', () => {
    expect(component.showNav()).toBe(false);
    component.toggleNav();
    expect(component.showNav()).toBe(true);
    component.toggleNav();
    expect(component.showNav()).toBe(false);
  });

  it('should toggle create menu', () => {
    expect(component.showCreateMenu()).toBe(false);
    component.toggleCreateMenu();
    expect(component.showCreateMenu()).toBe(true);
  });
});
