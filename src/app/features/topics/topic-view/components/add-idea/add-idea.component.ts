import { Component, input, output, inject, signal, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription, interval, take } from 'rxjs';

import { TopicIdeationService, IdeaStatus } from '../../../../../core/services/topic-ideation.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { Topic } from '../../../../../core/interfaces/topic';
import { Ideation } from '../../../../../core/interfaces/ideation';
import { Idea } from '../../../../../core/interfaces/idea';

const AUTOSAVE_INTERVAL = 15000;
const AUTOSAVE_HIDE_DELAY = 2000;
const STATEMENT_MAXLENGTH = 1024;

@Component({
  selector: 'app-add-idea',
  standalone: true,
  imports: [FormsModule, TranslateModule],
  templateUrl: './add-idea.component.html',
  styleUrls: ['./add-idea.component.scss'],
})
export class AddIdeaComponent implements OnDestroy {
  topic = input.required<Topic>();
  ideation = input.required<Ideation>();

  ideaAdded = output<Idea>();
  closed = output<void>();

  private ideationService = inject(TopicIdeationService);
  private notificationService = inject(NotificationService);

  statement = signal('');
  description = signal('');
  errors = signal<Record<string, string>>({});
  isAutosaving = signal(false);
  isPublished = signal(false);

  STATEMENT_MAXLENGTH = STATEMENT_MAXLENGTH;

  private autosavedIdea: Idea | null = null;
  private autosaveSubscription?: Subscription;

  ngOnDestroy() {
    this.autosaveSubscription?.unsubscribe();
  }

  onStatementChange(value: string) {
    this.statement.set(value);
    this.errors.update(e => ({ ...e, statement: '' }));
    this.maybeStartAutosave();
  }

  onDescriptionChange(value: string) {
    this.description.set(value);
    this.errors.update(e => ({ ...e, description: '' }));
    this.maybeStartAutosave();
  }

  private maybeStartAutosave() {
    if (this.isPublished() || this.autosaveSubscription && !this.autosaveSubscription.closed) return;
    if (!this.statement() && !this.description()) return;
    this.autosaveSubscription = interval(AUTOSAVE_INTERVAL).subscribe(() => {
      this.saveIdea(IdeaStatus.draft, true);
    });
  }

  validate(): boolean {
    const errs: Record<string, string> = {};
    if (!this.statement().trim()) errs['statement'] = 'VIEWS.IDEATION_CREATE.ERROR_STATEMENT_REQUIRED';
    if (!this.description().trim()) errs['description'] = 'VIEWS.IDEATION_CREATE.ERROR_DESCRIPTION_REQUIRED';
    this.errors.set(errs);
    return Object.keys(errs).length === 0;
  }

  publish() {
    if (!this.validate()) return;
    this.saveIdea(IdeaStatus.published);
  }

  saveDraft() {
    this.saveIdea(IdeaStatus.draft);
  }

  close() {
    this.autosaveSubscription?.unsubscribe();
    this.autosavedIdea = null;
    this.closed.emit();
  }

  private saveIdea(status: IdeaStatus, isAutosave = false) {
    const topicId = this.topic().id;
    const ideationId = this.ideation().id;
    let statement = this.statement();
    let description = this.description();

    if (status === IdeaStatus.draft) {
      if (!statement) statement = '';
      if (!description) description = '';
    }

    if (isAutosave) this.isAutosaving.set(true);

    const save$ = this.autosavedIdea
      ? this.ideationService.updateIdea({ topicId, ideationId, ideaId: this.autosavedIdea.id, statement, description, status })
      : this.ideationService.createIdea({ topicId, ideationId, statement, description, status });

    save$.pipe(take(1)).subscribe({
      next: (idea) => {
        if (isAutosave) {
          this.autosavedIdea = idea;
          setTimeout(() => this.isAutosaving.set(false), AUTOSAVE_HIDE_DELAY);
        } else {
          this.isPublished.set(true);
          this.autosaveSubscription?.unsubscribe();
          this.autosavedIdea = null;
          this.ideaAdded.emit(idea);
        }
      },
      error: (err) => {
        if (isAutosave) {
          setTimeout(() => this.isAutosaving.set(false), AUTOSAVE_HIDE_DELAY);
        } else {
          this.errors.set(err?.errors ?? {});
        }
      },
    });
  }
}
