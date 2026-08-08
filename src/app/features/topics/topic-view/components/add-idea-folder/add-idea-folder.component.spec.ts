import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddIdeaFolderComponent } from './add-idea-folder.component';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TopicIdeationService } from '../../../../../core/services/topic-ideation.service';
import { DIALOG_DATA, DialogRef } from '../../../../../shared/dialog';
import { of } from 'rxjs';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Component, Input } from '@angular/core';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IdeationFolder } from '../../../../../core/interfaces/ideation';

@Component({
  selector: 'cos-icon',
  standalone: true,
  template: ''
})
class MockIconComponent {
  @Input() name = '';
  @Input() size: number | string = 24;
  @Input() color = '';
}

describe('AddIdeaFolderComponent', () => {
  let component: AddIdeaFolderComponent;
  let fixture: ComponentFixture<AddIdeaFolderComponent>;
  let mockIdeationService: Partial<TopicIdeationService>;
  let mockDialogRef: Partial<DialogRef<unknown>>;
  let mockDialogData: { topicId: string; ideationId: string; idea: { id: string; statement: string } };

  beforeEach(async () => {
    mockIdeationService = {
      getFolders: vi.fn().mockReturnValue(of({ rows: [{ id: 'folder1', name: 'Folder 1' }, { id: 'folder2', name: 'Folder 2' }], count: 2 })),
      getIdeaFolders: vi.fn().mockReturnValue(of({ rows: [{ id: 'folder1', name: 'Folder 1' }], count: 1 })),
      addFoldersToIdea: vi.fn().mockReturnValue(of({})),
      removeIdeaFromFolder: vi.fn().mockReturnValue(of({})),
      createFolder: vi.fn().mockReturnValue(of({ id: 'new-folder', name: 'New Folder' })),
      addIdeaToFolder: vi.fn().mockReturnValue(of({}))
    };
    mockDialogRef = { close: vi.fn() };
    mockDialogData = {
      topicId: 'topic1',
      ideationId: 'ideation1',
      idea: { id: 'idea1', statement: 'Test Idea' }
    };

    await TestBed.configureTestingModule({
      imports: [
        AddIdeaFolderComponent,
        TranslateModule.forRoot(),
        ReactiveFormsModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: TopicIdeationService, useValue: mockIdeationService },
        { provide: DialogRef, useValue: mockDialogRef },
        { provide: DIALOG_DATA, useValue: mockDialogData }
      ]
    })
    .overrideComponent(AddIdeaFolderComponent, {
        remove: { imports: [IconComponent] },
        add: { imports: [MockIconComponent] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddIdeaFolderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load folders and current idea assignments', () => {
    expect(component.folders().length).toBe(2);
    expect(component.selectedFolderIds().has('folder1')).toBe(true);
    expect(component.selectedFolderIds().has('folder2')).toBe(false);
  });

  it('should add idea to new folder', () => {
    component.showFolderInput.set(true);
    component.model.update(m => ({ ...m, name: 'Wonderful New Folder' }));
    fixture.detectChanges();
    TestBed.flushEffects();
    component.save();

    expect(mockIdeationService.createFolder).toHaveBeenCalledWith({
      topicId: 'topic1',
      ideationId: 'ideation1',
      name: 'Wonderful New Folder'
    });
    expect(mockIdeationService.addIdeaToFolder).toHaveBeenCalled();
    expect(mockDialogRef.close).toHaveBeenCalledWith(true);
  });

  it('should sync changes to existing folder assignments', () => {
    component.toggleFolder({ id: 'folder2' } as IdeationFolder); // Add folder2
    component.toggleFolder({ id: 'folder1' } as IdeationFolder); // Remove folder1
    component.save();

    expect(mockIdeationService.addFoldersToIdea).toHaveBeenCalledWith(
      expect.anything(),
      ['folder2']
    );
    expect(mockIdeationService.removeIdeaFromFolder).toHaveBeenCalledWith({
      topicId: 'topic1',
      ideationId: 'ideation1',
      folderId: 'folder1',
      ideaId: 'idea1'
    });
    expect(mockDialogRef.close).toHaveBeenCalledWith(true);
  });
});
