import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, Component, Directive, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ConnectSmartIdComponent } from './connect-smart-id.component';
import { DialogRef } from '../../../../shared/dialog/dialog-ref';

@Component({ selector: 'app-smart-id', template: '', standalone: true })
class SmartIdStub {}

@Component({ selector: 'cos-notifications', template: '', standalone: true })
class CosNotificationsStub {}

@Directive({ selector: '[dialogClose]', standalone: true })
class DialogCloseStub {
  @Input() dialogClose: any;
}

function createFixture(): ComponentFixture<ConnectSmartIdComponent> {
  TestBed.overrideComponent(ConnectSmartIdComponent, {
    set: { imports: [TranslateModule, SmartIdStub, CosNotificationsStub, DialogCloseStub] },
  });
  TestBed.configureTestingModule({
    imports: [ConnectSmartIdComponent, TranslateModule.forRoot()],
    providers: [
      { provide: DialogRef, useValue: { close: vi.fn() } },
    ],
    schemas: [NO_ERRORS_SCHEMA],
  }).compileComponents();
  const fixture = TestBed.createComponent(ConnectSmartIdComponent);
  fixture.detectChanges();
  return fixture;
}

describe('ConnectSmartIdComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.resetTestingModule();
  });

  it('renders without error', () => {
    const fixture = createFixture();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('has a close button', () => {
    const fixture = createFixture();
    const btn = fixture.nativeElement.querySelector('.btn_dialog_close');
    expect(btn).toBeTruthy();
  });

  it('renders the smart-id form', () => {
    const fixture = createFixture();
    const form = fixture.nativeElement.querySelector('app-smart-id');
    expect(form).toBeTruthy();
  });
});
