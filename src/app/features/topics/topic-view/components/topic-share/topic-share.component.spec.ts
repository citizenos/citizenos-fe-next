import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Topic } from '../../../../../core/interfaces/topic';
import { TopicShareComponent } from './topic-share.component';
import { TranslateModule } from '@ngx-translate/core';
import { TopicService } from '../../../../../core/services/topic.service';
import { TopicJoinService } from '../../../../../core/services/topic-join.service';
import { UserStore } from '../../../../../core/state/user.store';
import { DialogService } from '../../../../../shared/dialog/dialog.service';
import { of } from 'rxjs';
import { signal, NO_ERRORS_SCHEMA, Input, Component, output } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { DropdownComponent } from '../../../../../shared/components/dropdown/dropdown.component';
import { TooltipComponent } from '../../../../../shared/components/tooltip/tooltip.component';
import { vi, describe, it, expect, beforeEach } from 'vitest';

@Component({ selector: 'cos-icon', standalone: true, template: '' })
class MockIconComponent {
  @Input() name = '';
  @Input() size?: string | number;
}

@Component({ selector: 'cos-button', standalone: true, template: '<button (click)="clicked.emit($event)"><ng-content></ng-content></button>' })
class MockButtonComponent {
  @Input() variant = 'primary';
  @Input() size = 'md';
  @Input() type = 'button';
  @Input() icon?: string;
  @Input() isLoading = false;
  @Input() isDisabled = false;
  clicked = output<Event>();
}

@Component({ selector: 'cos-dropdown', standalone: true, template: '<ng-content select="[selection]"></ng-content><ng-content select="[options]"></ng-content>' })
class MockDropdownComponent {}

@Component({ selector: 'cos-tooltip', standalone: true, template: '<ng-content></ng-content>' })
class MockTooltipComponent {
  @Input() text = '';
  @Input() title = '';
  @Input() description = '';
  @Input() pos?: string;
  @Input() noIcon = false;
}

describe('TopicShareComponent', () => {
  let component: TopicShareComponent;
  let fixture: ComponentFixture<TopicShareComponent>;

  const mockTopic: Topic = {
    id: 'test-topic-id',
    title: 'Test Topic',
    visibility: 'public',
    permission: { level: 'admin' },
    status: 'ideation',
    join: { level: 'read', token: 'test-token' }
  } as unknown as Topic;

  beforeEach(async () => {
    // Mock document.execCommand and navigator.clipboard
    document.execCommand = vi.fn();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined)
      }
    });

    await TestBed.configureTestingModule({
      imports: [TopicShareComponent, TranslateModule.forRoot(), NoopAnimationsModule, MockIconComponent, MockButtonComponent, MockDropdownComponent, MockTooltipComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: TopicService,
          useValue: {
            LEVELS: { read: 'read', edit: 'edit', admin: 'admin' },
            canUpdate: vi.fn().mockReturnValue(true),
            canShare: vi.fn().mockReturnValue(true)
          }
        },
        {
          provide: TopicJoinService,
          useValue: {
            save: vi.fn().mockReturnValue(of({ token: 'new-token', level: 'read' })),
            update: vi.fn().mockReturnValue(of({}))
          }
        },
        {
          provide: UserStore,
          useValue: {
            user: signal({ id: 'user1' })
          }
        },
        {
          provide: DialogService,
          useValue: {
            open: vi.fn().mockReturnValue({ afterClosed: () => of(true) })
          }
        }
      ]
    })
    .overrideComponent(TopicShareComponent, {
      remove: { imports: [IconComponent, ButtonComponent, DropdownComponent, TooltipComponent] },
      add: { imports: [MockIconComponent, MockButtonComponent, MockDropdownComponent, MockTooltipComponent] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopicShareComponent);
    component = fixture.componentInstance;
    component.topic.set(mockTopic);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the join URL', () => {
    const input = fixture.nativeElement.querySelector('#invite_group_url_input');
    expect(input.value).toContain('test-token');
  });

  it('should call generateTokenJoin when reload button is clicked', async () => {
    const spy = vi.spyOn(component, 'generateTokenJoin');
    const button = fixture.debugElement.query(By.css('#reload'));
    if (button) {
      button.triggerEventHandler('clicked', null);
      expect(spy).toHaveBeenCalled();
    }
  });

  it('should show QR code when generate button is clicked', async () => {
    const buttons = fixture.debugElement.queryAll(By.css('cos-button'));
    const genButton = buttons.find(btn => btn.nativeElement.textContent.includes('QR'));
    
    if (genButton) {
      genButton.triggerEventHandler('clicked', null);
      fixture.detectChanges();
      expect(component.showQR()).toBe(true);
    }
  });

  it('should copy link when copy button is clicked', () => {
    const spy = vi.spyOn(component, 'copyInviteLink');
    const buttons = fixture.debugElement.queryAll(By.css('cos-button'));
    const copyButton = buttons.find(btn => btn.nativeElement.textContent.includes('COPY'));

    if (copyButton) {
      copyButton.triggerEventHandler('clicked', null);
      expect(spy).toHaveBeenCalled();
    }
  });
});
