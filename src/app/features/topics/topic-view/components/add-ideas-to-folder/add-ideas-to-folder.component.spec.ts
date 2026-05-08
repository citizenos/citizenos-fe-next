import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddIdeasToFolderComponent } from './add-ideas-to-folder.component';
import { TranslateModule } from '@ngx-translate/core';
import { TopicIdeationService } from '../../../../../core/services/topic-ideation.service';
import { DIALOG_DATA, DialogRef } from '../../../../../shared/dialog';
import { of } from 'rxjs';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Component, Input } from '@angular/core';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

@Component({
  selector: 'cos-icon',
  standalone: true,
  template: ''
})
class MockIconComponent {
  @Input() name = '';
  @Input() size: number | string = 24;
}

describe('AddIdeasToFolderComponent', () => {
  let component: AddIdeasToFolderComponent;
  let fixture: ComponentFixture<AddIdeasToFolderComponent>;
  let mockIdeationService: any;
  let mockDialogRef: any;
  let mockDialogData: any;

  beforeEach(async () => {
    mockIdeationService = {
      getIdeas: vi.fn(),
      addIdeaToFolder: vi.fn().mockReturnValue(of({})),
      removeIdeaFromFolder: vi.fn().mockReturnValue(of({}))
    };
    mockDialogRef = { close: vi.fn() };
    mockDialogData = {
      topicId: 'topic1',
      ideationId: 'ideation1',
      folder: { id: 'folder1', name: 'Test Folder' }
    };

    // First call: all ideas. Second call: folder ideas.
    mockIdeationService.getIdeas.mockReturnValueOnce(of({
      rows: [
        { id: 'idea1', statement: 'Idea 1', votes: { up: { count: 1 } } },
        { id: 'idea2', statement: 'Idea 2', votes: { up: { count: 2 } } }
      ],
      count: 2
    })).mockReturnValueOnce(of({
      rows: [{ id: 'idea1', statement: 'Idea 1', votes: { up: { count: 1 } } }],
      count: 1
    }));

    await TestBed.configureTestingModule({
      imports: [
        AddIdeasToFolderComponent,
        TranslateModule.forRoot(),
        NoopAnimationsModule
      ],
      providers: [
        { provide: TopicIdeationService, useValue: mockIdeationService },
        { provide: DialogRef, useValue: mockDialogRef },
        { provide: DIALOG_DATA, useValue: mockDialogData }
      ]
    })
    .overrideComponent(AddIdeasToFolderComponent, {
        remove: { imports: [IconComponent] },
        add: { imports: [MockIconComponent] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddIdeasToFolderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load ideas and current folder assignments', () => {
    expect(component.ideas().length).toBe(2);
    expect(component.selectedIdeaIds().has('idea1')).toBe(true);
    expect(component.selectedIdeaIds().has('idea2')).toBe(false);
  });

  it('should add new ideas to folder', () => {
    component.toggleIdea({ id: 'idea2' } as any);
    component.addIdeas();
    expect(mockIdeationService.addIdeaToFolder).toHaveBeenCalledWith(
      expect.anything(),
      ['idea2']
    );
    expect(mockDialogRef.close).toHaveBeenCalledWith(true);
  });

  it('should remove ideas from folder', () => {
    component.toggleIdea({ id: 'idea1' } as any);
    component.addIdeas();
    expect(mockIdeationService.removeIdeaFromFolder).toHaveBeenCalled();
    expect(mockDialogRef.close).toHaveBeenCalledWith(true);
  });

  it('should close with false if no changes made', () => {
    component.addIdeas();
    expect(mockDialogRef.close).toHaveBeenCalledWith(false);
  });
});
