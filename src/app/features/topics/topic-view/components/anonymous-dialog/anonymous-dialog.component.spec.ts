import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnonymousDialogComponent } from './anonymous-dialog.component';
import { TranslateModule } from '@ngx-translate/core';
import { Component, Input } from '@angular/core';
import { DialogRef } from '../../../../../shared/dialog/dialog-ref';
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
        { provide: DialogRef, useValue: { close: () => {} } }
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

  describe('type="idea"', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('type', 'idea');
      fixture.detectChanges();
    });

    it('shows idea modal heading in header', () => {
      const header = fixture.nativeElement.querySelector('.header-text');
      expect(header.textContent).toContain('MODALS.TOPIC_IDEA_ANONYMOUS_MODAL_HEADING');
    });

    it('shows idea title and body text', () => {
      const boldText = fixture.nativeElement.querySelector('.bold-text');
      const lightText = fixture.nativeElement.querySelector('.light-text');
      expect(boldText?.textContent).toContain('MODALS.TOPIC_IDEA_ANONYMOUS_MODAL_TITLE');
      expect(lightText?.textContent).toContain('MODALS.TOPIC_IDEA_ANONYMOUS_MODAL_TXT');
    });

    it('shows cancel and continue buttons', () => {
      const buttons = fixture.nativeElement.querySelectorAll('.footer-buttons-container button');
      expect(buttons.length).toBe(2);
      expect(buttons[0].textContent).toContain('MODALS.TOPIC_IDEA_ANONYMOUS_MODAL_BTN_CANCEL');
      expect(buttons[1].textContent).toContain('MODALS.TOPIC_IDEA_ANONYMOUS_MODAL_BTN_CONTINUE');
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

    it('shows only the Got it button', () => {
      const buttons = fixture.nativeElement.querySelectorAll('.footer-buttons-container button');
      expect(buttons.length).toBe(1);
      expect(buttons[0].textContent).toContain('MODALS.TOPIC_IDEA_POSTING_DRAFT_ANONIMOUSLY_BTN_GOT_IT');
    });
  });
});
