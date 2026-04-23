import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { ProfileComponent } from './profile.component';
import { UserStore } from '../../../core/state/user.store';
import { TopicNotificationService } from '../../../core/services/topic-notification.service';
import { ConfigStore } from '../../../core/state/config.store';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DialogService } from '../../../shared/dialog/dialog.service';
import { TranslateModule } from '@ngx-translate/core';
import { of, BehaviorSubject } from 'rxjs';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA, Component, Input, Output, EventEmitter } from '@angular/core';

@Component({ selector: 'cos-initials', standalone: true, template: '' })
class MockInitialsComponent { @Input() name?: string; }

@Component({ selector: 'cos-pagination', standalone: true, template: '' })
class MockPaginationComponent { @Input() totalPages = 0; @Input() page = 0; @Output() select = new EventEmitter<number>(); }

@Component({ selector: 'cos-terms-links', standalone: true, template: '' })
class MockTermsLinksComponent {}

@Component({ selector: 'cos-toggle', standalone: true, template: '' })
class MockToggleComponent { @Input() model = false; @Input() textOn = ''; @Input() textOff = ''; @Output() toggleClick = new EventEmitter<boolean>(); }

@Component({ selector: 'cos-dropdown', standalone: true, template: '<ng-content select="[selection]"></ng-content><ng-content select="[options]"></ng-content>' })
class MockDropdownComponent {}

@Component({ selector: 'cos-input', standalone: true, template: '<ng-content></ng-content>' })
class MockInputComponent { @Input() placeholder = ''; @Input() hasError = false; }

@Component({ selector: 'cos-icon', standalone: true, template: '' })
class MockIconComponent { @Input() name = ''; }

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let mockUserStore: any;
  let mockTopicNotificationService: any;
  let mockConfigStore: any;
  let mockDialogService: any;

  beforeEach(async () => {
    mockUserStore = {
      user: vi.fn(() => ({ id: '1', name: 'Test User', email: 'test@example.com', language: 'en', preferences: { showInSearch: true } })),
      isLoading: vi.fn(() => false),
      updateProfile: vi.fn().mockResolvedValue({}),
      logout: vi.fn(),
      deleteAccount: vi.fn()
    };

    mockTopicNotificationService = {
      params: new BehaviorSubject({ limit: 10 }),
      page: new BehaviorSubject(1),
      totalPages: new BehaviorSubject(1),
      items$: of([]),
      setParam: vi.fn(),
      loadPage: vi.fn(),
      doOrder: vi.fn(),
      update: vi.fn().mockReturnValue(of({}))
    };

    mockConfigStore = {
      setLanguage: vi.fn(),
      api: { baseUrl: vi.fn(() => 'http://test') }
    };

    mockDialogService = {
      confirm: vi.fn()
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
        {
          provide: Router,
          useValue: { navigate: vi.fn() }
        }
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
          CommonModule,
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

  it('should initialize form with user data', () => {
    expect(component.form.name).toBe('Test User');
    expect(component.form.language).toBe('en');
  });
});
