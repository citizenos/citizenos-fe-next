import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from './page-header.component';
import { UserStore } from '../../../state/user.store';

import { User } from '../../../interfaces/user';

describe('PageHeaderComponent', () => {
  let component: PageHeaderComponent;
  let fixture: ComponentFixture<PageHeaderComponent>;
  const mockUserStore = { user: signal<User | null>(null) };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [PageHeaderComponent, TranslateModule.forRoot()],
      providers: [{ provide: UserStore, useValue: mockUserStore }],
    })
      .overrideComponent(PageHeaderComponent, { set: { imports: [TranslateModule], schemas: [NO_ERRORS_SCHEMA] } })
      .compileComponents();

    fixture = TestBed.createComponent(PageHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should expose userStore', () => {
    expect(component.userStore).toBe(mockUserStore);
  });

  it('should show user profile section when user is logged in', () => {
    mockUserStore.user.set({ id: '1', name: 'Alice', email: 'alice@example.com', language: 'en', imageUrl: undefined });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.profile_photo')).toBeTruthy();
  });

  it('should hide user profile section when user is null', () => {
    mockUserStore.user.set(null);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.profile_photo')).toBeNull();
  });

  it('should show user image when imageUrl is set', () => {
    mockUserStore.user.set({ id: '1', name: 'Alice', email: 'alice@example.com', language: 'en', imageUrl: 'https://example.com/photo.jpg' });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('img')).toBeTruthy();
  });
});
