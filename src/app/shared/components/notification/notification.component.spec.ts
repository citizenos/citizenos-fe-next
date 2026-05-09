import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationComponent } from './notification.component';
import { NotificationService, Notification } from '../../../core/services/notification.service';
import { signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Component, Input } from '@angular/core';

@Component({ selector: 'cos-icon', standalone: true, template: '' })
class MockIconComponent { @Input() name = ''; @Input() size: string | number = 24; }

describe('NotificationComponent', () => {
  let component: NotificationComponent;
  let fixture: ComponentFixture<NotificationComponent>;
  const mockNotifications = signal<Notification[]>([]);
  const mockService = {
    notifications: mockNotifications.asReadonly(),
    dismiss: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    mockNotifications.set([]);

    await TestBed.configureTestingModule({
      imports: [NotificationComponent, TranslateModule.forRoot()],
      providers: [{ provide: NotificationService, useValue: mockService }]
    })
    .overrideComponent(NotificationComponent, {
      set: { imports: [TranslateModule, MockIconComponent] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render no notifications when list is empty', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelectorAll('.cos-notification').length).toBe(0);
  });

  it('should render notifications when present', async () => {
    mockNotifications.set([{ id: 'n1', level: 'success', messageKey: 'MSG' }]);
    fixture.detectChanges();
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelectorAll('.cos-notification').length).toBe(1);
  });

  it('should apply level class to notification', async () => {
    mockNotifications.set([{ id: 'n1', level: 'error', messageKey: 'MSG' }]);
    fixture.detectChanges();
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.cos-notification--error')).toBeTruthy();
  });

  it('should call dismiss with correct id', () => {
    component.dismiss('n1');
    expect(mockService.dismiss).toHaveBeenCalledWith('n1');
  });
});
