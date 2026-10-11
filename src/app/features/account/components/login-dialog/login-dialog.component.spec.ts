import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginDialogComponent } from './login-dialog.component';
import { TranslateModule } from '@ngx-translate/core';
import { DialogRef } from '../../../../shared/dialog/dialog-ref';
import { DIALOG_DATA } from '../../../../shared/dialog/dialog-tokens';
import { DialogService } from '../../../../shared/dialog/dialog.service';
import { provideRouter } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('LoginDialogComponent', () => {
  let component: LoginDialogComponent;
  let fixture: ComponentFixture<LoginDialogComponent>;
  let mockDialogRef: { close: ReturnType<typeof vi.fn> };
  let mockDialogService: { open: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockDialogRef = { close: vi.fn() };
    mockDialogService = { open: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [LoginDialogComponent, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: DialogRef, useValue: mockDialogRef },
        { provide: DialogService, useValue: mockDialogService },
        { provide: DIALOG_DATA, useValue: { redirectSuccess: '/test' } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close on close()', () => {
    component.close();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should close with true on onLoggedIn()', () => {
    component.onLoggedIn();
    expect(mockDialogRef.close).toHaveBeenCalledWith(true);
  });

  it('should close and open RegisterDialog on openRegister()', () => {
    component.openRegister();
    expect(mockDialogRef.close).toHaveBeenCalled();
    expect(mockDialogService.open).toHaveBeenCalled();
  });
});
