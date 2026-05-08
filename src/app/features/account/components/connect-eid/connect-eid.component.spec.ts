import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, Component, Directive, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ConnectEidComponent } from './connect-eid.component';
import { DialogRef } from '../../../../shared/dialog/dialog-ref';

@Component({ selector: 'app-esteid', template: '', standalone: true })
class EstEidStub {}

@Component({ selector: 'cos-notifications', template: '', standalone: true })
class CosNotificationsStub {}

// eslint-disable-next-line @angular-eslint/directive-selector
@Directive({ selector: '[dialogClose]', standalone: true })
class DialogCloseStub {
  @Input() dialogClose: any;
}

@Component({ selector: 'cos-icon', standalone: true, template: '' })
class MockIconComponent { @Input() name = ''; @Input() size: any; }

function createFixture(): ComponentFixture<ConnectEidComponent> {
  TestBed.overrideComponent(ConnectEidComponent, {
    set: { imports: [TranslateModule, EstEidStub, CosNotificationsStub, DialogCloseStub, MockIconComponent] },
  });
  TestBed.configureTestingModule({
    imports: [ConnectEidComponent, TranslateModule.forRoot()],
    providers: [
      { provide: DialogRef, useValue: { close: vi.fn() } },
    ],
    schemas: [NO_ERRORS_SCHEMA],
  }).compileComponents();
  const fixture = TestBed.createComponent(ConnectEidComponent);
  fixture.detectChanges();
  return fixture;
}

describe('ConnectEidComponent', () => {
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

  it('renders the esteid form', () => {
    const fixture = createFixture();
    const form = fixture.nativeElement.querySelector('app-esteid');
    expect(form).toBeTruthy();
  });
});
