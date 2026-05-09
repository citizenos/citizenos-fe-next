import { TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runInInjectionContext, EnvironmentInjector } from '@angular/core';
import { GroupRequestTopicsDialogComponent } from './group-request-topics-dialog.component';
import { DIALOG_DATA } from '../../../../shared/dialog/dialog-tokens';
import { DialogRef } from '../../../../shared/dialog/dialog-ref';
import { GroupRequestTopicService } from '../../../../core/services/group-request-topic.service';
import { SearchService } from '../../../../core/services/search.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

const mockGroup = { id: 'g1', name: 'Test Group', visibility: 'public' };
const mockDialogRef = { close: vi.fn() };
const mockRequestService = { request: vi.fn().mockReturnValue(of({})) };
const mockSearchService = { search: vi.fn().mockReturnValue(of({ results: { my: { topics: { rows: [] } } } })) };
const mockNotification = { success: vi.fn() };

describe('GroupRequestTopicsDialogComponent', () => {
  let injector: EnvironmentInjector;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: DIALOG_DATA, useValue: { group: mockGroup } },
        { provide: DialogRef, useValue: mockDialogRef },
        { provide: GroupRequestTopicService, useValue: mockRequestService },
        { provide: SearchService, useValue: mockSearchService },
        { provide: NotificationService, useValue: mockNotification },
      ],
    });
    injector = TestBed.inject(EnvironmentInjector);
  });

  function makeComp() {
    return runInInjectionContext(injector, () => new GroupRequestTopicsDialogComponent());
  }

  it('should instantiate', () => {
    expect(makeComp()).toBeTruthy();
  });

  it('topicsToRequest starts empty', () => {
    expect(makeComp().topicsToRequest()).toEqual([]);
  });

  it('addTopic adds a topic', () => {
    const comp = makeComp();
    comp.addTopic({ id: 't1', title: 'T1' });
    expect(comp.topicsToRequest().length).toBe(1);
  });

  it('addTopic prevents duplicates', () => {
    const comp = makeComp();
    comp.addTopic({ id: 't1', title: 'T1' });
    comp.addTopic({ id: 't1', title: 'T1' });
    expect(comp.topicsToRequest().length).toBe(1);
  });

  it('removeTopic removes the topic', () => {
    const comp = makeComp();
    const topic = { id: 't1', title: 'T1' } as unknown as import('../../../../../core/interfaces/topic').Topic;
    comp.addTopic(topic);
    comp.removeTopic(topic);
    expect(comp.topicsToRequest()).toEqual([]);
  });

  it('send with no topics sets noTopicsSelected', () => {
    const comp = makeComp();
    comp.send();
    expect(comp.noTopicsSelected()).toBe(true);
    expect(mockRequestService.request).not.toHaveBeenCalled();
  });

  it('send with topics calls request service and closes dialog', () => {
    const comp = makeComp();
    comp.addTopic({ id: 't1', title: 'T1' });
    comp.send();
    expect(mockRequestService.request).toHaveBeenCalledWith('g1', 't1', 'read', undefined);
    expect(mockDialogRef.close).toHaveBeenCalledWith(true);
  });
});
