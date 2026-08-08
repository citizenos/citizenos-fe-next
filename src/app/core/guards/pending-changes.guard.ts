import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { DialogService } from '../../shared/dialog/dialog.service';
import { InterruptDialogComponent } from '../../shared/components/interrupt-dialog/interrupt-dialog.component';

export interface PendingChangesComponent {
  hasUnsavedChanges: () => boolean | Observable<boolean>;
  removeChanges?: () => Observable<unknown> | Promise<unknown> | unknown;
}

export const pendingChangesGuard: CanDeactivateFn<PendingChangesComponent> = (component) => {
  const dialog = inject(DialogService);

  const hasChanges = component.hasUnsavedChanges ? component.hasUnsavedChanges() : false;

  if (hasChanges instanceof Observable) {
    return hasChanges.pipe(
      take(1),
      switchMap((changes) => {
        if (changes) {
          return showInterruptDialog(component, dialog);
        }
        return of(true);
      })
    );
  }

  if (hasChanges) {
    return showInterruptDialog(component, dialog);
  }

  return true;
};

function showInterruptDialog(
  component: PendingChangesComponent,
  dialog: DialogService
): Observable<boolean> {
  const dialogRef = dialog.open(InterruptDialogComponent);
  return dialogRef.afterClosed().pipe(
    take(1),
    map((result) => {
      if (result === true) {
        if (component.removeChanges) {
          component.removeChanges();
        }
        return true;
      }
      return false;
    })
  );
}
