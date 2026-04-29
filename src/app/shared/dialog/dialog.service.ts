import { Overlay, ComponentType } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { inject, Injectable, Injector } from '@angular/core';
import { take } from 'rxjs';
import { DialogRef } from './dialog-ref';
import { DIALOG_DATA } from './dialog-tokens';

export interface DialogConfig<D = unknown> {
  data?: D;
}

@Injectable({ providedIn: 'root' })
export class DialogService {
  private overlay = inject(Overlay);
  private injector = inject(Injector);

  private openDialogs: DialogRef<unknown>[] = [];
  private scrollPosition = 0;

  open<T, R = unknown>(component: ComponentType<T>, config?: DialogConfig): DialogRef<T, R> {
    this.scrollPosition = window.scrollY;

    const positionStrategy = this.overlay
      .position()
      .global()
      .centerHorizontally()
      .centerVertically();

    const overlayRef = this.overlay.create({
      positionStrategy,
      hasBackdrop: true,
      backdropClass: 'cos-dialog-backdrop',
      panelClass: 'cos-dialog-panel',
      scrollStrategy: this.overlay.scrollStrategies.block(),
    });

    const dialogRef = new DialogRef<T, R>(overlayRef);
    dialogRef.setComponent(component as unknown as { name: string });

    const childInjector = Injector.create({
      parent: this.injector,
      providers: [
        { provide: DialogRef, useValue: dialogRef },
        { provide: DIALOG_DATA, useValue: config?.data ?? {} },
      ],
    });

    const portal = new ComponentPortal(component, null, childInjector);
    overlayRef.attach(portal);
    this.openDialogs.push(dialogRef as DialogRef<unknown>);

    overlayRef.backdropClick().subscribe(() => dialogRef.close());
    overlayRef.keydownEvents().subscribe(event => {
      if (event.key === 'Escape') {
        dialogRef.close();
      }
    });

    dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe(() => {
        const idx = this.openDialogs.findIndex(
          (d) => d.component?.name === dialogRef.component?.name,
        );
        if (idx >= 0) this.openDialogs.splice(idx, 1);
        setTimeout(() => window.scrollTo(0, this.scrollPosition));
      });

    return dialogRef;
  }

  closeAll() {
    [...this.openDialogs].forEach((d) => d.close());
  }
}
