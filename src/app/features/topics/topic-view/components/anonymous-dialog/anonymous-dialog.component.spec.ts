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

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show idea posting text when type is "idea"', () => {
    fixture.componentRef.setInput('type', 'idea');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.bold-text')?.textContent).toContain('MODALS.TOPIC_IDEA_ANONYMOUS_MODAL_TITLE');
    expect(compiled.querySelector('.light-text')?.textContent).toContain('MODALS.TOPIC_IDEA_ANONYMOUS_MODAL_TXT');
  });

  it('should show draft saving text when type is "draft"', () => {
    fixture.componentRef.setInput('type', 'draft');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.bold-text')?.textContent).toContain('MODALS.TOPIC_IDEA_POSTING_DRAFT_ANONYMOUSLY');
    expect(compiled.querySelector('.light-text')).toBeNull();
  });
});
