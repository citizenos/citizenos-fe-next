import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ComponentRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { TopicSettingsPanelComponent } from './topic-settings-panel.component';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Topic } from '../../../core/interfaces/topic';
import { UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

describe('TopicSettingsPanelComponent', () => {
  let component: TopicSettingsPanelComponent;
  let fixture: ComponentFixture<TopicSettingsPanelComponent>;
  let ref: ComponentRef<TopicSettingsPanelComponent>;

  const mockTopic: Topic = {
    id: 'topic-1', title: 'Test Topic', intro: null,
    description: '<html><body></body></html>', status: 'draft',
    visibility: 'private', hashtag: null, join: { token: '', level: '' },
    categories: ['education'], endsAt: null, createdAt: '', updatedAt: '',
    sourcePartnerId: null, sourcePartnerObjectId: null,
    permission: { level: 'admin' }, creator: {}, lastActivity: null,
    country: null, language: null,
    members: { users: { count: 1 }, groups: { count: 0 } },
    voteId: null, discussionId: null, comments: null, padUrl: '',
    imageUrl: null, authors: [],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TopicSettingsPanelComponent,
        TranslateModule.forRoot(),
        HttpClientTestingModule
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(TopicSettingsPanelComponent, {
      set: {
        imports: [TranslateModule, UpperCasePipe, FormsModule],
        schemas: [NO_ERRORS_SCHEMA]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopicSettingsPanelComponent);
    ref = fixture.componentRef;
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.topic.set(mockTopic);
    component.groups.set([]);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should initialize with topic visibility', () => {
    component.topic.set(mockTopic);
    component.groups.set([]);
    fixture.detectChanges();
    expect(component.visibility()).toBe('private');
  });

  it('should initialize with topic categories', () => {
    component.topic.set(mockTopic);
    component.groups.set([]);
    fixture.detectChanges();
    expect(component.categories()).toEqual(['education']);
  });

  it('should emit visibilityChange on setVisibility', () => {
    component.topic.set(mockTopic);
    component.groups.set([]);
    fixture.detectChanges();
    const emitSpy = vi.spyOn(component.visibilityChange, 'emit');
    component.setVisibility('public');
    expect(component.visibility()).toBe('public');
    expect(emitSpy).toHaveBeenCalledWith('public');
  });

  it('should toggle category', () => {
    component.topic.set(mockTopic);
    component.groups.set([]);
    fixture.detectChanges();
    const emitSpy = vi.spyOn(component.categoriesChange, 'emit');
    component.toggleCategory('health');
    expect(component.categories()).toContain('health');
    expect(emitSpy).toHaveBeenCalled();
  });

  it('should remove existing category on toggle', () => {
    component.topic.set(mockTopic);
    component.groups.set([]);
    fixture.detectChanges();
    component.toggleCategory('education');
    expect(component.categories()).not.toContain('education');
  });

  it('should not exceed max categories', () => {
    component.topic.set(mockTopic);
    component.groups.set([]);
    fixture.detectChanges();
    component.categories.set(['a', 'b', 'c']);
    component.toggleCategory('d');
    expect(component.categories().length).toBe(3);
  });

  it('should emit countryChange', () => {
    component.topic.set(mockTopic);
    component.groups.set([]);
    fixture.detectChanges();
    const emitSpy = vi.spyOn(component.countryChange, 'emit');
    component.onCountryChange('Estonia');
    expect(component.country()).toBe('Estonia');
    expect(emitSpy).toHaveBeenCalledWith('Estonia');
  });

  it('should add and remove groups', () => {
    component.topic.set(mockTopic);
    component.groups.set([]);
    fixture.detectChanges();
    const group = { id: 'g1', name: 'Group 1' } as any;
    component.addGroup(group);
    expect(component.addedGroups().length).toBe(1);
    expect(component.isGroupAdded(group)).toBe(true);

    component.removeGroup(component.addedGroups()[0]);
    expect(component.addedGroups().length).toBe(0);
  });
});
