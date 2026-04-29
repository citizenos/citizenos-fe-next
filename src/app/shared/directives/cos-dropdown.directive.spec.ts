import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CosDropdownDirective } from './cos-dropdown.directive';
import { By } from '@angular/platform-browser';

@Component({
  template: `
    <div cosDropdown id="dropdown">
      <button id="toggle">Toggle</button>
      <div class="options">Options</div>
    </div>
    <div id="outside">Outside</div>
  `,
  standalone: true,
  imports: [CosDropdownDirective]
})
class TestComponent {}

describe('CosDropdownDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let divEl: HTMLElement;
  let outsideEl: HTMLElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    divEl = fixture.debugElement.query(By.directive(CosDropdownDirective)).nativeElement;
    outsideEl = fixture.debugElement.query(By.css('#outside')).nativeElement;
  });

  it('should toggle class dropdown_active on click', () => {
    const toggleBtn = fixture.debugElement.query(By.css('#toggle')).nativeElement;
    
    toggleBtn.click();
    fixture.detectChanges();
    expect(divEl.classList.contains('dropdown_active')).toBe(true);

    toggleBtn.click();
    fixture.detectChanges();
    expect(divEl.classList.contains('dropdown_active')).toBe(false);
  });

  it('should remove dropdown_active on click outside', () => {
    divEl.click();
    fixture.detectChanges();
    expect(divEl.classList.contains('dropdown_active')).toBe(true);

    outsideEl.click();
    fixture.detectChanges();
    expect(divEl.classList.contains('dropdown_active')).toBe(false);
  });

  it('should remove dropdown_active on click inside options if not multipleChoice', () => {
    divEl.click();
    fixture.detectChanges();
    expect(divEl.classList.contains('dropdown_active')).toBe(true);

    const optionsEl = fixture.debugElement.query(By.css('.options')).nativeElement;
    optionsEl.click();
    fixture.detectChanges();
    expect(divEl.classList.contains('dropdown_active')).toBe(false);
  });

  it('should close dropdown on Escape key', () => {
    divEl.click();
    fixture.detectChanges();
    expect(divEl.classList.contains('dropdown_active')).toBe(true);

    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(event);
    fixture.detectChanges();
    expect(divEl.classList.contains('dropdown_active')).toBe(false);
  });
});
