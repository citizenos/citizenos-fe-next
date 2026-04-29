import { vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TopicHeaderComponent } from './topic-header.component';
import { TopicService } from '../../../../../core/services/topic.service';
import { UserStore } from '../../../../../core/state/user.store';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, of } from 'rxjs';
import { ComponentRef } from '@angular/core';
import { provideRouter } from '@angular/router';

describe('TopicHeaderComponent', () => {
  let component: TopicHeaderComponent;
  let fixture: ComponentFixture<TopicHeaderComponent>;
  let componentRef: ComponentRef<TopicHeaderComponent>;
  
  const mockUserStore = {
    isAuthenticated: () => true
  };

  const mockTopicService = {
    STATUSES: { closed: 'closed' },
    VISIBILITY: { public: 'public' },
    canDelete: vi.fn().mockReturnValue(true),
    canEdit: vi.fn().mockReturnValue(true)
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TopicHeaderComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        provideRouter([]),
        { provide: UserStore, useValue: mockUserStore },
        { provide: TopicService, useValue: mockTopicService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TopicHeaderComponent);
    componentRef = fixture.componentRef;
    
    componentRef.setInput('topic', {
      id: '123',
      title: 'Test Topic',
      permission: { level: 'admin' },
      status: 'inProgress',
      visibility: 'public',
      favourite: false,
      creator: { name: 'Test User' }
    });
    
    componentRef.setInput('navigation', {
      title: 'Back',
      link: ['/']
    });
    
    fixture.detectChanges();
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit toggleFavourite when favourite button is clicked', () => {
    vi.spyOn(component.toggleFavourite, 'emit');
    component.onToggleFavourite();
    expect(component.toggleFavourite.emit).toHaveBeenCalledWith(component.topic());
  });

  it('should display permissions label when permission level is set', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const permissionsLabel = compiled.querySelector('.permissions_lable');
    expect(permissionsLabel).toBeTruthy();
  });

  it('should hide join button when user has permissions', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const joinButton = compiled.querySelector('#join_button');
    expect(joinButton).toBeFalsy();
  });

  it('should show join button when user has no permissions', () => {
    componentRef.setInput('topic', {
      id: '123',
      title: 'Test Topic',
      permission: { level: 'none' },
      status: 'inProgress',
      visibility: 'public',
      favourite: false
    });
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    const joinButton = compiled.querySelector('#join_button');
    expect(joinButton).toBeTruthy();
  });
});
