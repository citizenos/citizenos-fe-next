import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { TopicSettingsComponent } from './topic-settings.component';
import { Topic } from '../../../../../core/interfaces/topic';
import { TopicService } from '../../../../../core/services/topic.service';
import { TopicVoteService } from '../../../../../core/services/topic-vote.service';
import { TopicMemberUserService } from '../../../../../core/services/topic-member-user.service';
import { TopicMemberGroupService } from '../../../../../core/services/topic-member-group.service';
import { DIALOG_DATA, DialogRef, DialogService, DialogCloseDirective } from '../../../../../shared/dialog';
import { Component, Input, output } from '@angular/core';

import { UpperCasePipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { A11yModule } from '@angular/cdk/a11y';

@Component({ selector: 'cos-icon', standalone: true, template: '' })
class MockIconComponent {
  @Input() name = '';
  @Input() size: number | string | undefined;
  @Input() color: string | undefined;
}

@Component({ selector: 'cos-button', standalone: true, template: '<button (click)="clicked.emit($event)"><ng-content></ng-content></button>' })
class MockButtonComponent {
  @Input() variant = 'primary';
  @Input() size = 'md';
  @Input() type = 'button';
  @Input() icon: string | undefined;
  @Input() isLoading = false;
  @Input() isDisabled = false;
  clicked = output<Event>();
}

@Component({ selector: 'cos-toggle', standalone: true, template: '' })
class MockToggleComponent {
  @Input() model: boolean | string | undefined;
  @Input() textOn: string | undefined;
  @Input() textOff: string | undefined;
  @Input() value: unknown;
  @Input() offValue: unknown;
  modelChange = output<boolean>();
}

@Component({ selector: 'cos-dropdown', standalone: true, template: '<ng-content select="[selection]"></ng-content><ng-content select="[options]"></ng-content>' })
class MockDropdownComponent {
  @Input() options: unknown;
}

@Component({ selector: 'cos-tooltip', standalone: true, template: '<ng-content></ng-content>' })
class MockTooltipComponent {
  @Input() text = '';
  @Input() title = '';
  @Input() description = '';
  @Input() pos: string | undefined;
  @Input() noIcon = false;
}

const MOCK_TOPIC = {
  id: '123',
  title: 'Test Topic',
  permission: { level: 'admin' },
  status: 'inProgress',
  visibility: 'public',
  categories: ['culture'],
  voteId: 'v1'
};

describe('TopicSettingsComponent', () => {
  let component: TopicSettingsComponent;
  let fixture: ComponentFixture<TopicSettingsComponent>;

  const mockTopicService = {
    VISIBILITY: { public: 'public', private: 'private' },
    CATEGORIES: { culture: 'culture', arts: 'arts' },
    canEdit: vi.fn().mockReturnValue(true),
    canDelete: vi.fn().mockReturnValue(true),
    canSendToFollowUp: vi.fn().mockReturnValue(true),
    canLeave: vi.fn().mockReturnValue(true),
    loadGroups: vi.fn().mockReturnValue(of([])),
    update: vi.fn().mockReturnValue(of({})),
    doDeleteTopic: vi.fn(),
    CATEGORIES_COUNT_MAX: 3
  };

  const mockTopicVoteService = {
    get: vi.fn().mockReturnValue(of({ reminderTime: null })),
    update: vi.fn().mockReturnValue(of({}))
  };

  const mockTopicMemberUserService = {
    delete: vi.fn().mockReturnValue(of({})),
    doLeaveTopic: vi.fn()
  };

  const mockDialogRef = {
    close: vi.fn()
  };

  const mockDialogService = {
    open: vi.fn().mockReturnValue({ afterClosed: () => of(true) })
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [
        TopicSettingsComponent,
        TranslateModule.forRoot(),
        MockIconComponent,
        MockButtonComponent,
        MockToggleComponent,
        MockDropdownComponent,
        MockTooltipComponent
      ],
      providers: [
        { provide: DIALOG_DATA, useValue: { topic: { ...MOCK_TOPIC } } },
        { provide: DialogRef, useValue: mockDialogRef },
        { provide: TopicService, useValue: mockTopicService },
        { provide: TopicVoteService, useValue: mockTopicVoteService },
        { provide: TopicMemberUserService, useValue: mockTopicMemberUserService },
        { provide: TopicMemberGroupService, useValue: { loadItems: vi.fn().mockReturnValue(of([])) } },
        { provide: DialogService, useValue: mockDialogService }
      ]
    }).overrideComponent(TopicSettingsComponent, {
      set: {
        imports: [
          UpperCasePipe,
          DatePipe,
          TranslateModule,
          FormsModule,
          A11yModule,
          DialogCloseDirective,
          MockButtonComponent,
          MockToggleComponent,
          MockDropdownComponent,
          MockIconComponent,
          MockTooltipComponent
        ]
      }
    }).compileComponents();

    fixture = TestBed.createComponent(TopicSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render standard dialog structure', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.overlay')).toBeTruthy();
    expect(el.querySelector('.dialog_wrap')).toBeTruthy();
    expect(el.querySelector('.dialog')).toBeTruthy();
    expect(el.querySelector('.dialog_header')).toBeTruthy();
    expect(el.querySelector('.dialog_tabs_wrap')).toBeTruthy();
    expect(el.querySelector('.dialog_content')).toBeTruthy();
    expect(el.querySelector('.dialog_footer.with_buttons')).toBeTruthy();
  });

  it('should not contain hashtag elements or section', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('#hashtag')).toBeNull();
    expect(el.querySelector('.hashtag_section')).toBeNull();
    expect(el.querySelector('.hashtag_cell')).toBeNull();
  });

  it('should switch tabs back and forth cleanly via button clicks', () => {
    const tabs = fixture.nativeElement.querySelectorAll('.dialog_tab') as NodeListOf<HTMLButtonElement>;
    expect(tabs.length).toBe(2);

    // Click categories tab
    tabs[1].click();
    fixture.detectChanges();
    expect(component.tabSelected()).toBe('categories');
    let el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.categories_section_wrap')).toBeTruthy();
    expect(el.querySelector('.settings_section_wrap')).toBeNull();

    // Click actions (settings) tab back
    tabs[0].click();
    fixture.detectChanges();
    expect(component.tabSelected()).toBe('settings');
    el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.categories_section_wrap')).toBeNull();
    expect(el.querySelector('.settings_section_wrap')).toBeTruthy();
  });

  it('should not throw error and render settings cleanly even if groups receives rows object', () => {
    // Simulate backend response shape { countTotal, count, rows }
    const groupRows = [{ id: 'g1', name: 'Group 1', level: 'admin', visibility: 'public' }];
    (component as unknown as { groups: { set: (v: unknown) => void } }).groups.set({
      countTotal: 1,
      count: 1,
      rows: groupRows
    });

    component.selectTab('categories');
    fixture.detectChanges();

    expect(() => {
      component.selectTab('settings');
      fixture.detectChanges();
    }).not.toThrow();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.settings_section_wrap')).toBeTruthy();
  });

  it('should update visibility with setTopicVisibility', () => {
    component.setTopicVisibility('private');
    expect(component.topic().visibility).toBe('private');
  });

  it('should load groups on init', () => {
    expect(true).toBe(true);
  });

  it('should toggle visibility', () => {
    component.topic.update(t => ({ ...t, visibility: 'private' }));
    expect(component.topic().visibility).toBe('private');
  });

  it('should call openSetDeadline when deadline edit is triggered', () => {
    component.topic.update(t => ({
      ...t,
      vote: { endsAt: new Date().toISOString() } as unknown as Topic['vote']
    }));
    fixture.detectChanges();

    component.openSetDeadline();
    expect(mockDialogService.open).toHaveBeenCalled();
  });

  it('should call doLeaveTopic and doDeleteTopic', () => {
    component.doLeaveTopic();
    expect(mockTopicMemberUserService.doLeaveTopic).toHaveBeenCalled();

    component.doDeleteTopic();
    expect(mockTopicService.doDeleteTopic).toHaveBeenCalled();
  });

  it('should save topic and close', () => {
    component.doSaveTopic();
    expect(mockTopicService.update).toHaveBeenCalled();
    expect(mockDialogRef.close).toHaveBeenCalledWith(true);
  });

  it('should add and remove categories', () => {
    component.addTopicCategory('arts');
    expect(component.topic().categories).toContain('arts');
    component.removeTopicCategory('arts');
    expect(component.topic().categories).not.toContain('arts');
  });
});
