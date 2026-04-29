import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { A11yModule } from '@angular/cdk/a11y';
import { take } from 'rxjs';
import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';
import { DialogCloseDirective } from '../../../../../shared/dialog';
import { InitialsComponent } from '../../../../../shared/components/initials/initials.component';
import { TopicIdeationService } from '../../../../../core/services/topic-ideation.service';
import { UserStore } from '../../../../../core/state/user.store';
import { Idea } from '../../../../../core/interfaces/idea';
import { Topic } from '../../../../../core/interfaces/topic';

export interface IdeaDialogData {
  topicId: string;
  ideationId: string;
  ideaId: string;
  topic: Topic;
  ideas?: Idea[];
}

@Component({
  selector: 'cos-idea-dialog',
  standalone: true,
  imports: [TranslateModule, DialogCloseDirective, InitialsComponent, DatePipe, A11yModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './idea-dialog.component.html',
  styleUrls: ['./idea-dialog.component.scss'],
})
export class IdeaDialogComponent {
  readonly data = inject<IdeaDialogData>(DIALOG_DATA);

  private ideationService = inject(TopicIdeationService);
  readonly userStore = inject(UserStore);

  readonly idea = signal<Idea | null>(null);
  readonly isLoading = signal(true);
  readonly hasError = signal(false);

  private currentIdeaId = signal(this.data.ideaId);

  readonly currentIndex = computed(() => {
    if (!this.data.ideas) return -1;
    return this.data.ideas.findIndex((i) => i.id === this.currentIdeaId());
  });

  readonly hasPrev = computed(() => this.currentIndex() > 0);
  readonly hasNext = computed(() => {
    if (!this.data.ideas) return false;
    return this.currentIndex() < this.data.ideas.length - 1;
  });

  constructor() {
    this.loadIdea(this.data.ideaId);
  }

  private loadIdea(ideaId: string) {
    this.isLoading.set(true);
    this.hasError.set(false);
    this.ideationService
      .getIdea({ topicId: this.data.topicId, ideationId: this.data.ideationId, ideaId })
      .pipe(take(1))
      .subscribe({
        next: (idea) => {
          this.idea.set(idea);
          this.currentIdeaId.set(idea.id);
          this.isLoading.set(false);
        },
        error: () => {
          this.hasError.set(true);
          this.isLoading.set(false);
        },
      });
  }

  prevIdea() {
    if (!this.data.ideas || !this.hasPrev()) return;
    const prev = this.data.ideas[this.currentIndex() - 1];
    this.loadIdea(prev.id);
  }

  nextIdea() {
    if (!this.data.ideas || !this.hasNext()) return;
    const next = this.data.ideas[this.currentIndex() + 1];
    this.loadIdea(next.id);
  }

  toggleFavourite() {
    const idea = this.idea();
    if (!idea || !this.userStore.isAuthenticated()) return;
    const params = { topicId: this.data.topicId, ideationId: this.data.ideationId, ideaId: idea.id };
    if (idea.favourite) {
      this.ideationService.removeIdeaFromFavourites(params).pipe(take(1)).subscribe(() => {
        this.idea.set({ ...idea, favourite: false });
      });
    } else {
      this.ideationService.addIdeaToFavourites(params).pipe(take(1)).subscribe(() => {
        this.idea.set({ ...idea, favourite: true });
      });
    }
  }

  voteIdea(value: number) {
    const idea = this.idea();
    if (!idea || !this.userStore.isAuthenticated()) return;
    this.ideationService
      .voteIdea({ topicId: this.data.topicId, ideationId: this.data.ideationId, ideaId: idea.id, value })
      .pipe(take(1))
      .subscribe(() => {
        const currentUp = idea.votes.up;
        const wasSelected = currentUp.selected;
        this.idea.set({
          ...idea,
          votes: {
            ...idea.votes,
            up: { count: wasSelected ? currentUp.count - 1 : currentUp.count + 1, selected: !wasSelected },
          },
        });
      });
  }

  hasMoreIdeas() {
    return this.hasPrev() || this.hasNext();
  }
}
