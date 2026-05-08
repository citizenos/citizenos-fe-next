import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateIdeaFolderComponent } from './create-idea-folder.component';
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

describe('CreateIdeaFolderComponent', () => {
  let component: CreateIdeaFolderComponent;
  let fixture: ComponentFixture<CreateIdeaFolderComponent>;
  let mockIdeationService: any;
  let mockDialogRef: any;
  let mockDialogData: any;

  beforeEach(async () => {
    mockIdeationService = {
      getIdeas: vi.fn().mockReturnValue(of({ rows: [{ id: 'idea1', statement: 'Idea 1', votes: { up: { count: 5 } } }], count: 1 })),
      createFolder: vi.fn().mockReturnValue(of({ id: 'folder1', name: 'Test Folder' })),
      addIdeaToFolder: vi.fn().mockReturnValue(of({}))
    };
    mockDialogRef = { close: vi.fn() };
    mockDialogData = { topicId: 'topic1', ideationId: 'ideation1' };

    await TestBed.configureTestingModule({
      imports: [
        CreateIdeaFolderComponent,
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
    .overrideComponent(CreateIdeaFolderComponent, {
        remove: { imports: [IconComponent] },
        add: { imports: [MockIconComponent] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateIdeaFolderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load ideas on init', () => {
    expect(mockIdeationService.getIdeas).toHaveBeenCalledWith({
      topicId: 'topic1',
      ideationId: 'ideation1',
      limit: 100
    });
    expect(component.ideas().length).toBe(1);
  });

  it('should validate form', () => {
    const nameControl = component.form.get('name');
    nameControl?.setValue('');
    expect(component.form.valid).toBe(false);

    nameControl?.setValue('My Folder');
    expect(component.form.valid).toBe(true);
  });

  it('should toggle idea selection', () => {
    const idea = { id: 'idea1' } as any;
    component.toggleIdea(idea);
    expect(component.isIdeaSelected(idea)).toBe(true);
    expect(component.selectedIdeaIds().size).toBe(1);

    component.toggleIdea(idea);
    expect(component.isIdeaSelected(idea)).toBe(false);
    expect(component.selectedIdeaIds().size).toBe(0);
  });

  it('should toggle all ideas', () => {
    component.toggleAllIdeas();
    expect(component.allChecked()).toBe(true);
    expect(component.selectedIdeaIds().size).toBe(1);

    component.toggleAllIdeas();
    expect(component.allChecked()).toBe(false);
    expect(component.selectedIdeaIds().size).toBe(0);
  });

  it('should create folder and close dialog', () => {
    component.form.get('name')?.setValue('New Folder');
    component.createFolder();

    expect(mockIdeationService.createFolder).toHaveBeenCalledWith({
      topicId: 'topic1',
      ideationId: 'ideation1',
      name: 'New Folder'
    });
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should create folder and add selected ideas', () => {
    component.form.get('name')?.setValue('New Folder');
    component.toggleAllIdeas();
    component.createFolder();

    expect(mockIdeationService.createFolder).toHaveBeenCalled();
    expect(mockIdeationService.addIdeaToFolder).toHaveBeenCalledWith({
      topicId: 'topic1',
      ideationId: 'ideation1',
      folderId: 'folder1'
    }, ['idea1']);
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should handle creation error', () => {
    mockIdeationService.createFolder.mockReturnValue(throwError(() => new Error('Error')));
    component.form.get('name')?.setValue('New Folder');
    component.createFolder();

    expect(component.loading()).toBe(false);
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });
});
