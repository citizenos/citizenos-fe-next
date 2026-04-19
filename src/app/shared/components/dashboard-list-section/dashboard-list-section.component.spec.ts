import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { describe, it, expect, beforeEach } from 'vitest';
import { DashboardListSectionComponent } from './dashboard-list-section.component';
import { IconRegistryService } from '../icon/icon.registry';

describe('DashboardListSectionComponent', () => {
  let fixture: ComponentFixture<DashboardListSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardListSectionComponent, TranslateModule.forRoot()],
      providers: [provideRouter([]), IconRegistryService],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardListSectionComponent);
    fixture.componentRef.setInput('sectionTitleKey', 'VIEWS.DASHBOARD.PUBLIC_TOPICS_HEADER');
    fixture.componentRef.setInput('viewAllLabelKey', 'VIEWS.DASHBOARD.PUBLIC_TOPICS_LNK_VIEW_ALL');
    fixture.componentRef.setInput('viewAllLink', ['/', 'en', 'public', 'topics']);
    fixture.detectChanges();
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders section header and view-all link', () => {
    const link = fixture.nativeElement.querySelector('a.view_more_link');
    expect(link).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.section_content')).toBeTruthy();
  });
});
