import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DIALOG_DATA, DialogRef } from '../../../../../shared/dialog';
import { TopicIdeationService } from '../../../../../core/services/topic-ideation.service';
import { Idea } from '../../../../../core/interfaces/idea';
import { Observable, take, forkJoin } from 'rxjs';

import { IdeationFolder } from '../../../../../core/interfaces/ideation';

interface IdeationFolderDialogData {
  topicId: string;
  ideationId: string;
  folder: IdeationFolder;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-add-ideas-to-folder',
  standalone: true,
  imports: [
    TranslateModule
  ],
  template: `
    <div class="dialog">
        <div class="dialog_header ideation">
          <div class="header_text">
            <div class="title">{{ 'COMPONENTS.ADD_IDEAS_TO_FOLDER.HEADING' | translate }}</div>
            <div class="dialog_close">
              <button type="button" class="btn_dialog_close icon" (click)="dialogRef.close()" [aria-label]="'BTN_CLOSE' | translate">
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
              <div class="folder_info_wrap">
                <div>{{ 'COMPONENTS.ADD_IDEAS_TO_FOLDER.LBL_FOLDER_INFO' | translate }}</div>
                <div class="folder_wrap">
                  <div class="icon">
                    <svg width="24" height="22" viewBox="0 0 24 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M0 2.80078C0 1.69621 0.895431 0.800781 2 0.800781H9.06325C9.65681 0.800781 10.2197 1.06443 10.5997 1.52041L11.4003 2.48115C11.7803 2.93714 12.3432 3.20078 12.9367 3.20078H22C23.1046 3.20078 24 4.09621 24 5.20078V19.2008C24 20.3054 23.1046 21.2008 22 21.2008H2C0.89543 21.2008 0 20.3054 0 19.2008V2.80078Z"
                        fill="url(#paint0_linear_add_ideas)" />
                      <path
                        d="M0 7C0 5.89543 0.895431 5 2 5H22C23.1046 5 24 5.89543 24 7V19.2C24 20.3046 23.1046 21.2 22 21.2H2C0.89543 21.2 0 20.3046 0 19.2V7Z"
                        fill="url(#paint1_linear_add_ideas)" />
                      <defs>
                        <linearGradient id="paint0_linear_add_ideas" x1="12" y1="3.42578" x2="12" y2="13.501"
                          gradientUnits="userSpaceOnUse">
                          <stop stop-color="#FFEBA2" />
                          <stop offset="0.192708" stop-color="#FFD84F" />
                          <stop offset="0.265625" stop-color="#FFDF6F" />
                        </linearGradient>
                        <linearGradient id="paint1_linear_add_ideas" x1="11" y1="5" x2="11" y2="21.2"
                          gradientUnits="userSpaceOnUse">
                          <stop offset="0.901042" stop-color="#FFEAA1" />
                          <stop offset="1" stop-color="#FFDF6F" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <div class="bold" [innerHTML]="dialogData.folder.name"></div>
                </div>
              </div>

              @if (ideas().length > 0) {
                <div class="bold">{{ 'COMPONENTS.ADD_IDEAS_TO_FOLDER.LBL_IDEAS_SELECTION' | translate }}</div>
                <div class="idea_selection_wrap">
                  <div class="idea_selection_header">
                    <div class="checkbox_wrap" (click)="toggleAllIdeas()" (keydown.enter)="toggleAllIdeas()" role="button" tabindex="0" [attr.aria-label]="'COMPONENTS.ADD_IDEAS_TO_FOLDER.LBL_IDEAS' | translate:{count: ideas().length}">
                      <div class="checkbox" [class.selected]="allChecked()">
                        <span class="checkmark"></span>
                      </div>
                      <div>{{ 'COMPONENTS.ADD_IDEAS_TO_FOLDER.LBL_IDEAS' | translate:{count: ideas().length} }}
                      </div>
                    </div>
                    <div class="likes_wrap">
                      <span>{{ 'COMPONENTS.ADD_IDEAS_TO_FOLDER.LBL_LIKES' | translate }}</span>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 14L10 14L12.5 18L15 14L13 14L13 5L12 5L12 14Z" fill="#4D5C6A" />
                      </svg>
                    </div>
                  </div>
                  <div class="line_separator"></div>
                  <div class="ideas_wrap">
                    @for (idea of ideas(); track idea.id) {
                      <div class="idea_row">
                        <div class="checkbox_wrap" (click)="toggleIdea(idea)" (keydown.enter)="toggleIdea(idea)" role="button" tabindex="0" [attr.aria-label]="idea.statement">
                          <div class="checkbox" [class.selected]="isIdeaSelected(idea)">
                            <span class="checkmark"></span>
                          </div>
                          <div class="statement" [innerHTML]="idea.statement"></div>
                        </div>
                        <div class="votes">{{ idea.votes.up.count || 0 }}</div>
                      </div>
                    }
                  </div>
                </div>
              } @else if (!loadingData()) {
                <p>{{ 'COMPONENTS.ADD_IDEAS_TO_FOLDER.EMPTY_IDEAS' | translate }}</p>
              }
            </div>
          </div>
        </div>

        <div class="dialog_footer with_buttons">
          <button type="button" class="btn_link" (click)="dialogRef.close()">{{ 'COMPONENTS.ADD_IDEAS_TO_FOLDER.LNK_CANCEL' | translate }}</button>
          <button type="button" class="btn_big_submit" (click)="addIdeas()" [disabled]="loading() || loadingData()">
            {{ 'COMPONENTS.ADD_IDEAS_TO_FOLDER.BTN_CREATE' | translate }}</button>
        </div>
      </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      max-width: 600px;
      @media (max-width: 560px) {
        width: 100%;
        max-width: calc(100vw - 32px);
        margin: 0 auto;
      }
    }
    .dialog {
      background: white;
      border-radius: 8px;
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0px 20px 40px rgba(0, 0, 0, 0.15);
      position: relative;
      z-index: 1;
      @media (max-width: 560px) {
        width: 100%;
        max-width: calc(100vw - 32px);
      }
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
    .folder_info_wrap {
      margin-bottom: 24px;
      .folder_wrap {
        display: flex;
        align-items: center;
        background: #F4F6F8;
        padding: 16px;
        border-radius: 4px;
        gap: 16px;
        margin-top: 8px;
        .icon { flex-shrink: 0; display: flex; align-items: center; }
        .bold { margin-bottom: 0; }
      }
    }
    .idea_selection_wrap {
      display: flex;
      flex-direction: column;
      border: 1px solid var(--color-border);
      border-radius: 4px;
      margin-top: 16px;
      padding: 16px;
      max-height: 240px;
      overflow: auto;
      gap: 16px;
    }
    .line_separator {
      background: var(--color-border);
      height: 1px;
      width: 100%;
    }
    .idea_selection_header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      .checkbox_wrap {
        display: flex;
        gap: 16px;
        align-items: center;
        cursor: pointer;
      }
      .likes_wrap {
        display: flex;
        gap: 0;
        align-items: center;
      }
    }
    .ideas_wrap {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .idea_row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      .checkbox_wrap {
        display: flex;
        gap: 16px;
        align-items: center;
        cursor: pointer;
        flex: 1;
      }
      .statement { flex: 1; margin-right: 16px; font-size: 14px; }
      .votes { width: 40px; color: #727C84; font-size: 14px; text-align: right; }
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
    .dialog_footer {
      padding: 24px;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 24px;
      border-top: 1px solid var(--color-border);
      a, .btn_link {
        cursor: pointer;
        color: var(--color-ideation);
        background: transparent;
        border: none;
        font-weight: bold;
        font-size: 16px;
      }
    }
    .btn_big_submit {
      background: var(--color-ideation);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 4px;
      font-weight: bold;
      font-size: 16px;
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

  ideasSelected = computed(() => {
    return Array.from(this.selectedIdeaIds()).filter(id => !this.initialIdeaIds.has(id));
  });

  get ideasToRemove(): string[] {
    return Array.from(this.initialIdeaIds).filter(id => !this.selectedIdeaIds().has(id));
  }

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
    const ideasToAdd = this.ideasSelected();
    const ideasToRemove = this.ideasToRemove;

    if (!ideasToAdd.length && !ideasToRemove.length) {
      this.dialogRef.close(false);
      return;
    }

    this.loading.set(true);
    const topicId = this.dialogData.topicId;
    const ideationId = this.dialogData.ideationId;
    const folderId = this.dialogData.folder.id;

    const actions: Observable<unknown>[] = [];
    if (ideasToAdd.length > 0) {
      actions.push(this.ideationService.addIdeaToFolder({ topicId, ideationId, folderId }, ideasToAdd));
    }
    ideasToRemove.forEach(ideaId => {
      actions.push(this.ideationService.removeIdeaFromFolder({ topicId, ideationId, folderId, ideaId }));
    });

    forkJoin(actions).pipe(take(1)).subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => {
        console.error('Error syncing folder ideas', err);
        this.loading.set(false);
        this.dialogRef.close(true);
      }
    });
  }

  createFolder() {
    this.addIdeas();
  }
}
