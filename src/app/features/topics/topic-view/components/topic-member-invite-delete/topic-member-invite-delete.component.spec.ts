import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Subject } from 'rxjs';

import { TopicMemberInviteDeleteComponent } from './topic-member-invite-delete.component';
import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';
import { DialogRef, DialogCloseDirective } from '../../../../../shared/dialog/dialog-ref';
import { TopicMemberUser } from '../../../../../core/services/topic-member-user.service';

@Component({ selector: 'cos-initials', standalone: true, template: '{{ name }}' })
class MockInitialsComponent {
  @Input() name = '';
}

const MOCK_USER = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  imageUrl: null,
  creator: { id: '', name: '' },
};

describe('TopicMemberInviteDeleteComponent', () => {
  let fixture: ComponentFixture<TopicMemberInviteDeleteComponent>;
  let component: TopicMemberInviteDeleteComponent;
  let dialogRefMock: { close: ReturnType<typeof vi.fn>; afterClosed: () => unknown };

  beforeEach(async () => {
    dialogRefMock = {
      close: vi.fn(),
      afterClosed: () => new Subject().asObservable(),
    };

    await TestBed.configureTestingModule({
      imports: [
        TopicMemberInviteDeleteComponent,
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: DIALOG_DATA, useValue: { user: MOCK_USER } },
        { provide: DialogRef, useValue: dialogRefMock },
      ],
    })
      .overrideComponent(TopicMemberInviteDeleteComponent, {
        set: { imports: [TranslateModule, MockInitialsComponent, DialogCloseDirective] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(TopicMemberInviteDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders without errors', () => {
    expect(component).toBeTruthy();
  });

  it('shows user name', () => {
    expect(fixture.nativeElement.textContent).toContain('Test User');
  });

  it('shows initials when no imageUrl', () => {
    const initials = fixture.nativeElement.querySelector('cos-initials');
    expect(initials).toBeTruthy();
  });

  it('shows image when user has imageUrl', async () => {
    const fixtureWithImage = TestBed.createComponent(TopicMemberInviteDeleteComponent);
    // Recreate with a new DIALOG_DATA that has imageUrl
    // We override the user property directly and force re-render
    fixtureWithImage.componentInstance.user = { ...MOCK_USER, imageUrl: 'http://example.com/img.jpg' } as unknown as TopicMemberUser;
    fixtureWithImage.changeDetectorRef.markForCheck();
    fixtureWithImage.detectChanges();
    const img = fixtureWithImage.nativeElement.querySelector('img.profile_image');
    expect(img).toBeTruthy();
    expect(img.src).toContain('img.png');
  });

  it('does not close dialog when no option selected', () => {
    component.invitesToDelete = null;
    component.removeInvites();
    expect(dialogRefMock.close).not.toHaveBeenCalled();
  });

  it('closes dialog with "1" when option 1 selected', () => {
    component.invitesToDelete = '1';
    component.removeInvites();
    expect(dialogRefMock.close).toHaveBeenCalledWith('1');
  });

  it('closes dialog with "all" when all option selected', () => {
    component.invitesToDelete = 'all';
    component.removeInvites();
    expect(dialogRefMock.close).toHaveBeenCalledWith('all');
  });

  it('sets invitesToDelete to "1" when first radio input changed', () => {
    const inputs = fixture.nativeElement.querySelectorAll('input[type="radio"]');
    inputs[0].dispatchEvent(new Event('change'));
    expect(component.invitesToDelete).toBe('1');
  });

  it('sets invitesToDelete to "all" when second radio input changed', () => {
    const inputs = fixture.nativeElement.querySelectorAll('input[type="radio"]');
    inputs[1].dispatchEvent(new Event('change'));
    expect(component.invitesToDelete).toBe('all');
  });
});
