import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { StepTopicSettingsComponent } from './step-topic-settings.component';
import { Topic } from '../../../../../core/interfaces/topic';
import { UserGroupService } from '../../../../../core/services/user-group.service';
import { TranslateModule } from '@ngx-translate/core';
import { signal } from '@angular/core';

describe('StepTopicSettingsComponent (business logic)', () => {
  let component: StepTopicSettingsComponent;
  let fixture: ComponentFixture<StepTopicSettingsComponent>;
  let mockUserGroupService: any;

  beforeEach(async () => {
    mockUserGroupService = {
      items: signal([])
    };

    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), StepTopicSettingsComponent],
      providers: [
        { provide: UserGroupService, useValue: mockUserGroupService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StepTopicSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default visibility private', () => {
    expect(component.topic().visibility).toBe('private');
  });

  it('should emit topicUpdate when onUpdate is called with visibility', () => {
    const spy = vi.spyOn(component.topicUpdate, 'emit');
    component.onUpdate({ visibility: 'public' });
    expect(spy).toHaveBeenCalledWith({ visibility: 'public' });
  });

  it('should emit topicUpdate when onUpdate is called with country', () => {
    const spy = vi.spyOn(component.topicUpdate, 'emit');
    component.onUpdate({ country: 'EE' });
    expect(spy).toHaveBeenCalledWith({ country: 'EE' });
  });

  it('should emit topicUpdate when onUpdate is called with categories', () => {
    const spy = vi.spyOn(component.topicUpdate, 'emit');
    component.onUpdate({ categories: ['environment'] });
    expect(spy).toHaveBeenCalledWith({ categories: ['environment'] });
  });
});
