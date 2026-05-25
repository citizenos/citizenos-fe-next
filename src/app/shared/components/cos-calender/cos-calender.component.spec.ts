import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { CosCalenderComponent } from './cos-calender.component';

describe('CosCalenderComponent', () => {
  let component: CosCalenderComponent;
  let fixture: ComponentFixture<CosCalenderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), CosCalenderComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CosCalenderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should generate calendar weeks array', () => {
    expect(component.calendar()).toBeTruthy();
    expect(component.calendar().length).toBe(6);
    expect(component.calendar()[0].length).toBe(7);
  });

  it('should change month when setMonth is called', () => {
    const currentMonth = component.month();
    component.setMonth(1);
    expect(component.month()).toBe((currentMonth + 1) % 12);
  });

  it('should select date and emit event', () => {
    const spy = vi.spyOn(component.dateChange, 'emit');
    component.selectDate(15);
    expect(spy).toHaveBeenCalled();
    expect(component.selectedDate().getDate()).toBe(15);
  });
});
