import { TestBed } from '@angular/core/testing';
import { runInInjectionContext, Injector } from '@angular/core';
import { pendingChangesGuard, PendingChangesComponent } from './pending-changes.guard';
import { DialogService } from '../../shared/dialog/dialog.service';
import { of } from 'rxjs';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('pendingChangesGuard', () => {
  let dialogServiceMock: any;
  let injector: Injector;

  beforeEach(() => {
    dialogServiceMock = {
      open: vi.fn().mockReturnValue({
        afterClosed: () => of(true)
      })
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: DialogService, useValue: dialogServiceMock }
      ]
    });

    injector = TestBed.inject(Injector);
  });

  it('should return true if component has no unsaved changes', () => {
    const mockComponent: PendingChangesComponent = {
      hasUnsavedChanges: () => false
    };

    const result = runInInjectionContext(injector, () => {
      return pendingChangesGuard(
        mockComponent,
        {} as ActivatedRouteSnapshot,
        {} as RouterStateSnapshot,
        {} as RouterStateSnapshot
      );
    });

    expect(result).toBe(true);
    expect(dialogServiceMock.open).not.toHaveBeenCalled();
  });

  it('should prompt user with dialog when there are changes and return true if confirmed', () => {
    const mockComponent: PendingChangesComponent = {
      hasUnsavedChanges: () => true,
      removeChanges: vi.fn()
    };

    runInInjectionContext(injector, () => {
      const result: any = pendingChangesGuard(
        mockComponent,
        {} as ActivatedRouteSnapshot,
        {} as RouterStateSnapshot,
        {} as RouterStateSnapshot
      );

      if (typeof result === 'boolean') {
        expect(result).toBe(true);
      } else {
        result.subscribe((val: any) => {
          expect(val).toBe(true);
          expect(dialogServiceMock.open).toHaveBeenCalled();
          expect(mockComponent.removeChanges).toHaveBeenCalled();
        });
      }
    });
  });

  it('should return false if changes exist but user cancels the prompt', () => {
    dialogServiceMock.open = vi.fn().mockReturnValue({
      afterClosed: () => of(false)
    });

    const mockComponent: PendingChangesComponent = {
      hasUnsavedChanges: () => true,
      removeChanges: vi.fn()
    };

    runInInjectionContext(injector, () => {
      const result: any = pendingChangesGuard(
        mockComponent,
        {} as ActivatedRouteSnapshot,
        {} as RouterStateSnapshot,
        {} as RouterStateSnapshot
      );

      if (typeof result === 'boolean') {
        expect(result).toBe(false);
      } else {
        result.subscribe((val: any) => {
          expect(val).toBe(false);
          expect(dialogServiceMock.open).toHaveBeenCalled();
          expect(mockComponent.removeChanges).not.toHaveBeenCalled();
        });
      }
    });
  });
});
