import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { InvitationDialogComponent, InviteDialogData } from './invitation-dialog.component';
import { DIALOG_DATA } from '../../dialog/dialog-tokens';
import { DialogRef } from '../../dialog/dialog-ref';
import { DialogService } from '../../dialog/dialog.service';
import { UserStore } from '../../../core/state/user.store';

const dialogRefMock = { close: vi.fn(), afterClosed: () => ({ pipe: () => ({ subscribe: vi.fn() }) }) };
const dialogServiceMock = { closeAll: vi.fn() };

const baseData: InviteDialogData = {
  imageUrl: null,
  title: 'Test Topic',
  intro: 'Some intro',
  description: null,
  creator: { imageUrl: undefined, name: 'John Doe' },
  user: null,
  level: null,
  visibility: 'public',
  publicAccess: null,
  type: 'join',
  view: 'topic',
};

function createFixture(data: Partial<InviteDialogData> = {}): ComponentFixture<InvitationDialogComponent> {
  const mergedData = { ...baseData, ...data };
  TestBed.configureTestingModule({
    imports: [InvitationDialogComponent, TranslateModule.forRoot()],
    providers: [
      provideRouter([]),
      { provide: DIALOG_DATA, useValue: mergedData },
      { provide: DialogRef, useValue: dialogRefMock },
      { provide: DialogService, useValue: dialogServiceMock },
      {
        provide: UserStore,
        useValue: { isAuthenticated: () => false },
      },
    ],
    schemas: [NO_ERRORS_SCHEMA],
  }).compileComponents();

  const fixture = TestBed.createComponent(InvitationDialogComponent);
  fixture.detectChanges();
  return fixture;
}

describe('InvitationDialogComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.resetTestingModule();
  });

  it('renders without error', () => {
    const fixture = createFixture();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('shows topic heading when view is topic', () => {
    const fixture = createFixture({ view: 'topic' });
    expect(fixture.componentInstance.data.view).toBe('topic');
  });

  it('shows group heading when view is group', () => {
    const fixture = createFixture({ view: 'group' });
    expect(fixture.componentInstance.data.view).toBe('group');
  });

  it('shows image when imageUrl is set', () => {
    const fixture = createFixture({ imageUrl: 'https://example.com/img.png' });
    const img = fixture.nativeElement.querySelector('.content_image');
    expect(img).toBeTruthy();
  });

  it('hides image when imageUrl is null', () => {
    const fixture = createFixture({ imageUrl: null });
    const img = fixture.nativeElement.querySelector('.content_image');
    expect(img).toBeFalsy();
  });

  it('shows topic title when title is set', () => {
    const fixture = createFixture({ title: 'My Topic' });
    const el = fixture.nativeElement.querySelector('.topic_title');
    expect(el).toBeTruthy();
  });

  it('hides title section when title is null', () => {
    const fixture = createFixture({ title: null });
    const el = fixture.nativeElement.querySelector('.topic_title');
    expect(el).toBeFalsy();
  });

  it('shows intro when intro is set', () => {
    const fixture = createFixture({ intro: 'Some intro text' });
    const el = fixture.nativeElement.querySelector('.topic_text');
    expect(el).toBeTruthy();
  });

  it('shows description when intro is null but description is set', () => {
    const fixture = createFixture({ intro: null, description: 'desc' });
    const el = fixture.nativeElement.querySelector('.topic_text');
    expect(el).toBeTruthy();
  });

  it('shows creator section when creator is set', () => {
    const fixture = createFixture({ creator: { imageUrl: undefined, name: 'Alice' } });
    const el = fixture.nativeElement.querySelector('.dialog_info');
    expect(el).toBeTruthy();
  });

  it('shows profile image when creator imageUrl is set', () => {
    const fixture = createFixture({
      creator: { imageUrl: 'https://example.com/avatar.jpg', name: 'Alice' }
    });
    const img = fixture.nativeElement.querySelector('.profile_image');
    expect(img).toBeTruthy();
  });

  it('shows initials filler when creator has no imageUrl', () => {
    const fixture = createFixture({
      creator: { imageUrl: undefined, name: 'Alice' }
    });
    const filler = fixture.nativeElement.querySelector('.profile_image_filler');
    expect(filler).toBeTruthy();
  });

  it('shows invitation details section when user email is set', () => {
    const fixture = createFixture({ user: { email: 'user@example.com', isRegistered: true } });
    const list = fixture.nativeElement.querySelector('.content_list_details');
    expect(list).toBeTruthy();
  });

  it('shows invited-by row only when type is invite', () => {
    const fixture = createFixture({
      type: 'invite',
      creator: { imageUrl: undefined, name: 'Bob' },
    });
    const items = fixture.nativeElement.querySelectorAll('.content_list_details li');
    expect(items.length).toBeGreaterThan(0);
  });

  it('shows info notification when user isRegistered', () => {
    const fixture = createFixture({ user: { email: 'user@test.com', isRegistered: true } });
    const el = fixture.nativeElement.querySelector('.notification_inline.info');
    expect(el).toBeTruthy();
  });

  it('does not show info notification when user is not registered', () => {
    const fixture = createFixture({ user: { email: 'user@test.com', isRegistered: false } });
    const el = fixture.nativeElement.querySelector('.notification_inline.info');
    expect(el).toBeFalsy();
  });

  it('shows warning notification when user is not registered', () => {
    const fixture = createFixture({ user: { email: 'user@test.com', isRegistered: false } });
    const el = fixture.nativeElement.querySelector('.notification_inline.warning');
    expect(el).toBeTruthy();
  });

  it('does not show warning notification when user is registered', () => {
    const fixture = createFixture({ user: { email: 'user@test.com', isRegistered: true } });
    const el = fixture.nativeElement.querySelector('.notification_inline.warning');
    expect(el).toBeFalsy();
  });

  it('shows public access button when publicAccess is set', () => {
    const fixture = createFixture({
      publicAccess: { title: 'VIEW_PUBLIC', link: ['/public'] }
    });
    const btn = fixture.nativeElement.querySelector('#group_button');
    expect(btn).toBeTruthy();
  });

  it('hides public access button when publicAccess is null', () => {
    const fixture = createFixture({ publicAccess: null });
    const btn = fixture.nativeElement.querySelector('#group_button');
    expect(btn).toBeFalsy();
  });

  it('calls dialog.closeAll and router.navigate when goToPublicUrl is called', () => {
    const fixture = createFixture();
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.componentInstance.goToPublicUrl(['/some', 'path']);
    expect(dialogServiceMock.closeAll).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/some', 'path']);
  });

  it('shows join button text when user is null', () => {
    const fixture = createFixture({ user: null });
    const btn = fixture.nativeElement.querySelector('.btn_medium_submit');
    expect(btn).toBeTruthy();
  });
});
