import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditIdeaFolderComponent } from './edit-idea-folder.component';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TopicIdeationService } from '../../../../../core/services/topic-ideation.service';
import { DIALOG_DATA, DialogRef } from '../../../../../shared/dialog';
import { of, throwError } from 'rxjs';
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

describe('EditIdeaFolderComponent', () => {
  let component: EditIdeaFolderComponent;
  let fixture: ComponentFixture<EditIdeaFolderComponent>;
  let mockIdeationService: any;
  let mockDialogRef: any;
  let mockDialogData: any;

  beforeEach(async () => {
    mockIdeationService = {
      getIdeas: vi.fn(),
      updateFolder: vi.fn().mockReturnValue(of({ id: 'folder1', name: 'Updated Folder' })),
      addIdeaToFolder: vi.fn().mockReturnValue(of({})),
      removeIdeaFromFolder: vi.fn().mockReturnValue(of({}))
    };
    mockDialogRef = { close: vi.fn() };
    mockDialogData = {
      topicId: 'topic1',
      ideationId: 'ideation1',
      folder: { id: 'folder1', name: 'Initial Folder' }
    };

    // First call returns all ideas, second call returns ideas in folder
    mockIdeationService.getIdeas.mockReturnValueOnce(of({
      rows: [
        { id: 'idea1', statement: 'Idea 1', votes: { up: { count: 5 } } },
        { id: 'idea2', statement: 'Idea 2', votes: { up: { count: 3 } } }
      ],
      count: 2
    })).mockReturnValueOnce(of({
      rows: [{ id: 'idea1', statement: 'Idea 1', votes: { up: { count: 5 } } }],
      count: 1
    }));

    await TestBed.configureTestingModule({
      imports: [
        EditIdeaFolderComponent,
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
    .overrideComponent(EditIdeaFolderComponent, {
        remove: { imports: [IconComponent] },
        add: { imports: [MockIconComponent] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditIdeaFolderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should patch form with initial data', () => {
    expect(component.form.get('name')?.value).toBe('Initial Folder');
  });

  it('should load initial data and selections', () => {
    expect(component.ideas().length).toBe(2);
    expect(component.selectedIdeaIds().has('idea1')).toBe(true);
    expect(component.selectedIdeaIds().has('idea2')).toBe(false);
  });

  it('should handle idea diff on save (add new idea)', () => {
    component.form.get('name')?.setValue('Renamed Folder');
    component.toggleIdea({ id: 'idea2' } as any); // Add idea2
    component.editFolder();

    expect(mockIdeationService.updateFolder).toHaveBeenCalled();
    expect(mockIdeationService.addIdeaToFolder).toHaveBeenCalledWith({
      topicId: 'topic1',
      ideationId: 'ideation1',
      folderId: 'folder1'
    }, ['idea2']);
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should handle idea diff on save (remove existing idea)', () => {
    component.toggleIdea({ id: 'idea1' } as any); // Remove idea1
    component.editFolder();

    expect(mockIdeationService.updateFolder).toHaveBeenCalled();
    expect(mockIdeationService.removeIdeaFromFolder).toHaveBeenCalledWith({
      topicId: 'topic1',
      ideationId: 'ideation1',
      folderId: 'folder1',
      ideaId: 'idea1'
    });
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should handle complex diff (add and remove)', () => {
    component.toggleIdea({ id: 'idea1' } as any); // Remove idea1
    component.toggleIdea({ id: 'idea2' } as any); // Add idea2
    component.editFolder();

    expect(mockIdeationService.addIdeaToFolder).toHaveBeenCalled();
    expect(mockIdeationService.removeIdeaFromFolder).toHaveBeenCalled();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should handle update error', () => {
    mockIdeationService.updateFolder.mockReturnValue(throwError(() => new Error('Error')));
    component.editFolder();

    expect(component.loading()).toBe(false);
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });
});
