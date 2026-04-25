import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DIALOG_DATA, DialogRef } from '../../../../../shared/dialog';
import { TopicIdeationService } from '../../../../../core/services/topic-ideation.service';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { Idea } from '../../../../../core/interfaces/idea';
import { take, forkJoin } from 'rxjs';

interface IdeationFolderDialogData {
  topicId: string;
  ideationId: string;
  folder: any;
}

@Component({
  selector: 'app-add-ideas-to-folder',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    IconComponent
  ],
  template: `
    <div class="overlay" (click)="dialogRef.close()"></div>
    <div class="dialog_wrap">
      <div class="dialog">
        <div class="dialog_header ideation">
          <div class="header_text">
            <div class="title" [translate]="'COMPONENTS.ADD_IDEAS_TO_FOLDER.HEADING'"></div>
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
              <div class="bold" [innerHTML]="'COMPONENTS.ADD_IDEAS_TO_FOLDER.LBL_FOLDER_NAME' | translate:{name: dialogData.folder.name}"></div>

              @if (ideas().length > 0) {
                <div class="bold" [translate]="'COMPONENTS.ADD_IDEAS_TO_FOLDER.LBL_IDEAS_SELECTION'"></div>
                <div class="idea_selection_wrap">
                  <div class="idea_selection_header">
                    <div class="checkbox_wrap" (click)="toggleAllIdeas()">
                      <label class="checkbox" [class.selected]="allChecked()">
                        <span class="checkmark"></span>
                      </label>
                      <div [translate]="'COMPONENTS.ADD_IDEAS_TO_FOLDER.LBL_IDEAS'" [translateParams]="{count: ideas().length}">
                      </div>
                    </div>
                    <div class="likes_wrap">
                      <span [translate]="'COMPONENTS.ADD_IDEAS_TO_FOLDER.LBL_LIKES'"></span>
                      <cos-icon name="arrow-down" [size]="20"></cos-icon>
                    </div>
                  </div>
                  <div class="line_separator"></div>
                  <div class="ideas_wrap">
                    @for (idea of ideas(); track idea.id) {
                      <div class="idea_row">
                        <div class="checkbox_wrap" (click)="toggleIdea(idea)">
                          <label class="checkbox" [class.selected]="isIdeaSelected(idea)">
                            <span class="checkmark"></span>
                          </label>
                          <div class="statement" [innerHTML]="idea.statement"></div>
                        </div>
                        <div class="votes">{{ idea.votes?.up?.count || 0 }}</div>
                      </div>
                    }
                  </div>
                </div>
              } @else if (!loadingData()) {
                <p [translate]="'COMPONENTS.ADD_IDEAS_TO_FOLDER.EMPTY_IDEAS'"></p>
              }
            </div>
          </div>
        </div>

        <div class="dialog_footer with_buttons">
          <a (click)="dialogRef.close()" [translate]="'COMPONENTS.ADD_IDEAS_TO_FOLDER.LNK_CANCEL'"></a>
          <button class="btn_big_submit" (click)="addIdeas()" [disabled]="loading() || loadingData()"
            [translate]="'COMPONENTS.ADD_IDEAS_TO_FOLDER.BTN_ADD'"></button>
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
    .idea_selection_wrap {
      border: 1px solid var(--color-border);
      border-radius: 4px;
      margin-top: 16px;
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
      justify-content: space-between;
      padding: 12px;
      border-top: 1px solid var(--color-border);
      align-items: flex-start;
      .statement { flex: 1; margin-right: 16px; font-size: 14px; }
      .votes { color: #727C84; font-size: 14px; }
    }
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
export class AddIdeasToFolderComponent {
  private ideationService = inject(TopicIdeationService);
  public dialogRef = inject(DialogRef<AddIdeasToFolderComponent>);
  public dialogData = inject<IdeationFolderDialogData>(DIALOG_DATA);

  ideas = signal<Idea[]>([]);
  selectedIdeaIds = signal<Set<string>>(new Set());
  initialIdeaIds = new Set<string>();
  loading = signal(false);
  loadingData = signal(true);

  allChecked = computed(() => {
    const currentIdeas = this.ideas();
    return currentIdeas.length > 0 && this.selectedIdeaIds().size === currentIdeas.length;
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
      allIdeas: this.ideationService.getIdeas({ ...params, limit: 100 }),
      folderIdeas: this.ideationService.getIdeas({ ...params, folderId: this.dialogData.folder.id, limit: 100 })
    }).pipe(take(1)).subscribe({
      next: (res) => {
        this.ideas.set(res.allIdeas.rows);
        const folderIdeaIds = res.folderIdeas.rows.map((i: Idea) => i.id);
        this.initialIdeaIds = new Set(folderIdeaIds);
        this.selectedIdeaIds.set(new Set(folderIdeaIds));
        this.loadingData.set(false);
      },
      error: (err) => {
        console.error('Error loading data', err);
        this.loadingData.set(false);
      }
    });
  }

  toggleIdea(idea: Idea) {
    const selected = new Set(this.selectedIdeaIds());
    if (selected.has(idea.id)) {
      selected.delete(idea.id);
    } else {
      selected.add(idea.id);
    }
    this.selectedIdeaIds.set(selected);
  }

  isIdeaSelected(idea: Idea): boolean {
    return this.selectedIdeaIds().has(idea.id);
  }

  toggleAllIdeas() {
    if (this.allChecked()) {
      this.selectedIdeaIds.set(new Set());
    } else {
      const allIds = this.ideas().map(i => i.id);
      this.selectedIdeaIds.set(new Set(allIds));
    }
  }

  addIdeas() {
    this.loading.set(true);
    const topicId = this.dialogData.topicId;
    const ideationId = this.dialogData.ideationId;
    const folderId = this.dialogData.folder.id;

    const currentSelected = this.selectedIdeaIds();
    const ideasToAdd = Array.from(currentSelected).filter(id => !this.initialIdeaIds.has(id));
    const ideasToRemove = Array.from(this.initialIdeaIds).filter(id => !currentSelected.has(id));

    const actions: any[] = [];
    if (ideasToAdd.length > 0) {
      actions.push(this.ideationService.addIdeaToFolder({ topicId, ideationId, folderId }, ideasToAdd));
    }
    ideasToRemove.forEach(ideaId => {
      actions.push(this.ideationService.removeIdeaFromFolder({ topicId, ideationId, folderId, ideaId }));
    });

    if (actions.length > 0) {
      forkJoin(actions).pipe(take(1)).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => {
          console.error('Error syncing folder ideas', err);
          this.loading.set(false);
        }
      });
    } else {
      this.dialogRef.close(false);
    }
  }
}
