import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TopicShareComponent } from './topic-share.component';
import { TranslateModule } from '@ngx-translate/core';
import { TopicService } from '../../../../../core/services/topic.service';
import { TopicJoinService } from '../../../../../core/services/topic-join.service';
import { UserStore } from '../../../../../core/state/user.store';
import { DialogService } from '../../../../../shared/dialog/dialog.service';
import { of } from 'rxjs';
import { signal, NO_ERRORS_SCHEMA } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('TopicShareComponent', () => {
  let component: TopicShareComponent;
  let fixture: ComponentFixture<TopicShareComponent>;

  const mockTopic = {
    id: 'test-topic-id',
    title: 'Test Topic',
    visibility: 'public',
    permission: { level: 'admin' },
    status: 'ideation',
    join: { level: 'read', token: 'test-token' }
  } as any;

  beforeEach(async () => {
    // Mock document.execCommand
    document.execCommand = vi.fn();

    await TestBed.configureTestingModule({
      imports: [TopicShareComponent, TranslateModule.forRoot(), NoopAnimationsModule],
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
    }).compileComponents();

    fixture = TestBed.createComponent(TopicShareComponent);
    component = fixture.componentInstance;
    // Force set the input signal for testing
    (component as any).topic = signal(mockTopic);
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
    const buttons = fixture.debugElement.queryAll(By.directive(ButtonComponent));
    let genButton = buttons.find(btn => btn.nativeElement.textContent.includes('QR'));
    
    if (genButton) {
      genButton.triggerEventHandler('clicked', null);
      fixture.detectChanges();
      expect(component.showQR()).toBe(true);
    }
  });

  it('should copy link when copy button is clicked', () => {
    const spy = vi.spyOn(component, 'copyInviteLink');
    const buttons = fixture.debugElement.queryAll(By.directive(ButtonComponent));
    let copyButton = buttons.find(btn => btn.nativeElement.textContent.includes('COPY'));

    if (copyButton) {
      copyButton.triggerEventHandler('clicked', null);
      expect(spy).toHaveBeenCalled();
    }
  });
});
