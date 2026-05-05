import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ArgumentEditsComponent } from './argument-edits.component';
import { TranslateModule } from '@ngx-translate/core';

const MOCK_ARGUMENT = {
  id: 'arg1',
  type: 'pro',
  edits: {
    '0': { type: 'pro', subject: 'First version', text: 'Original text', createdAt: '2024-01-01T10:00:00Z' },
    '1': { type: 'pro', subject: 'Updated subject', text: 'Revised text', createdAt: '2024-01-02T10:00:00Z' }
  }
};

describe('ArgumentEditsComponent', () => {
  let component: ArgumentEditsComponent;
  let fixture: ComponentFixture<ArgumentEditsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArgumentEditsComponent, TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ArgumentEditsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('argument', { ...MOCK_ARGUMENT, edits: { ...MOCK_ARGUMENT.edits } });
    fixture.componentRef.setInput('topicId', 'topic1');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render edits_wrap with argument type class', () => {
    const el: HTMLElement = fixture.nativeElement;
    const wrap = el.querySelector('.edits_wrap');
    expect(wrap).toBeTruthy();
    expect(wrap?.classList.contains('pro') || wrap?.className.includes('pro')).toBe(true);
  });

  it('should render one row per edit entry', () => {
    const el: HTMLElement = fixture.nativeElement;
    const editEls = el.querySelectorAll('.argument_edit');
    expect(editEls.length).toBe(2);
  });

  it('should render edit subject when present', () => {
    const el: HTMLElement = fixture.nativeElement;
    const subjects = el.querySelectorAll('.argument_subject');
    expect(subjects.length).toBe(2);
    expect(subjects[0].textContent?.trim()).toBe('First version');
  });

  it('should not render argument_subject when subject is empty', async () => {
    const argWithNoSubject = {
      ...MOCK_ARGUMENT,
      edits: { '0': { type: 'pro', subject: '', text: 'Some text', createdAt: '2024-01-01T10:00:00Z' } }
    };
    fixture.componentRef.setInput('argument', argWithNoSubject);
    fixture.detectChanges();
    await fixture.whenStable();

    const el: HTMLElement = fixture.nativeElement;
    const subjects = el.querySelectorAll('.argument_subject');
    expect(subjects.length).toBe(0);
  });

  it('should emit false on hideEdits', () => {
    const spy = vi.fn();
    fixture.componentRef.instance.showEditsChange.subscribe(spy);
    fixture.componentRef.instance.hideEdits();
    expect(spy).toHaveBeenCalledWith(false);
  });

  it('should have a hide edits link', () => {
    const el: HTMLElement = fixture.nativeElement;
    const link = el.querySelector('.edits_header a');
    expect(link).toBeTruthy();
  });

  it('editsEntries returns entries from keyed object', () => {
    const entries = fixture.componentRef.instance.editsEntries();
    expect(entries.length).toBe(2);
    expect(entries[0][0]).toBe('0');
    expect(entries[1][0]).toBe('1');
  });
});
