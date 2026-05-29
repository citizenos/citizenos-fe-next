import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SiteNotificationComponent } from './site-notification.component';
import { ConfigStore } from '../../../core/state/config.store';
import { TranslateModule } from '@ngx-translate/core';
import { By } from '@angular/platform-browser';

describe('SiteNotificationComponent', () => {
  let component: SiteNotificationComponent;
  let fixture: ComponentFixture<SiteNotificationComponent>;

  const mockConfigStore = {
    showIssueNotification: () => true
  };

  beforeEach(async () => {
    // Clear localStorage before each test
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [SiteNotificationComponent, TranslateModule.forRoot()],
      providers: [
        { provide: ConfigStore, useValue: mockConfigStore }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SiteNotificationComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should show notification if enabled in config and cookie not set', () => {
    fixture.detectChanges();
    
    expect(component.showNotification()).toBe(true);
    const notificationEl = fixture.debugElement.query(By.css('.notification_top'));
    expect(notificationEl).toBeTruthy();
  });

  it('should hide notification if cookie is set', () => {
    localStorage.setItem('show-issue-notification', 'true');
    fixture.detectChanges();
    
    expect(component.showNotification()).toBe(false);
    const notificationEl = fixture.debugElement.query(By.css('.notification_top'));
    expect(notificationEl).toBeFalsy();
  });

  it('should close notification and set cookie when close button is clicked', () => {
    fixture.detectChanges();
    
    const closeButton = fixture.debugElement.query(By.css('.btn_medium_nav'));
    closeButton.nativeElement.click();
    fixture.detectChanges();

    expect(component.showNotification()).toBe(false);
    expect(localStorage.getItem('show-issue-notification')).toBe('true');
  });
});
