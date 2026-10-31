import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnonymousDialogComponent } from './anonymous-dialog.component';
import { TranslateModule } from '@ngx-translate/core';
import { Component, Input } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '../../../../../shared/dialog';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';

@Component({
  selector: 'cos-icon',
  standalone: true,
  template: ''
})
class MockIconComponent {
  @Input() name = '';
}

describe('AnonymousDialogComponent', () => {
  let component: AnonymousDialogComponent;
  let fixture: ComponentFixture<AnonymousDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnonymousDialogComponent, TranslateModule.forRoot()],
      providers: [
        { provide: DialogRef, useValue: { close: () => { return; } } }
      ]
    })
    .overrideComponent(AnonymousDialogComponent, {
      remove: { imports: [IconComponent] },
      add: { imports: [MockIconComponent] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnonymousDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders without error', () => {
    expect(component).toBeTruthy();
  });

  it('defaults to idea type', () => {
    expect(component.type).toBe('idea');
  });

  it('initializes type from DIALOG_DATA when provided', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [AnonymousDialogComponent, TranslateModule.forRoot()],
      providers: [
        { provide: DialogRef, useValue: { close: () => { return; } } },
        { provide: DIALOG_DATA, useValue: { type: 'draft' } },
      ]
    });
    const draftFixture = TestBed.createComponent(AnonymousDialogComponent);
    expect(draftFixture.componentInstance.type).toBe('draft');
  });

  describe('type="idea"', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('type', 'idea');
      fixture.detectChanges();
    });

    it('shows idea modal heading in header', () => {
      const header = fixture.nativeElement.querySelector('.header-text');
      expect(header.textContent).toContain('MODALS.TOPIC_IDEA_POSTING_ANONIMOUSLY');
    });

    it('shows idea title and body text', () => {
      const boldText = fixture.nativeElement.querySelector('.bold-text');
      const lightText = fixture.nativeElement.querySelector('.light-text');
      expect(boldText?.textContent).toContain('MODALS.TOPIC_IDEA_POSTING_ANONIMOUSLY_TEXT_1');
      expect(lightText?.textContent).toContain('MODALS.TOPIC_IDEA_POSTING_ANONIMOUSLY_TEXT_2');
    });

    it('shows cancel and continue buttons in proper order with primary styling', () => {
      const buttons = fixture.nativeElement.querySelectorAll('.footer-buttons-container button');
      expect(buttons.length).toBe(2);
      expect(buttons[0].textContent).toContain('VIEWS.IDEATION_CREATE.NO_IDEAS_BTN_ADD');
      expect(buttons[0].classList.contains('btn_big_submit')).toBe(true);
      expect(buttons[1].textContent).toContain('VIEWS.IDEATION_CREATE.KEEP_EDITING');
      expect(buttons[1].classList.contains('btn-clear')).toBe(true);
    });
  });

  describe('type="draft"', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('type', 'draft');
      fixture.detectChanges();
    });

    it('shows draft heading in header', () => {
      const header = fixture.nativeElement.querySelector('.header-text');
      expect(header.textContent).toContain('MODALS.TOPIC_IDEA_POSTING_DRAFT_ANONYMOUSLY');
    });

    it('shows draft text 1 (bold) and text 2 (light)', () => {
      const boldText = fixture.nativeElement.querySelector('.bold-text');
      const lightText = fixture.nativeElement.querySelector('.light-text');
      expect(boldText?.textContent).toContain('MODALS.TOPIC_IDEA_POSTING_DRAFT_ANONIMOUSLY_TEXT_1');
      expect(lightText?.textContent).toContain('MODALS.TOPIC_IDEA_POSTING_DRAFT_ANONIMOUSLY_TEXT_2');
    });

    it('shows only the Got it button with primary styling', () => {
      const buttons = fixture.nativeElement.querySelectorAll('.footer-buttons-container button');
      expect(buttons.length).toBe(1);
      expect(buttons[0].textContent).toContain('MODALS.TOPIC_IDEA_POSTING_DRAFT_ANONIMOUSLY_BTN_GOT_IT');
      expect(buttons[0].classList.contains('btn_big_submit')).toBe(true);
    });
  });
});
