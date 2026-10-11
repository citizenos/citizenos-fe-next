import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { VoteOptionsComponent } from './vote-options.component';
import { VoteOption } from '../../../core/interfaces/vote';

describe('VoteOptionsComponent', () => {
  let component: VoteOptionsComponent;
  let fixture: ComponentFixture<VoteOptionsComponent>;

  const mockOptions: VoteOption[] = [
    { value: 'Yes', selected: false },
    { value: 'No', selected: true },
    { value: 'Neutral', selected: false, ideaId: 'idea-123' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VoteOptionsComponent, TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(VoteOptionsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('options', mockOptions);
    fixture.detectChanges();
  });

  it('should create and render options', () => {
    expect(component).toBeTruthy();
    const elements = fixture.nativeElement.querySelectorAll('.vote_option');
    expect(elements.length).toBe(3);
  });

  it('should emit selectionChange when an enabled option is clicked', () => {
    const emitSpy = vi.spyOn(component.selectionChange, 'emit');
    const firstOption = fixture.nativeElement.querySelector('.vote_option');
    firstOption.click();

    expect(emitSpy).toHaveBeenCalledWith(mockOptions[0]);
  });

  it('should not emit selectionChange when disabled or cannot vote', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const emitSpy = vi.spyOn(component.selectionChange, 'emit');
    const firstOption = fixture.nativeElement.querySelector('.vote_option');
    firstOption.click();

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should emit viewIdea when idea button is clicked', () => {
    const ideaSpy = vi.spyOn(component.viewIdea, 'emit');
    const ideaBtn = fixture.nativeElement.querySelector('.view_idea_wrap cos-button button') || fixture.nativeElement.querySelector('.view_idea_wrap cos-button');
    expect(ideaBtn).toBeTruthy();
    ideaBtn.click();

    expect(ideaSpy).toHaveBeenCalledWith(mockOptions[2]);
  });
});
