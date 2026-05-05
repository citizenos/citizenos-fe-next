import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { EditArgumentComponent } from './edit-argument.component';
import { TopicArgumentService } from '../../../../../core/services/topic-argument.service';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { Component, Input } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({ selector: 'cos-input', standalone: true, template: '<ng-content></ng-content>' })
class MockInputComponent { @Input() placeholder = ''; }

const MOCK_ARGUMENT = {
  id: 'arg1',
  discussionId: 'disc1',
  type: 'pro',
  subject: 'Original subject',
  text: 'Original text'
};

const MOCK_ARG_SERVICE = {
  ARGUMENT_TYPES: { pro: 'pro', con: 'con', poi: 'poi', reply: 'reply' },
  ARGUMENT_SUBJECT_MAXLENGTH: 128,
  ARGUMENT_TYPES_MAXLENGTH: { pro: 2048, con: 2048, poi: 2048, reply: 2048 },
  update: vi.fn().mockReturnValue(of({}))
};

describe('EditArgumentComponent', () => {
  let component: EditArgumentComponent;
  let fixture: ComponentFixture<EditArgumentComponent>;

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [EditArgumentComponent, TranslateModule.forRoot()],
      providers: [{ provide: TopicArgumentService, useValue: MOCK_ARG_SERVICE }]
    })
    .overrideComponent(EditArgumentComponent, {
      set: { imports: [FormsModule, UpperCasePipe, TranslateModule, MockInputComponent] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditArgumentComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('topicId', 'topic1');
    fixture.componentRef.setInput('argument', { ...MOCK_ARGUMENT });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should pre-fill edit signals from argument on init', () => {
    expect(component.editSubject()).toBe('Original subject');
    expect(component.editText()).toBe('Original text');
    expect(component.editType()).toBe('pro');
  });

  it('should filter out reply from ARGUMENT_TYPES', () => {
    expect(component.ARGUMENT_TYPES).not.toContain('reply');
    expect(component.ARGUMENT_TYPES).toContain('pro');
    expect(component.ARGUMENT_TYPES).toContain('con');
  });

  it('should render type select section when argument.type is not reply', () => {
    const el: HTMLElement = fixture.nativeElement;
    const typeWrap = el.querySelector('#type_select_wrap');
    expect(typeWrap).toBeTruthy();
  });

  it('should hide type select section when argument.type is reply', async () => {
    fixture.componentRef.setInput('argument', { ...MOCK_ARGUMENT, type: 'reply' });
    fixture.detectChanges();
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    const typeWrap = el.querySelector('#type_select_wrap');
    expect(typeWrap).toBeFalsy();
  });

  it('should call argumentService.update with correct data on updateArgument', () => {
    component.editSubject.set('New subject');
    component.updateArgument();
    expect(MOCK_ARG_SERVICE.update).toHaveBeenCalledWith(expect.objectContaining({
      id: 'arg1',
      topicId: 'topic1',
      discussionId: 'disc1',
      subject: 'New subject'
    }));
  });

  it('should not call update when nothing changed', () => {
    component.updateArgument();
    expect(MOCK_ARG_SERVICE.update).not.toHaveBeenCalled();
  });

  it('should emit null on successful update', () => {
    const spy = vi.fn();
    component.showEdit.subscribe(spy);
    component.editSubject.set('Changed');
    component.updateArgument();
    expect(spy).toHaveBeenCalledWith(null);
  });

  it('should emit false and reset signals on argumentEditMode', () => {
    const spy = vi.fn();
    component.showEdit.subscribe(spy);
    component.editSubject.set('Changed');
    component.argumentEditMode();
    expect(component.editSubject()).toBe('Original subject');
    expect(spy).toHaveBeenCalledWith(false);
  });

  it('should render save button', () => {
    const el: HTMLElement = fixture.nativeElement;
    const saveBtn = el.querySelector('button.btn_medium_submit');
    expect(saveBtn).toBeTruthy();
  });

  it('should render cancel button', () => {
    const el: HTMLElement = fixture.nativeElement;
    const cancelBtn = el.querySelector('button.btn_medium_submit_ghost');
    expect(cancelBtn).toBeTruthy();
  });
});
