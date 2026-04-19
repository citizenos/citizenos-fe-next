import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageListHeaderComponent } from './page-list-header.component';
import { Component } from '@angular/core';

@Component({
  standalone: true,
  imports: [PageListHeaderComponent],
  template: `
    <app-page-list-header (searchToggle)="onSearchToggle()">
      <div title>Header Title Test</div>
      <button activities>Activities Test</button>
    </app-page-list-header>
  `
})
class TestHostComponent {
  toggleInvoked = false;
  onSearchToggle() {
    this.toggleInvoked = true;
  }
}

describe('PageListHeaderComponent', () => {
  let hostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, PageListHeaderComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create completely mapped component', () => {
    expect(hostComponent).toBeTruthy();
  });

  it('should project the title element correctly', () => {
    const titleContainer = fixture.nativeElement.querySelector('.small_heading');
    expect(titleContainer.textContent.trim()).toBe('Header Title Test');
  });

  it('should project the activities element correctly', () => {
    const activitiesEl = fixture.nativeElement.querySelector('.header-actions button[activities]');
    expect(activitiesEl.textContent.trim()).toBe('Activities Test');
  });

  it('should emit searchToggle when search icon is clicked', () => {
    const searchBtn = fixture.nativeElement.querySelector('#show_search');
    searchBtn.click();
    expect(hostComponent.toggleInvoked).toBe(true);
  });
});
