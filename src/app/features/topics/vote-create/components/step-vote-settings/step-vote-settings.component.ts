import { Component, input, output, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { VoteOption, VoteWithOptions } from '../../../../../core/interfaces/vote';
import { Topic } from '../../../../../core/interfaces/topic';
import { Idea } from '../../../../../core/interfaces/idea';
import { IdeationFolder } from '../../../../../core/interfaces/ideation';
import { TopicIdeationService } from '../../../../../core/services/topic-ideation.service';
import { TopicService } from '../../../../../core/services/topic.service';
import { DeadlinePickerComponent } from '../../../../../shared/components/deadline-picker/deadline-picker.component';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'cos-step-vote-settings',
  standalone: true,
  imports: [FormsModule, TranslateModule, DeadlinePickerComponent, InputComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './step-vote-settings.component.html',
  styleUrl: './step-vote-settings.component.scss'
})
export class StepVoteSettingsComponent implements OnInit {
  private topicIdeationService = inject(TopicIdeationService);
  topicService = inject(TopicService);

  topic = input<Partial<Topic>>();
  vote = input.required<Partial<VoteWithOptions>>();
  voteUpdate = output<Partial<VoteWithOptions>>();

  predefined = ['Yes', 'No', 'Neutral', 'Veto'];
  
  ideationIdeas = signal<Idea[]>([]);
  ideationFolders = signal<IdeationFolder[]>([]);
  folderExpanded: Record<string, boolean> = {};

  ngOnInit() {
    const t = this.topic();
    if (t?.ideationId) {
      forkJoin({
        ideas: this.topicIdeationService.getIdeas({ topicId: t.id!, ideationId: t.ideationId }),
        folders: this.topicIdeationService.getFolders({ topicId: t.id!, ideationId: t.ideationId })
      }).subscribe(({ ideas, folders }) => {
        this.ideationIdeas.set(ideas.rows);
        this.ideationFolders.set(folders.rows);
      });
    }
  }

  canEditDescription(): boolean {
    const t = this.topic();
    if (!t || !t.id) return true;
    return this.topicService.canEditDescription(t as Topic);
  }

  onQuestionChange(question: string) {
    if (!this.canEditDescription()) return;
    this.onUpdate({ question });
  }

  setAuthType(authType: 'soft' | 'hard') {
    if (!this.canEditDescription()) return;
    if (authType === 'hard') {
      this.onUpdate({ authType: 'hard', delegationIsAllowed: false });
    } else {
      this.onUpdate({ authType: 'soft' });
    }
  }

  isIdeaChecked(idea: Idea): boolean {
    return this.getOptions().some(o => o.ideaId === idea.id);
  }

  toggleIdea(idea: Idea, event: Event) {
    event.stopPropagation();
    if (!this.canEditDescription()) return;
    const options = [...this.getOptions()];
    const index = options.findIndex(o => o.ideaId === idea.id);
    if (index > -1) {
      options.splice(index, 1);
    } else {
      options.push({ value: idea.statement, ideaId: idea.id });
    }
    this.onUpdate({ options });
  }

  isFolderChecked(folder: IdeationFolder): boolean {
    if (!folder.ideas?.rows?.length) return false;
    return folder.ideas.rows.every(idea => this.isIdeaChecked(idea as Idea));
  }

  toggleFolder(folder: IdeationFolder, event: Event) {
    event.stopPropagation();
    if (!this.canEditDescription()) return;
    const isChecked = this.isFolderChecked(folder);
    let options = [...this.getOptions()];
    
    if (isChecked) {
      folder.ideas?.rows?.forEach(idea => {
        options = options.filter(o => o.ideaId !== idea.id);
      });
    } else {
      folder.ideas?.rows?.forEach(idea => {
        if (!this.isIdeaChecked(idea as Idea)) {
          options.push({ value: idea.statement, ideaId: idea.id });
        }
      });
    }
    this.onUpdate({ options });
  }

  toggleFolderExpand(folderId: string, event: Event) {
    event.stopPropagation();
    this.folderExpanded[folderId] = !this.folderExpanded[folderId];
  }

  allIdeasChecked(): boolean {
    const totalIdeas = this.totalIdeasCount();
    if (totalIdeas === 0) return false;
    const ideaOptions = this.getOptions().filter(o => !!o.ideaId);
    return ideaOptions.length === totalIdeas;
  }

  toggleAllIdeas() {
    if (!this.canEditDescription()) return;
    const isChecked = this.allIdeasChecked();
    const options = [...this.getOptions().filter(o => !o.ideaId)]; // keep non-idea options (e.g. neutral)
    
    if (!isChecked) {
      this.ideationIdeas().forEach(idea => {
        options.push({ value: idea.statement, ideaId: idea.id });
      });
      this.ideationFolders().forEach(folder => {
        folder.ideas?.rows?.forEach(idea => {
          options.push({ value: idea.statement, ideaId: idea.id });
        });
      });
    }
    this.onUpdate({ options });
  }

  totalIdeasCount(): number {
    let count = this.ideationIdeas().length;
    this.ideationFolders().forEach(f => count += f.ideas?.count || 0);
    return count;
  }

  getOptions(): VoteOption[] {
    const options = this.vote().options;
    if (Array.isArray(options)) return options;
    if (options && typeof options === 'object' && 'rows' in options) return options.rows;
    return [];
  }

  setType(type: 'regular' | 'multiple' | 'ideation') {
    if (!this.canEditDescription()) return;
    const updates: Partial<VoteWithOptions> = { type };
    let options = [...this.getOptions()];
    
    if (type === 'regular' && options.length === 0) {
      options = [{ value: 'Yes' }, { value: 'No' }];
    } else if (type === 'multiple') {
      options = options.filter(o => !this.predefined.includes(o.value) && !o.ideaId);
      if (options.length === 0) {
        options = [{ value: '' }, { value: '' }];
      }
    } else if (type === 'ideation') {
      options = options.filter(o => o.ideaId || o.value === 'Neutral' || o.value === 'Veto');
    }
    
    updates.options = options;
    this.onUpdate(updates);
  }

  toggleOption(val: string) {
    if (!this.canEditDescription()) return;
    const options = [...this.getOptions()];
    const index = options.findIndex(o => o.value === val && !o.ideaId);
    if (index > -1) {
      options.splice(index, 1);
    } else {
      options.push({ value: val });
    }
    this.onUpdate({ options });
  }

  isPredefinedSelected(val: string): boolean {
    return this.getOptions().some(o => o.value?.toLowerCase() === val.toLowerCase() && !o.ideaId);
  }

  togglePredefined(val: string) {
    if (!this.canEditDescription()) return;
    const options = [...this.getOptions()];
    const index = options.findIndex(o => o.value?.toLowerCase() === val.toLowerCase());
    if (index > -1) {
      options.splice(index, 1);
    } else {
      options.push({ value: val });
    }
    this.onUpdate({ options });
  }

  addOption() {
    if (!this.canEditDescription()) return;
    const options = [...this.getOptions(), { value: '' }];
    this.onUpdate({ options });
  }

  updateOption(index: number, value: string) {
    if (!this.canEditDescription()) return;
    const options = [...this.getOptions()];
    options[index] = { ...options[index], value };
    this.onUpdate({ options });
  }

  removeOption(index: number) {
    if (!this.canEditDescription()) return;
    const options = [...this.getOptions()];
    options.splice(index, 1);
    this.onUpdate({ options });
  }

  getOptionsLimit(): number {
    return this.getOptions().filter(o => !!o.value && o.value.toLowerCase() !== 'neutral' && o.value.toLowerCase() !== 'veto').length;
  }

  adjustCount(field: 'min' | 'max', delta: number) {
    if (!this.canEditDescription()) return;
    const limit = Math.max(1, this.getOptionsLimit());
    if (field === 'min') {
      const current = this.vote().minChoices || 1;
      const next = Math.max(1, Math.min(current + delta, limit));
      const updates: Partial<VoteWithOptions> = { minChoices: next };
      if (next > (this.vote().maxChoices || 1)) {
        updates.maxChoices = next;
      }
      this.onUpdate(updates);
    } else {
      const current = this.vote().maxChoices || limit;
      const next = Math.max(1, Math.min(current + delta, limit));
      const updates: Partial<VoteWithOptions> = { maxChoices: next };
      if ((this.vote().minChoices || 1) > next) {
        updates.minChoices = next;
      }
      this.onUpdate(updates);
    }
  }

  toggleDelegation() {
    if (!this.canEditDescription() || this.vote().authType === 'hard') return;
    this.onUpdate({ delegationIsAllowed: !this.vote().delegationIsAllowed });
  }

  getVoteDeadlineDate(): Date | null {
    return this.vote().endsAt ? new Date(this.vote().endsAt!) : null;
  }

  getVoteReminderDate(): Date | null {
    return this.vote().reminderTime ? new Date(this.vote().reminderTime!) : null;
  }

  onDeadlineChange(date: Date | null) {
    this.onUpdate({ endsAt: date ? date.toISOString() : null });
  }

  onReminderChange(date: Date | null) {
    this.onUpdate({ reminderTime: date ? date.toISOString() : null });
  }

  onUpdate(updates: Partial<VoteWithOptions>) {
    this.voteUpdate.emit({ ...this.vote(), ...updates });
  }

  isValid(): boolean {
    return !!this.vote().question && this.getOptions().filter(o => !!o.value).length >= 2;
  }
}
