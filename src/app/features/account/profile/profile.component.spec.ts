import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileComponent } from './profile.component';
import { UserStore } from '../../../core/state/user.store';
import { TopicNotificationService } from '../../../core/services/topic-notification.service';
import { ConfigStore } from '../../../core/state/config.store';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DialogService } from '../../../shared/dialog/dialog.service';
import { TranslateModule } from '@ngx-translate/core';
import { of, BehaviorSubject, Subject } from 'rxjs';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA, Component, Input, Output, EventEmitter, signal } from '@angular/core';

@Component({ selector: 'cos-initials', standalone: true, template: '' })
class MockInitialsComponent { @Input() name?: string; }

@Component({ selector: 'cos-pagination', standalone: true, template: '' })
class MockPaginationComponent { @Input() totalPages = 0; @Input() page = 0; @Output() selectPage = new EventEmitter<number>(); }

@Component({ selector: 'cos-terms-links', standalone: true, template: '' })
class MockTermsLinksComponent {}

@Component({ selector: 'cos-toggle', standalone: true, template: '' })
class MockToggleComponent { @Input() model = false; @Input() textOn = ''; @Input() textOff = ''; @Output() toggleClick = new EventEmitter<boolean>(); }

@Component({ selector: 'cos-dropdown', standalone: true, template: '<ng-content select="[selection]"></ng-content><ng-content select="[options]"></ng-content>' })
class MockDropdownComponent { @Input() placeholder = ''; }

@Component({ selector: 'cos-input', standalone: true, template: '<ng-content></ng-content>' })
class MockInputComponent { @Input() placeholder = ''; @Input() hasError = false; }

@Component({ selector: 'cos-icon', standalone: true, template: '' })
class MockIconComponent { @Input() name = ''; }

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let mockUserStore: unknown;
  let mockTopicNotificationService: unknown;
  let mockConfigStore: unknown;
  let mockDialogService: unknown;
  let mockRouter: unknown;

  beforeEach(async () => {
    mockUserStore = {
      user: signal({ id: '1', name: 'Test User', email: 'test@example.com', language: 'en', preferences: { showInSearch: true } }),
      isLoading: signal(false),
      updateProfile: vi.fn().mockResolvedValue({}),
      logout: vi.fn(),
      deleteAccount: vi.fn().mockResolvedValue({})
    };

    mockTopicNotificationService = {
      params: new BehaviorSubject({ limit: 10 }),
      page: new BehaviorSubject(1),
      totalPages: new BehaviorSubject(1),
      items$: of([]),
      setParam: vi.fn(),
      loadPage: vi.fn(),
      doOrder: vi.fn(),
      update: vi.fn().mockReturnValue(of({})),
      delete: vi.fn().mockReturnValue(of({}))
    };

    mockConfigStore = {
      setLanguage: vi.fn(),
      api: { baseUrl: vi.fn(() => 'http://test') }
    };

    mockDialogService = {
      open: vi.fn()
    };

    mockRouter = {
      navigate: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        ProfileComponent,
        TranslateModule.forRoot(),
        FormsModule,
        RouterModule.forRoot([])
      ],
      providers: [
        { provide: UserStore, useValue: mockUserStore },
        { provide: TopicNotificationService, useValue: mockTopicNotificationService },
        { provide: ConfigStore, useValue: mockConfigStore },
        { provide: DialogService, useValue: mockDialogService },
        {
          provide: ActivatedRoute,
          useValue: {
            fragment: of('profile'),
            snapshot: { fragment: 'profile' }
          }
        },
        { provide: Router, useValue: mockRouter }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(ProfileComponent, {
      set: {
        imports: [
          MockInitialsComponent,
          MockPaginationComponent,
          MockTermsLinksComponent,
          MockToggleComponent,
          MockDropdownComponent,
          MockInputComponent,
          MockIconComponent,
          TranslateModule,
          
          FormsModule,
          ReactiveFormsModule
        ]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with user data', async () => {
    expect(component.form.name).toBe('Test User');
    expect(component.form.language).toBe('en');
    
    fixture.detectChanges();
    await fixture.whenStable();
    
    const compiled = fixture.nativeElement as HTMLElement;
    const nameInput = compiled.querySelector('#name') as HTMLInputElement;
    expect(nameInput?.value).toBe('Test User');
  });

  it('should switch tabs', () => {
    component.selectTab('notifications');
    expect((mockRouter as { navigate: Mock }).navigate).toHaveBeenCalledWith([], { fragment: 'notifications' });
  });

  it('should toggle password reset mode', () => {
    expect(component.resetPasswordMode()).toBeFalsy();
    component.toggleResetPassword();
    expect(component.resetPasswordMode()).toBeTruthy();
  });

  it('should update profile', async () => {
    component.form.name = 'Updated Name';
    await component.doUpdateProfile();
    expect((mockUserStore as { updateProfile: Mock }).updateProfile).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Updated Name'
    }));
  });

  it('should show error on password mismatch during update', async () => {
    component.resetPasswordMode.set(true);
    fixture.detectChanges();
    component.form.newPassword = 'pass1';
    component.form.passwordConfirm = 'pass2';
    
    await component.doUpdateProfile();
    fixture.detectChanges();
    
    expect(component.errors.newPassword).toBe('MODALS.PASSWORD_MISMATCH');
    
    const compiled = fixture.nativeElement as HTMLElement;
    const errorText = compiled.querySelector('.error_label');
    expect(errorText?.textContent).toContain('MODALS.PASSWORD_MISMATCH');
  });

  it('should set profile language', async () => {
    await component.setProfileLanguage('et');
    expect(component.form.language).toBe('et');
    expect((mockConfigStore as { setLanguage: Mock }).setLanguage).toHaveBeenCalledWith('et');
    expect((mockUserStore as { updateProfile: Mock }).updateProfile).toHaveBeenCalledWith({ language: 'et' });
  });

  it('should delete account after confirmation', async () => {
    const afterClosedSubject = new Subject<boolean>();
    (mockDialogService as { open: Mock }).open.mockReturnValue({
      afterClosed: () => afterClosedSubject.asObservable()
    });

    await component.doDeleteAccount();
    expect((mockDialogService as { open: Mock }).open).toHaveBeenCalled();

    afterClosedSubject.next(true);
    // Wait for microtasks
    await new Promise(resolve => setTimeout(resolve, 0));

    expect((mockUserStore as { deleteAccount: Mock }).deleteAccount).toHaveBeenCalled();
    expect((mockRouter as { navigate: Mock }).navigate).toHaveBeenCalledWith(['/']);
  });

  it('should delete user image', async () => {
    component.form.imageUrl = 'some-url';
    await component.deleteUserImage();
    expect(component.form.imageUrl).toBe('');
    expect((mockUserStore as { updateProfile: Mock }).updateProfile).toHaveBeenCalledWith({ imageUrl: '' });
  });

  it('should search topics in notifications tab', () => {
    component.topicSearch.set('test search');
    component.searchTopics();
    expect((mockTopicNotificationService as { setParam: Mock }).setParam).toHaveBeenCalledWith('search', 'test search');
  });

  it('should toggle topic notifications (delete)', async () => {
    const afterClosedSubject = new Subject<boolean>();
    (mockDialogService as { open: Mock }).open.mockReturnValue({
      afterClosed: () => afterClosedSubject.asObservable()
    });

    const mockTopic = { topicId: '123', allowNotifications: false };
    component.toggleTopicNotifications(mockTopic);
    
    expect((mockDialogService as { open: Mock }).open).toHaveBeenCalled();
    afterClosedSubject.next(true);
    
    expect((mockTopicNotificationService as { delete: Mock }).delete).toHaveBeenCalledWith('123');
  });
});
