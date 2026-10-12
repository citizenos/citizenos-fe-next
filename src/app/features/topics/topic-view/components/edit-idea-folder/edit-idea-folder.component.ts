import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { form, FormRoot, FormField, required, maxLength } from '@angular/forms/signals';
import { TranslateModule } from '@ngx-translate/core';
import { DIALOG_DATA, DialogRef } from '../../../../../shared/dialog';
import { TopicIdeationService } from '../../../../../core/services/topic-ideation.service';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
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
  selector: 'app-edit-idea-folder',
  standalone: true,
  imports: [
    FormRoot,
    FormField,
    TranslateModule,
    InputComponent,
    ButtonComponent
  ],
  template: `
    <div class="dialog">
      <div class="dialog_header ideation">
        <div class="header_text">
          <h1 class="title">{{ 'COMPONENTS.EDIT_IDEA_FOLDER.HEADING' | translate }}</h1>
          <div class="dialog_close">
            <button type="button" class="btn_dialog_close icon" (click)="dialogRef.close()" [aria-label]="'CONTROL.CLOSE' | translate">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M7.72152 6.29537C7.3277 5.90154 6.68919 5.90154 6.29537 6.29537C5.90154 6.68919 5.90154 7.3277 6.29537 7.72153L10.5738 12L6.29541 16.2785C5.90159 16.6723 5.90159 17.3108 6.29541 17.7046C6.68923 18.0985 7.32774 18.0985 7.72156 17.7046L12 13.4262L16.2784 17.7046C16.6723 18.0985 17.3108 18.0985 17.7046 17.7046C18.0984 17.3108 18.0984 16.6723 17.7046 16.2785L13.4262 12L17.7046 7.72153C18.0985 7.3277 18.0985 6.68919 17.7046 6.29537C17.3108 5.90154 16.6723 5.90154 16.2785 6.29537L12 10.5739L7.72152 6.29537Z"
                  fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div class="dialog_content">
        <div class="content_section">
          <div class="section_content_wrap">
            <label class="bold" for="name">{{ 'COMPONENTS.EDIT_IDEA_FOLDER.LBL_NAME' | translate }}</label>
            <form [formRoot]="form">
              <cos-input
                [placeholder]="'COMPONENTS.EDIT_IDEA_FOLDER.PLACEHOLDER_NAME' | translate"
                [hasError]="form.name().invalid() && form.name().touched()"
                [errorMessage]="'COMPONENTS.EDIT_IDEA_FOLDER.ADD_NAME_ERROR_MSG_INVALID' | translate"
              >
                <input id="name" [formField]="form.name" type="text"
                  [placeholder]="'COMPONENTS.EDIT_IDEA_FOLDER.PLACEHOLDER_NAME' | translate">
              </cos-input>
            </form>

            @if (ideas().length > 0) {
              <h2 class="bold">{{ 'COMPONENTS.EDIT_IDEA_FOLDER.LBL_IDEAS_SELECTION' | translate }}</h2>
              <div class="idea_selection_wrap">
                <div class="idea_selection_header">
                  <div class="checkbox_wrap" (click)="toggleAllIdeas()" (keydown.enter)="toggleAllIdeas()" tabindex="0" role="button" [attr.aria-label]="'COMPONENTS.EDIT_IDEA_FOLDER.LBL_IDEAS' | translate:{count: ideas().length}">
                    <div class="checkbox" [class.selected]="allChecked()">
                      <span class="checkmark"></span>
                    </div>
                    <div>
                      {{ 'COMPONENTS.EDIT_IDEA_FOLDER.LBL_IDEAS' | translate:{count: ideas().length} }}
                    </div>
                  </div>
                  <div class="likes_wrap">
                    <span>{{ 'COMPONENTS.EDIT_IDEA_FOLDER.LBL_LIKES' | translate }}</span>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 14L10 14L12.5 18L15 14L13 14L13 5L12 5L12 14Z" fill="currentColor" />
                    </svg>
                  </div>
                </div>
                <div class="line_separator"></div>
                <div class="ideas_wrap">
                  @for (idea of ideas(); track idea.id) {
                    <div class="idea_row">
                      <div class="checkbox_wrap" (click)="toggleIdea(idea)" (keydown.enter)="toggleIdea(idea)" tabindex="0" role="button" [attr.aria-label]="idea.statement">
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
            }
          </div>
        </div>
      </div>

      <div class="dialog_footer with_buttons">
        <cos-button variant="ghost" (click)="dialogRef.close()">
          {{ 'COMPONENTS.EDIT_IDEA_FOLDER.LNK_CANCEL' | translate }}
        </cos-button>
        <cos-button variant="primary" (click)="editFolder()" [isDisabled]="form().invalid() || loading()">
          {{ 'COMPONENTS.EDIT_IDEA_FOLDER.BTN_CREATE' | translate }}
        </cos-button>
      </div>
    </div>
  `,
  styleUrl: './edit-idea-folder.component.scss'
})
export class EditIdeaFolderComponent {
  private ideationService = inject(TopicIdeationService);
  public dialogRef = inject(DialogRef<EditIdeaFolderComponent>);
  private dialogData = inject<IdeationFolderDialogData>(DIALOG_DATA);

  model = signal({ name: '' });
  form = form(this.model, (path) => {
    required(path.name);
    maxLength(path.name, 254);
  });

  ideas = signal<Idea[]>([]);
  selectedIdeaIds = signal<Set<string>>(new Set());
  initialIdeaIds = new Set<string>();
  loading = signal(false);

  allChecked = computed(() => {
    const currentIdeas = this.ideas();
    return currentIdeas.length > 0 && this.selectedIdeaIds().size === currentIdeas.length;
  });

  constructor() {
    this.model.update(m => ({ ...m, name: this.dialogData.folder.name }));
    this.loadData();
  }

  private loadData() {
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
      },
      error: (err) => {
        console.error('Error loading data', err);
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

  editFolder() {
    if (this.form().invalid()) return;

    this.loading.set(true);
    const topicId = this.dialogData.topicId;
    const ideationId = this.dialogData.ideationId;
    const folderId = this.dialogData.folder.id;

    const data = {
      topicId,
      ideationId,
      folderId,
      name: this.form().value().name!
    };

    this.ideationService.updateFolder(data).pipe(take(1)).subscribe({
      next: (updatedFolder) => {
        const currentSelected = this.selectedIdeaIds();
        const ideasToAdd = Array.from(currentSelected).filter(id => !this.initialIdeaIds.has(id));
        const ideasToRemove = Array.from(this.initialIdeaIds).filter(id => !currentSelected.has(id));

        const actions: Observable<unknown>[] = [];
        if (ideasToAdd.length > 0) {
          actions.push(this.ideationService.addIdeaToFolder({ topicId, ideationId, folderId }, ideasToAdd));
        }
        ideasToRemove.forEach(ideaId => {
          actions.push(this.ideationService.removeIdeaFromFolder({ topicId, ideationId, folderId, ideaId }));
        });

        if (actions.length > 0) {
          forkJoin(actions).pipe(take(1)).subscribe({
            next: () => this.dialogRef.close(updatedFolder),
            error: (err) => {
              console.error('Error syncing folder ideas', err);
              this.dialogRef.close(updatedFolder);
            }
          });
        } else {
          this.dialogRef.close(updatedFolder);
        }
      },
      error: (err) => {
        console.error('Error updating folder', err);
        this.loading.set(false);
      }
    });
  }
}
