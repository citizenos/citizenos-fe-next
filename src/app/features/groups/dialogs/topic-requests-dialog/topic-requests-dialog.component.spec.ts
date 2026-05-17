import { TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runInInjectionContext, EnvironmentInjector } from '@angular/core';
import { TopicRequestsDialogComponent } from './topic-requests-dialog.component';
import { DIALOG_DATA } from '../../../../shared/dialog/dialog-tokens';
import { DialogRef } from '../../../../shared/dialog/dialog-ref';
import { GroupRequestTopicService } from '../../../../core/services/group-request-topic.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

const mockGroup = { id: 'g1', name: 'Test Group' };
const mockDialogRef = { close: vi.fn() };
import { TopicRequest } from '../../../../core/services/group-request-topic.service';

const mockRequest1 = { id: 'r1', topicId: 't1', groupId: 'g1', level: 'read', topic: { title: 'Topic A' } } as unknown as TopicRequest;
const mockRequest2 = { id: 'r2', topicId: 't2', groupId: 'g1', level: 'read', topic: { title: 'Topic B' } } as unknown as TopicRequest;
const mockRequestService = {
  getRequests: vi.fn().mockReturnValue(of({ rows: [mockRequest1, mockRequest2] })),
  accept: vi.fn().mockReturnValue(of({})),
  reject: vi.fn().mockReturnValue(of({})),
};
const mockNotification = { success: vi.fn() };

describe('TopicRequestsDialogComponent', () => {
  let injector: EnvironmentInjector;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: DIALOG_DATA, useValue: { group: mockGroup } },
        { provide: DialogRef, useValue: mockDialogRef },
        { provide: GroupRequestTopicService, useValue: mockRequestService },
        { provide: NotificationService, useValue: mockNotification },
      ],
    });
    injector = TestBed.inject(EnvironmentInjector);
  });

  function makeComp() {
    return runInInjectionContext(injector, () => new TopicRequestsDialogComponent());
  }

  it('should instantiate and load requests', () => {
    const comp = makeComp();
    expect(comp).toBeTruthy();
    expect(mockRequestService.getRequests).toHaveBeenCalledWith('g1');
    expect(comp.requests().length).toBe(2);
  });

  it('accept removes request from list and shows success', () => {
    const comp = makeComp();
    comp.accept(mockRequest1);
    expect(mockRequestService.accept).toHaveBeenCalledWith('g1', 'r1');
    expect(comp.requests().find(r => r.id === 'r1')).toBeUndefined();
    expect(mockNotification.success).toHaveBeenCalled();
  });

  it('reject removes request from list and shows success', () => {
    const comp = makeComp();
    comp.reject(mockRequest2);
    expect(mockRequestService.reject).toHaveBeenCalledWith('g1', 'r2');
    expect(comp.requests().find(r => r.id === 'r2')).toBeUndefined();
    expect(mockNotification.success).toHaveBeenCalled();
  });
});
