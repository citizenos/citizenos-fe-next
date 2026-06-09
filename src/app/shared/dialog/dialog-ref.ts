import { OverlayRef } from '@angular/cdk/overlay';
import { Directive, HostListener, inject, Input, Service } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[dialogClose]',
  standalone: true,
})
export class DialogCloseDirective {
  @Input('dialogClose') result: unknown = undefined;

  private dialog = inject(DialogRef);

  @HostListener('click')
  onClick() {
    this.dialog.close(this.result);
  }
}

@Service({ autoProvided: false })
export class DialogRef<_T = unknown, R = unknown> {
  private overlayRef = inject(OverlayRef);

  private afterClosedSubject = new Subject<R | undefined>();
  component?: { name: string };

  close(result?: R) {
    this.overlayRef.dispose();
    this.afterClosedSubject.next(result);
    this.afterClosedSubject.complete();
  }

  afterClosed(): Observable<R | undefined> {
    return this.afterClosedSubject.asObservable();
  }

  setComponent(component: { name: string }) {
    this.component = component;
  }
}
