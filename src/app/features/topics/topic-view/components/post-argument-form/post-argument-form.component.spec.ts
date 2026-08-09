import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Component, Directive, Input, input, output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { PostArgumentFormComponent } from './post-argument-form.component';
import { TopicArgumentService } from '../../../../../core/services/topic-argument.service';
import { NotificationService } from '../../../../../core/services/notification.service';

@Component({ selector: 'cos-input', standalone: true, template: '<ng-content></ng-content>' })
class MockInputComponent { @Input() placeholder = ''; }

@Component({ selector: 'cos-icon', standalone: true, template: '<i></i>' })
class MockIconComponent { @Input() name = ''; @Input() size?: string | number; }

@Component({ selector: 'cos-button', standalone: true, template: '<ng-content></ng-content>' })
class MockButtonComponent { @Input() variant = ''; }

@Directive({ selector: '[cosMarkdown]', standalone: true })
class MockMarkdownDirective {
  item = input<string>('');
  initialValue = input<string | null | undefined>(null);
  itemChange = output<string>();
  limit = input<number>(100);
  placeholder = input<string | undefined>();
  cosMarkdownTranslateCharacterStatusKey = input<string | undefined>(undefined);
}

const mockArgumentService = {
  save: vi.fn(),
  setParam: vi.fn(),
  ARGUMENT_SUBJECT_MAXLENGTH: 200,
  ARGUMENT_TYPES_MAXLENGTH: { pro: 500, con: 500, poi: 500, reply: 250 },
};
const mockNotification = { success: vi.fn(), showRaw: vi.fn() };

// ── Class-level tests (no DOM) ─────────────────────────────────────────────

describe('PostArgumentFormComponent (class)', () => {
  let component: PostArgumentFormComponent;

  beforeEach(() => {
    vi.clearAllMocks();
    mockArgumentService.save.mockReturnValue(of({}));

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: TopicArgumentService, useValue: mockArgumentService },
        { provide: NotificationService, useValue: mockNotification },
      ],
    });

    component = TestBed.runInInjectionContext(() => new PostArgumentFormComponent());
    (component as unknown as { topicId: unknown }).topicId = signal('topic-1');
    (component as unknown as { discussionId: unknown }).discussionId = signal('disc-1');
  });

  it('should default to pro type', () => {
    expect(component.argumentType()).toBe('pro');
  });

  it('should have all three types available', () => {
    expect(component.types).toEqual(['pro', 'con', 'poi']);
  });

  it('ngOnInit calls setParam for topicId and discussionId', () => {
    component.ngOnInit();
    expect(mockArgumentService.setParam).toHaveBeenCalledWith('topicId', 'topic-1');
    expect(mockArgumentService.setParam).toHaveBeenCalledWith('discussionId', 'disc-1');
  });

  it('close() sets isOpen to false', () => {
    component.isOpen.set(true);
    component.close();
    expect(component.isOpen()).toBe(false);
  });

  it('clear() resets subject, text, and errors', () => {
    component.subject.set('hello');
    component.text.set('world');
    component.errors.set('oops');
    component.clear();
    expect(component.subject()).toBe('');
    expect(component.text()).toBe('');
    expect(component.errors()).toBeNull();
  });

  it('argumentMaxLength() returns type-specific limit', () => {
    component.argumentType.set('con');
    expect(component.argumentMaxLength()).toBe(500);
  });

  it('submit should call save with correct payload', () => {
    component.argumentType.set('con');
    component.subject.set('My subject');
    component.text.set('My text');
    component.submit();

    expect(mockArgumentService.save).toHaveBeenCalledWith(expect.objectContaining({
      type: 'con',
      subject: 'My subject',
      text: 'My text',
      topicId: 'topic-1',
      discussionId: 'disc-1',
    }));
  });

  it('submit should clear form and emit posted on success', () => {
    const postedSpy = vi.spyOn(component.posted, 'emit');
    component.subject.set('Test');
    component.text.set('Body');
    component.submit();

    expect(component.subject()).toBe('');
    expect(component.text()).toBe('');
    expect(postedSpy).toHaveBeenCalled();
  });

  it('submit should set isOpen to false on success', () => {
    component.isOpen.set(true);
    component.subject.set('Test');
    component.text.set('Body');
    component.submit();
    expect(component.isOpen()).toBe(false);
  });

  it('submit should set error on failure', () => {
    mockArgumentService.save.mockReturnValue(throwError(() => ({ message: 'Server error' })));
    component.subject.set('Test');
    component.text.set('Body');
    component.submit();

    expect(component.errors()).toBe('Server error');
  });

  it('submit with empty subject trims to empty string', () => {
    component.subject.set('   ');
    component.text.set('Some text');
    component.submit();
    expect(mockArgumentService.save).toHaveBeenCalledWith(expect.objectContaining({ subject: '' }));
  });
});

// ── Template / fixture tests ───────────────────────────────────────────────

describe('PostArgumentFormComponent (template)', () => {
  let component: PostArgumentFormComponent;
  let fixture: ComponentFixture<PostArgumentFormComponent>;
  let el: HTMLElement;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockArgumentService.save.mockReturnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [PostArgumentFormComponent, TranslateModule.forRoot()],
      providers: [
        { provide: TopicArgumentService, useValue: mockArgumentService },
        { provide: NotificationService, useValue: mockNotification },
      ],
    })
    .overrideComponent(PostArgumentFormComponent, {
      set: { imports: [FormsModule, TranslateModule, MockInputComponent, MockButtonComponent, MockIconComponent, MockMarkdownDirective] },
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostArgumentFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('topicId', 'topic-1');
    fixture.componentRef.setInput('discussionId', 'disc-1');
    fixture.detectChanges();
    el = fixture.nativeElement;
  });

  it('should render without error', () => {
    expect(component).toBeTruthy();
    expect(el.querySelector('#create_argument_tablet_btn')).toBeTruthy();
  });

  it('tablet button click sets isOpen to true', () => {
    const btn = el.querySelector('#create_argument_tablet_btn button') as HTMLButtonElement;
    btn.click();
    fixture.detectChanges();
    expect(component.isOpen()).toBe(true);
  });

  it('footer menu button click sets isOpen to true', () => {
    const btn = el.querySelector('#create_argument_footer_menu .btn_medium_submit') as HTMLButtonElement;
    btn.click();
    fixture.detectChanges();
    expect(component.isOpen()).toBe(true);
  });

  it('mobile close button click sets isOpen to false', () => {
    component.isOpen.set(true);
    fixture.detectChanges();
    const btn = el.querySelector('#close_mobile button') as HTMLButtonElement;
    btn.click();
    fixture.detectChanges();
    expect(component.isOpen()).toBe(false);
  });

  it('close_create button click sets isOpen to false', () => {
    component.isOpen.set(true);
    fixture.detectChanges();
    const btn = el.querySelector('#close_create button') as HTMLButtonElement;
    btn.click();
    fixture.detectChanges();
    expect(component.isOpen()).toBe(false);
  });

  it('overlay not present when isOpen is false', () => {
    component.isOpen.set(false);
    fixture.detectChanges();
    expect(el.querySelector('.overlay')).toBeNull();
  });

  it('overlay present when isOpen is true', () => {
    component.isOpen.set(true);
    fixture.detectChanges();
    expect(el.querySelector('.overlay')).toBeTruthy();
  });

  it('overlay click sets isOpen to false', () => {
    component.isOpen.set(true);
    fixture.detectChanges();
    const overlay = el.querySelector('.overlay') as HTMLElement;
    overlay.click();
    fixture.detectChanges();
    expect(component.isOpen()).toBe(false);
  });

  it('type radio change updates argumentType', () => {
    const radios = el.querySelectorAll('input[type="radio"]') as NodeListOf<HTMLInputElement>;
    radios[1].dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(component.argumentType()).toBe('con');
  });

  it('submit button is disabled when subject is empty', () => {
    component.subject.set('');
    component.text.set('some text');
    fixture.detectChanges();
    const btn = el.querySelector('#navigate_create button') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it('submit button is disabled when text is empty', () => {
    component.subject.set('a subject');
    component.text.set('');
    fixture.detectChanges();
    const btn = el.querySelector('#navigate_create button') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it('footer menu has class open when isOpen is false', () => {
    component.isOpen.set(false);
    fixture.detectChanges();
    const menu = el.querySelector('#create_argument_footer_menu') as HTMLElement;
    expect(menu.classList.contains('open')).toBe(true);
  });

  it('footer form has class open when isOpen is true', () => {
    component.isOpen.set(true);
    fixture.detectChanges();
    const footer = el.querySelector('#create_argument_footer') as HTMLElement;
    expect(footer.classList.contains('open')).toBe(true);
  });
});
