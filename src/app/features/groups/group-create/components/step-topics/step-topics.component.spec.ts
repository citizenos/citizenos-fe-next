import { TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runInInjectionContext, EnvironmentInjector } from '@angular/core';
import { StepTopicsComponent } from './step-topics.component';
import { SearchService } from '../../../../../core/services/search.service';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

const mockSearchService = {
  search: vi.fn(),
};

const mockGroup = {
  name: 'Test Group',
  description: '',
  visibility: 'private' as const,
  members: { users: [], topics: { rows: [], count: 0 } },
};

describe('StepTopicsComponent', () => {
  let injector: EnvironmentInjector;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: SearchService, useValue: mockSearchService },
      ],
    });
    injector = TestBed.inject(EnvironmentInjector);
  });

  function makeComp() {
    const comp = runInInjectionContext(injector, () => new StepTopicsComponent());
    comp['group'] = vi.fn().mockReturnValue(mockGroup) as any;
    return comp;
  }

  it('should instantiate', () => {
    expect(makeComp()).toBeTruthy();
  });

  it('searchString starts empty', () => {
    expect(makeComp().searchString()).toBe('');
  });

  it('searchResults starts empty', () => {
    expect(makeComp().searchResults()).toEqual([]);
  });

  it('onSearch with short string clears results', () => {
    mockSearchService.search.mockReturnValue(of({ results: { my: { topics: { rows: [] } } } }));
    const comp = makeComp();
    comp.onSearch('a');
    expect(comp.searchResults()).toEqual([]);
    expect(mockSearchService.search).not.toHaveBeenCalled();
  });

  it('onSearch with 2+ chars calls search', () => {
    const mockRows = [{ id: 't1', title: 'Topic 1' }];
    mockSearchService.search.mockReturnValue(of({ results: { my: { topics: { rows: mockRows } } } }));
    const comp = makeComp();
    comp.onSearch('te');
    expect(mockSearchService.search).toHaveBeenCalledWith('te', expect.any(Object));
    expect(comp.searchResults()).toEqual(mockRows);
  });

  it('addTopic adds to selectedTopics and clears search', () => {
    const comp = makeComp();
    const topic = { id: 't1', title: 'Topic 1' } as any;
    comp.searchResults.set([topic]);
    const emitSpy = vi.spyOn(comp.groupUpdate, 'emit');
    comp.addTopic(topic);
    expect(comp.selectedTopics()).toContainEqual(topic);
    expect(comp.searchString()).toBe('');
    expect(comp.searchResults()).toEqual([]);
    expect(emitSpy).toHaveBeenCalled();
  });

  it('addTopic does not duplicate', () => {
    const comp = makeComp();
    const topic = { id: 't1', title: 'Topic 1' } as any;
    comp.addTopic(topic);
    comp.addTopic(topic);
    expect(comp.selectedTopics().length).toBe(1);
  });

  it('removeTopic removes from selectedTopics', () => {
    const comp = makeComp();
    const topic = { id: 't1', title: 'Topic 1' } as any;
    comp.addTopic(topic);
    comp.removeTopic(topic);
    expect(comp.selectedTopics()).toEqual([]);
  });
});
