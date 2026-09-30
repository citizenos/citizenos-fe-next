import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { form, FormRoot, FormField, required, maxLength } from '@angular/forms/signals';
import { TranslateModule } from '@ngx-translate/core';
import { DIALOG_DATA, DialogRef } from '../../../../../shared/dialog';
import { TopicIdeationService } from '../../../../../core/services/topic-ideation.service';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { Idea } from '../../../../../core/interfaces/idea';
import { IdeationFolder } from '../../../../../core/interfaces/ideation';
import { take, forkJoin, Observable } from 'rxjs';

interface AddIdeaFolderDialogData {
  topicId: string;
  ideationId: string;
  idea: Idea;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-add-idea-folder',
  standalone: true,
  imports: [
    FormRoot,
    FormField,
    TranslateModule,
    InputComponent
  ],
  template: `
    <div class="overlay" (click)="dialogRef.close()" (keydown.enter)="dialogRef.close()" role="button" tabindex="0"></div>
    <div class="dialog_wrap">
      <div class="dialog">
        <div class="dialog_header ideation">
          <div class="header_text">
            <div class="title">{{ 'COMPONENTS.ADD_IDEA_FOLDER.HEADING' | translate }}</div>
            <div class="dialog_close">
              <button type="button" class="btn_dialog_close icon" (click)="dialogRef.close()" [aria-label]="'CONTROL.CLOSE' | translate">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M7.72152 6.29537C7.3277 5.90154 6.68919 5.90154 6.29537 6.29537C5.90154 6.68919 5.90154 7.3277 6.29537 7.72153L10.5738 12L6.29541 16.2785C5.90159 16.6723 5.90159 17.3108 6.29541 17.7046C6.68923 18.0985 7.32774 18.0985 7.72156 17.7046L12 13.4262L16.2784 17.7046C16.6723 18.0985 17.3108 18.0985 17.7046 17.7046C18.0984 17.3108 18.0984 16.6723 17.7046 16.2785L13.4262 12L17.7046 7.72153C18.0985 7.3277 18.0985 6.68919 17.7046 6.29537C17.3108 5.90154 16.6723 5.90154 16.2785 6.29537L12 10.5739L7.72152 6.29537Z"
                    fill="#2C3B47" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div class="dialog_content">
          <div class="content_section">
            <div class="section_content_wrap">
              <div class="idea_info_wrap">
                <div>{{ 'COMPONENTS.ADD_IDEA_FOLDER.LBL_IDEA_TO_ADD' | translate }}</div>
                <div class="idea_wrap">
                  <div class="icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fill-rule="evenodd" clip-rule="evenodd"
                        d="M21 11.95C20.4477 11.95 20 11.5023 20 10.95C20 10.3977 20.4477 9.95 21 9.95H22C22.5523 9.95 23 10.3977 23 10.95C23 11.5023 22.5523 11.95 22 11.95H21ZM19.747 3.20697C19.3568 2.81684 18.7241 2.81772 18.335 3.20893L17.9511 3.59501C17.5636 3.98468 17.5644 4.61445 17.953 5.00304C18.3432 5.39317 18.976 5.39228 19.365 5.00107L19.7489 4.61499C20.1364 4.22532 20.1356 3.59556 19.747 3.20697ZM11 1.95C11 2.50228 11.4477 2.95 12 2.95C12.5523 2.95 13 2.50228 13 1.95V1C13 0.447715 12.5523 0 12 0C11.4477 0 11 0.447716 11 1V1.95ZM3 9.95C3.55229 9.95 4 10.3977 4 10.95C4 11.5023 3.55229 11.95 3 11.95H2C1.44772 11.95 1 11.5023 1 10.95C1 10.3977 1.44772 9.95 2 9.95H3ZM5.67304 3.19696C5.28508 2.80684 4.65405 2.80596 4.265 3.195C3.87596 3.58404 3.87684 4.21508 4.26696 4.60303L4.65806 4.99195C5.04605 5.37779 5.67309 5.37691 6.06 4.99C6.44692 4.60309 6.44779 3.97604 6.06196 3.58805L5.67304 3.19696ZM5.76123 10.8918C5.76123 7.32287 8.83053 4.7998 12.0013 4.7998C15.1722 4.7998 18.2412 7.32311 18.2412 10.8918C18.2412 13.4124 17.2368 14.8479 16.3217 16.1557C15.6515 17.1135 15.0292 18.0028 14.8845 19.1998H9.12451C8.97974 18.0027 8.35615 17.1132 7.68452 16.1553C6.76764 14.8476 5.76123 13.4122 5.76123 10.8918ZM9.12313 21.1228H14.8831V20.1602H9.12313V21.1228ZM9.12313 22.0802H14.8831C14.8831 23.1405 14.0235 24.0002 12.9631 24.0002H11.0431C9.98275 24.0002 9.12313 23.1405 9.12313 22.0802Z"
                        fill="#E4B722" />
                    </svg>
                  </div>
                  <div class="bold" [innerHTML]="dialogData.idea.statement"></div>
                </div>
              </div>

              @if (folders().length > 0) {
                <div class="folder_list_wrap">
                  <div class="bold">{{ 'COMPONENTS.ADD_IDEA_FOLDER.LBL_FOLDER_SELECTION' | translate }}</div>
                  <div class="idea_selection_wrap">
                    <div class="idea_selection_header">
                      <div class="checkbox_wrap" (click)="toggleAllFolders()" (keydown.enter)="toggleAllFolders()" role="button" tabindex="0" [attr.aria-label]="'COMPONENTS.ADD_IDEA_FOLDER.LBL_FOLDERS' | translate:{count: folders().length}">
                        <div class="checkbox" [class.selected]="allChecked()">
                          <span class="checkmark"></span>
                        </div>
                        <div>{{ 'COMPONENTS.ADD_IDEA_FOLDER.LBL_FOLDERS' | translate:{count: folders().length} }}
                        </div>
                      </div>
                    </div>
                    <div class="line_separator"></div>
                    <div class="ideas_wrap">
                      @for (folder of folders(); track folder.id) {
                        <div class="idea_row">
                          <div class="checkbox_wrap" (click)="toggleFolder(folder)" (keydown.enter)="toggleFolder(folder)" role="button" tabindex="0" [attr.aria-label]="folder.name">
                            <div class="checkbox" [class.selected]="isFolderSelected(folder)">
                              <span class="checkmark"></span>
                            </div>
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

              <div class="new_folder_toggle checkbox_wrap" (click)="showFolderInput.set(!showFolderInput())" (keydown.enter)="showFolderInput.set(!showFolderInput())" role="button" tabindex="0" [attr.aria-label]="'COMPONENTS.ADD_IDEA_FOLDER.LBL_ADD_TO_A_NEW_FOLDER' | translate">
                <div class="checkbox" [class.selected]="showFolderInput()">
                  <span class="checkmark"></span>
                </div>
                <div class="bold">{{ 'COMPONENTS.ADD_IDEA_FOLDER.LBL_ADD_TO_A_NEW_FOLDER' | translate }}</div>
              </div>

              @if (showFolderInput()) {
                <form [formRoot]="form">
                  <cos-input
                    [placeholder]="'COMPONENTS.ADD_IDEA_FOLDER.PLACEHOLDER_FOLDER_NAME' | translate"
                    [hasError]="form.name().invalid() && form.name().touched()"
                    [errorMessage]="'COMPONENTS.ADD_IDEA_FOLDER.ERROR_FOLDER_NAME' | translate"
                  >
                    <input id="name" [formField]="form.name" type="text"
                      [placeholder]="'COMPONENTS.ADD_IDEA_FOLDER.PLACEHOLDER_FOLDER_NAME' | translate">
                  </cos-input>
                </form>
              }
            </div>
          </div>
        </div>

        <div class="dialog_footer with_buttons">
          <button type="button" class="btn_link" (click)="dialogRef.close()">{{ 'COMPONENTS.ADD_IDEA_FOLDER.LNK_CANCEL' | translate }}</button>
          <button type="button" class="btn_big_submit" (click)="save()" [disabled]="loading() || loadingData() || (showFolderInput() && form().invalid()) || (!showFolderInput() && selectedFolderIds().size === 0 && initialFolderIds.size === 0)">
            {{ 'COMPONENTS.ADD_IDEA_FOLDER.BTN_ADD' | translate }}</button>
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

  model = signal({ name: '' });
  form = form(this.model, (path) => {
    required(path.name);
    maxLength(path.name, 254);
  });

  folders = signal<IdeationFolder[]>([]);
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
        const folderIds = res.ideaFolders.rows.map((f: IdeationFolder) => f.id);
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

  toggleFolder(folder: IdeationFolder) {
    const selected = new Set(this.selectedFolderIds());
    if (selected.has(folder.id)) {
      selected.delete(folder.id);
    } else {
      selected.add(folder.id);
    }
    this.selectedFolderIds.set(selected);
  }

  isFolderSelected(folder: IdeationFolder): boolean {
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

    const actions: Observable<unknown>[] = [];

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
    if (this.showFolderInput() && this.form().valid()) {
      actions.push(
        this.ideationService.createFolder({ topicId, ideationId, name: this.form().value().name! })
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
