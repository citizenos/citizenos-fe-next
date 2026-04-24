import { TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runInInjectionContext, EnvironmentInjector } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { StepInviteComponent } from './step-invite.component';
import { SearchService } from '../../../../../core/services/search.service';
import { of } from 'rxjs';

const mockSearchService = {
  searchUsers: vi.fn().mockReturnValue(of({ results: { public: { users: { rows: [] } } } })),
};

const baseGroup = {
  name: '',
  visibility: 'private' as const,
  members: { users: [], topics: { rows: [], count: 0 } },
};

describe('StepInviteComponent', () => {
  let injector: EnvironmentInjector;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [{ provide: SearchService, useValue: mockSearchService }],
    });
    injector = TestBed.inject(EnvironmentInjector);
  });

  function makeComp(group = baseGroup): StepInviteComponent {
    const comp = runInInjectionContext(injector, () => new StepInviteComponent());
    Object.defineProperty(comp, 'group', { value: () => group });
    return comp;
  }

  it('should instantiate', () => {
    expect(makeComp()).toBeTruthy();
  });

  it('LEVELS contains read and admin', () => {
    expect(makeComp().LEVELS).toEqual(['read', 'admin']);
  });

  it('addUser adds user with default read level', () => {
    const comp = makeComp();
    comp.addUser({ id: 'u1', name: 'Alice' });
    expect(comp.selectedUsers()[0].level).toBe('read');
  });

  it('addUser skips duplicate', () => {
    const comp = makeComp();
    comp.addUser({ id: 'u1', name: 'Alice' });
    comp.addUser({ id: 'u1', name: 'Alice' });
    expect(comp.selectedUsers().length).toBe(1);
  });

  it('removeUser removes by id', () => {
    const comp = makeComp();
    comp.addUser({ id: 'u1', name: 'Alice' });
    comp.removeUser({ id: 'u1' });
    expect(comp.selectedUsers().length).toBe(0);
  });

  it('updateLevel changes user level', () => {
    const comp = makeComp();
    comp.addUser({ id: 'u1', name: 'Alice' });
    comp.updateLevel({ id: 'u1' }, 'admin');
    expect(comp.selectedUsers()[0].level).toBe('admin');
  });

  it('onSearch calls searchUsers when 2+ chars', () => {
    const comp = makeComp();
    comp.onSearch('al');
    expect(mockSearchService.searchUsers).toHaveBeenCalledWith('al');
  });

  it('onSearch clears results when less than 2 chars', () => {
    const comp = makeComp();
    comp.searchResults.set([{ id: 'u1' }]);
    comp.onSearch('a');
    expect(comp.searchResults().length).toBe(0);
  });
});
