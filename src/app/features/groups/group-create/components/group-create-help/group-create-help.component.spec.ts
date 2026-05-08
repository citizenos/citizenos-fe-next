import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GroupCreateHelpComponent } from './group-create-help.component';
import { TranslateModule } from '@ngx-translate/core';
import { signal } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';

describe('GroupCreateHelpComponent', () => {
  let component: GroupCreateHelpComponent;
  let fixture: ComponentFixture<GroupCreateHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupCreateHelpComponent, TranslateModule.forRoot()]
    }).compileComponents();
  });

  const setup = (stepValue: string) => {
    fixture = TestBed.createComponent(GroupCreateHelpComponent);
    component = fixture.componentInstance;
    // @ts-expect-error - Manual signal override to bypass input setting issues in tests
    component.step = signal(stepValue);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  };

  it('should create', () => {
    setup('info');
    expect(component).toBeTruthy();
  });

  it('should display info help when step is info', () => {
    const compiled = setup('info');
    expect(compiled.querySelector('.small_heading')?.getAttribute('translate')).toBe('VIEWS.GROUP_CREATE.HELP_INFO_HEADING');
  });

  it('should display settings help when step is settings', () => {
    const compiled = setup('settings');
    expect(compiled.querySelector('.small_heading')?.getAttribute('translate')).toBe('VIEWS.GROUP_CREATE.HELP_SETTINGS_HEADING');
  });

  it('should display add_topics help when step is add_topics', () => {
    const compiled = setup('add_topics');
    expect(compiled.querySelector('.small_heading')?.getAttribute('translate')).toBe('VIEWS.GROUP_CREATE.HELP_ADD_TOPICS_HEADING');
  });

  it('should display invite help when step is invite', () => {
    const compiled = setup('invite');
    expect(compiled.querySelector('.small_heading')?.getAttribute('translate')).toBe('VIEWS.GROUP_CREATE.HELP_INVITE_HEADING');
  });
});
