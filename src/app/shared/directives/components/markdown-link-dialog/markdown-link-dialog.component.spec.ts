import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MarkdownLinkDialogComponent } from './markdown-link-dialog.component';
import { DIALOG_DATA, DialogRef } from '../../../dialog';
import { TranslateModule } from '@ngx-translate/core';
import { Component, Input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

@Component({ selector: 'cos-input', standalone: true, template: '<ng-content></ng-content>' })
class MockInputComponent { @Input() placeholder = ''; }

describe('MarkdownLinkDialogComponent', () => {
  let component: MarkdownLinkDialogComponent;
  let fixture: ComponentFixture<MarkdownLinkDialogComponent>;
  const mockDialogRef = { close: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [MarkdownLinkDialogComponent, TranslateModule.forRoot()],
      providers: [
        { provide: DIALOG_DATA, useValue: { selected: 'My Link Text' } },
        { provide: DialogRef, useValue: mockDialogRef }
      ]
    })
    .overrideComponent(MarkdownLinkDialogComponent, {
      set: { imports: [ReactiveFormsModule, TranslateModule, MockInputComponent] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarkdownLinkDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should pre-fill linktext from selected data', () => {
    expect(component.form.value.linktext).toBe('My Link Text');
  });

  it('should close dialog with form value on save', () => {
    component.form.setValue({ linktext: 'Click here', link: 'https://example.com' });
    component.save();
    expect(mockDialogRef.close).toHaveBeenCalledWith({ linktext: 'Click here', link: 'https://example.com' });
  });

  it('should render save button', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.btn_big_submit')).toBeTruthy();
  });

  it('should render cancel link', () => {
    const el: HTMLElement = fixture.nativeElement;
    const cancel = el.querySelector('[dialogclose], [dialogClose]');
    expect(cancel).toBeTruthy();
  });
});
