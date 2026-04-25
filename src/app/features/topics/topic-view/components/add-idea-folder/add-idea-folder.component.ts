import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DIALOG_DATA, DialogRef } from '../../../../../shared/dialog';
import { TopicIdeationService } from '../../../../../core/services/topic-ideation.service';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { Idea } from '../../../../../core/interfaces/idea';
import { take, forkJoin, of } from 'rxjs';

interface AddIdeaFolderDialogData {
  topicId: string;
  ideationId: string;
  idea: Idea;
}

@Component({
  selector: 'app-add-idea-folder',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    InputComponent,
    IconComponent
  ],
  template: `
    <div class="overlay" (click)="dialogRef.close()"></div>
    <div class="dialog_wrap">
      <div class="dialog">
        <div class="dialog_header ideation">
          <div class="header_text">
            <div class="title" [translate]="'COMPONENTS.ADD_IDEA_FOLDER.HEADING'"></div>
            <div class="dialog_close">
              <a class="btn_dialog_close icon" (click)="dialogRef.close()">
                <cos-icon name="close"></cos-icon>
              </a>
            </div>
          </div>
        </div>
        <div class="dialog_content">
          <div class="content_section">
            <div class="section_content_wrap">
              <div class="idea_info_wrap">
                <div [translate]="'COMPONENTS.ADD_IDEA_FOLDER.LBL_IDEA_TO_ADD'"></div>
                <div class="idea_wrap">
                  <div class="icon">
                    <cos-icon name="idea" [size]="24" color="#E4B722"></cos-icon>
                  </div>
                  <div class="bold" [innerHTML]="dialogData.idea.statement"></div>
                </div>
              </div>

              @if (folders().length > 0) {
                <div class="folder_list_wrap">
                  <div class="bold" [translate]="'COMPONENTS.ADD_IDEA_FOLDER.LBL_FOLDER_SELECTION'"></div>
                  <div class="idea_selection_wrap">
                    <div class="idea_selection_header">
                      <div class="checkbox_wrap" (click)="toggleAllFolders()">
                        <label class="checkbox" [class.selected]="allChecked()">
                          <span class="checkmark"></span>
                        </label>
                        <div [translate]="'COMPONENTS.ADD_IDEA_FOLDER.LBL_FOLDERS'" [translateParams]="{count: folders().length}">
                        </div>
                      </div>
                    </div>
                    <div class="line_separator"></div>
                    <div class="ideas_wrap">
                      @for (folder of folders(); track folder.id) {
                        <div class="idea_row">
                          <div class="checkbox_wrap" (click)="toggleFolder(folder)">
                            <label class="checkbox" [class.selected]="isFolderSelected(folder)">
                              <span class="checkmark"></span>
                            </label>
                            <div class="name_wrap">
                              <span class="folder_name" [innerHTML]="folder.name"></span>
                            </div>
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                </div>
              }

              <div class="new_folder_toggle checkbox_wrap" (click)="showFolderInput.set(!showFolderInput())">
                <label class="checkbox" [class.selected]="showFolderInput()">
                  <span class="checkmark"></span>
                </label>
                <div class="bold" [translate]="'COMPONENTS.ADD_IDEA_FOLDER.LBL_ADD_TO_A_NEW_FOLDER'"></div>
              </div>

              @if (showFolderInput()) {
                <form [formGroup]="form">
                  <cos-input
                    [placeholder]="'COMPONENTS.ADD_IDEA_FOLDER.PLACEHOLDER_FOLDER_NAME' | translate"
                    [hasError]="!!(form.get('name')?.touched && form.get('name')?.invalid)"
                    [errorMessage]="'COMPONENTS.ADD_IDEA_FOLDER.ERROR_FOLDER_NAME' | translate"
                  >
                    <input id="name" formControlName="name" type="text"
                      [placeholder]="'COMPONENTS.ADD_IDEA_FOLDER.PLACEHOLDER_FOLDER_NAME' | translate"
                      [maxlength]="254">
                  </cos-input>
                </form>
              }
            </div>
          </div>
        </div>

        <div class="dialog_footer with_buttons">
          <a (click)="dialogRef.close()" [translate]="'COMPONENTS.ADD_IDEA_FOLDER.LNK_CANCEL'"></a>
          <button class="btn_big_submit" (click)="save()" [disabled]="loading() || loadingData() || (showFolderInput() && form.invalid) || (!showFolderInput() && selectedFolderIds().size === 0 && initialFolderIds.size === 0)"
            [translate]="'COMPONENTS.ADD_IDEA_FOLDER.BTN_ADD'"></button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dialog_wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1000;
    }
    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
    }
    .dialog {
      background: white;
      border-radius: 8px;
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      z-index: 1001;
      overflow: hidden;
    }
    .dialog_header {
      padding: 24px;
      background: var(--color-ideation);
      color: white;
      .header_text {
        display: flex;
        justify-content: space-between;
        align-items: center;
        .title { font-size: 24px; font-weight: bold; }
      }
    }
    .dialog_content {
      padding: 24px;
      overflow-y: auto;
      flex: 1;
    }
    .bold { font-weight: bold; margin-bottom: 8px; }
    .idea_info_wrap {
      margin-bottom: 24px;
      .idea_wrap {
        display: flex;
        align-items: center;
        background: #F4F6F8;
        padding: 16px;
        border-radius: 4px;
        gap: 16px;
        .icon { flex-shrink: 0; }
        .bold { margin-bottom: 0; }
      }
    }
    .idea_selection_wrap {
      border: 1px solid var(--color-border);
      border-radius: 4px;
      margin-bottom: 24px;
    }
    .idea_selection_header {
      display: flex;
      justify-content: space-between;
      padding: 12px;
      background: #F4F6F8;
    }
    .checkbox_wrap {
      display: flex;
      align-items: center;
      cursor: pointer;
      gap: 10px;
    }
    .checkbox {
      width: 20px;
      height: 20px;
      border: 1px solid #C8D1D9;
      border-radius: 4px;
      position: relative;
      background: white;
      .checkmark { display: none; position: absolute; left: 6px; top: 2px; width: 6px; height: 10px; border: solid white; border-width: 0 2px 2px 0; transform: rotate(45deg); }
      &.selected {
        background: var(--color-ideation);
        border-color: var(--color-ideation);
        .checkmark { display: block; }
      }
    }
    .idea_row {
      display: flex;
      padding: 12px;
      border-top: 1px solid var(--color-border);
      align-items: center;
    }
    .new_folder_toggle { margin-bottom: 16px; }
    .dialog_footer {
      padding: 24px;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 24px;
      border-top: 1px solid var(--color-border);
      a { cursor: pointer; color: var(--color-ideation); }
    }
    .btn_big_submit {
      background: var(--color-ideation);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 4px;
      font-weight: bold;
      cursor: pointer;
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }
  `]
})
export class AddIdeaFolderComponent {
  private ideationService = inject(TopicIdeationService);
  public dialogRef = inject(DialogRef<AddIdeaFolderComponent>);
  public dialogData = inject<AddIdeaFolderDialogData>(DIALOG_DATA);

  form = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.maxLength(254)]),
  });

  folders = signal<any[]>([]);
  selectedFolderIds = signal<Set<string>>(new Set());
  initialFolderIds = new Set<string>();
  loading = signal(false);
  loadingData = signal(true);
  showFolderInput = signal(false);

  allChecked = computed(() => {
    const currentFolders = this.folders();
    return currentFolders.length > 0 && this.selectedFolderIds().size === currentFolders.length;
  });

  constructor() {
    this.loadData();
  }

  private loadData() {
    this.loadingData.set(true);
    const params = {
      topicId: this.dialogData.topicId,
      ideationId: this.dialogData.ideationId,
    };

    forkJoin({
      allFolders: this.ideationService.getFolders(params),
      ideaFolders: this.ideationService.getIdeaFolders({ ...params, ideaId: this.dialogData.idea.id })
    }).pipe(take(1)).subscribe({
      next: (res) => {
        this.folders.set(res.allFolders.rows);
        const folderIds = res.ideaFolders.rows.map((f: any) => f.id);
        this.initialFolderIds = new Set(folderIds);
        this.selectedFolderIds.set(new Set(folderIds));
        this.loadingData.set(false);
      },
      error: (err) => {
        console.error('Error loading data', err);
        this.loadingData.set(false);
      }
    });
  }

  toggleFolder(folder: any) {
    const selected = new Set(this.selectedFolderIds());
    if (selected.has(folder.id)) {
      selected.delete(folder.id);
    } else {
      selected.add(folder.id);
    }
    this.selectedFolderIds.set(selected);
  }

  isFolderSelected(folder: any): boolean {
    return this.selectedFolderIds().has(folder.id);
  }

  toggleAllFolders() {
    if (this.allChecked()) {
      this.selectedFolderIds.set(new Set());
    } else {
      const allIds = this.folders().map(f => f.id);
      this.selectedFolderIds.set(new Set(allIds));
    }
  }

  save() {
    this.loading.set(true);
    const topicId = this.dialogData.topicId;
    const ideationId = this.dialogData.ideationId;
    const ideaId = this.dialogData.idea.id;

    const currentSelected = this.selectedFolderIds();
    const foldersToAdd = Array.from(currentSelected).filter(id => !this.initialFolderIds.has(id));
    const foldersToRemove = Array.from(this.initialFolderIds).filter(id => !currentSelected.has(id));

    const actions: any[] = [];

    // 1. Handle existing folder changes
    if (foldersToAdd.length > 0) {
      actions.push(this.ideationService.addFoldersToIdea({ topicId, ideationId, ideaId }, foldersToAdd));
    }
    
    // Legacy did one removal at a time, we'll follow that pattern for stability or use the existing service if it supports bulk?
    // Looking at service, removeIdeaFromFolder takes ONE idea and ONE folder.
    foldersToRemove.forEach(folderId => {
      actions.push(this.ideationService.removeIdeaFromFolder({ topicId, ideationId, folderId, ideaId }));
    });

    // 2. Handle new folder creation if requested
    if (this.showFolderInput() && this.form.valid) {
      actions.push(
        this.ideationService.createFolder({ topicId, ideationId, name: this.form.value.name! })
          .pipe(take(1), exhaustMap((folder) => {
            return this.ideationService.addIdeaToFolder({ topicId, ideationId, folderId: folder.id }, ideaId);
          }))
      );
    }

    if (actions.length > 0) {
      forkJoin(actions).pipe(take(1)).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => {
          console.error('Error saving idea folders', err);
          this.loading.set(false);
          // Still close if something succeeded? Legacy closed on error too sometimes.
          this.dialogRef.close(true);
        }
      });
    } else {
      this.dialogRef.close(false);
    }
  }
}

// Helper to use exhaustMap in the forkJoin context if needed, but since it's a pipe on one of the items, it's fine.
import { exhaustMap } from 'rxjs/operators';
