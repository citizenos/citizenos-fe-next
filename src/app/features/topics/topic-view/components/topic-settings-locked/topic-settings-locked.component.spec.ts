import { MockIconComponent } from '../../../../../shared/testing/mocks';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { TopicSettingsLockedComponent } from './topic-settings-locked.component';
import { DialogRef } from '../../../../../shared/dialog/dialog-ref';

describe('TopicSettingsLockedComponent', () => {
  let component: TopicSettingsLockedComponent;
  let fixture: ComponentFixture<TopicSettingsLockedComponent>;
  const mockDialogRef = { close: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [TopicSettingsLockedComponent, TranslateModule.forRoot()],
      providers: [{ provide: DialogRef, useValue: mockDialogRef }],
    })
      .overrideComponent(TopicSettingsLockedComponent, { set: { schemas: [NO_ERRORS_SCHEMA] } })
      .compileComponents();

    fixture = TestBed.createComponent(TopicSettingsLockedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should render the heading', () => {
    const heading = fixture.nativeElement.querySelector('.small_heading');
    expect(heading).toBeTruthy();
  });

  it('should render the description', () => {
    const desc = fixture.nativeElement.querySelector('.delete_info_text');
    expect(desc).toBeTruthy();
  });

  it('should have a close button with dialogClose attribute', () => {
    const btn = fixture.nativeElement.querySelector('button[dialogClose]');
    expect(btn).toBeTruthy();
  });

  it('close button should call dialogRef.close when clicked', () => {
    const btn = fixture.nativeElement.querySelector('button[dialogClose]') as HTMLElement;
    btn.click();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });
});
