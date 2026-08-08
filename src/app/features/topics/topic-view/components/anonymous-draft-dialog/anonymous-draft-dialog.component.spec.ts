import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnonymousDraftDialogComponent } from './anonymous-draft-dialog.component';
import { TranslateModule } from '@ngx-translate/core';
import { DialogRef } from '../../../../../shared/dialog';
import { By } from '@angular/platform-browser';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';

describe('AnonymousDraftDialogComponent', () => {
  let component: AnonymousDraftDialogComponent;
  let fixture: ComponentFixture<AnonymousDraftDialogComponent>;
  let mockDialogRef: { close: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockDialogRef = {
      close: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [AnonymousDraftDialogComponent, TranslateModule.forRoot(), IconComponent],
      providers: [
        { provide: DialogRef, useValue: mockDialogRef }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AnonymousDraftDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders without error', () => {
    expect(component).toBeTruthy();
  });

  it('closes dialog when "Got it" button is clicked', () => {
    const button = fixture.debugElement.query(By.css('.btn_big_submit'));
    expect(button).toBeTruthy();
    // dialogClose directive handles this automatically, but we can test if it has the directive attribute
    expect(button.attributes['dialogClose']).toBeDefined();
  });

  it('closes dialog when "X" icon is clicked', () => {
    const closeIcon = fixture.debugElement.query(By.css('.btn_dialog_close'));
    expect(closeIcon).toBeTruthy();
    expect(closeIcon.attributes['dialogClose']).toBeDefined();
  });

  it('closes dialog when overlay is clicked', () => {
    const overlay = fixture.debugElement.query(By.css('.overlay'));
    expect(overlay).toBeTruthy();
    expect(overlay.attributes['dialogClose']).toBeDefined();
  });
});
