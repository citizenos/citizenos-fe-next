import { OverlayRef } from '@angular/cdk/overlay';
import { Directive, ElementRef, HostListener, inject, Injectable, Input } from '@angular/core';
import { Observable, Subject } from 'rxjs';

// eslint-disable-next-line @angular-eslint/directive-selector -- widely used across templates, rename deferred
@Directive({
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

@Injectable()
export class DialogRef<T = unknown, R = unknown> {
  private afterClosedSubject = new Subject<R | undefined>();
  component?: { name: string };

  // eslint-disable-next-line @angular-eslint/prefer-inject -- manually instantiated per dialog
  constructor(private overlayRef: OverlayRef) {}

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
