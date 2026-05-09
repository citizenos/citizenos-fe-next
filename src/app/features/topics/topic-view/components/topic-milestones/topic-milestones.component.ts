import { Component, OnInit, input, inject, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { take, map } from 'rxjs';
import { Topic } from '../../../../../core/interfaces/topic';
import { TopicEvent } from '../../../../../core/interfaces/topic-event';
import { TopicEventService } from '../../../../../core/services/topic-event.service';
import { TopicService } from '../../../../../core/services/topic.service';
import { DialogService } from '../../../../../shared/dialog/dialog.service';
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { CosDropdownDirective } from '../../../../../shared/directives/cos-dropdown.directive';
import { TooltipComponent } from '../../../../../shared/components/tooltip/tooltip.component';
import { InputComponent } from '../../../../../shared/components/input/input.component';

@Component({
  selector: 'app-topic-milestones',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    TranslateModule,
    IconComponent,
    CosDropdownDirective,
    TooltipComponent,
    InputComponent
  ],
  templateUrl: './topic-milestones.component.html',
  styleUrls: ['./topic-milestones.component.scss']
})
export class TopicMilestonesComponent implements OnInit {
  topic = input.required<Topic>();
  isStatusClosed = input<boolean>(false);

  private dialog = inject(DialogService);
  private topicEventService = inject(TopicEventService);
  private topicService = inject(TopicService);

  event = {
    subject: '',
    text: '',
    topicId: ''
  };

  errors = signal<Record<string, string> | null>(null);
  topicEvents = signal<TopicEvent[]>([]);
  countTotal = computed(() => this.topicEvents().length);
  
  maxLengthSubject = 128;
  maxLengthText = 2048;

  ngOnInit(): void {
    this.loadEvents();
    this.event.topicId = this.topic().id;
  }

  loadEvents() {
    this.topicEventService.query({ topicId: this.topic().id }).pipe(
      take(1),
      map(res => res.rows || [])
    ).subscribe(events => {
      this.topicEvents.set(events);
    });
  }

  submitEvent() {
    this.topicEventService
      .save(this.event)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.event.subject = '';
          this.event.text = '';
          this.loadEvents();
        },
        error: (err) => {
          this.errors.set(err.error?.errors || err.error);
        }
      });
  }

  canEdit() {
    return this.topicService.canEdit(this.topic());
  }

  canDelete() {
    return this.topicService.canDelete(this.topic());
  }

  toggleEditMode(evt: TopicEvent) {
    if (!evt.origSubject) {
      evt.origSubject = evt.subject;
      evt.origText = evt.text;
    }
    if (!evt.editMode) {
      evt.editMode = true;
    } else {
      evt.editMode = false;
      evt.subject = evt.origSubject ?? '';
      evt.text = evt.origText ?? '';
    }
  }

  editEvent(evt: TopicEvent) {
    const updateData = {
      ...evt,
      topicId: this.topic().id,
      eventId: evt.id
    };
    this.topicEventService
      .update(updateData)
      .pipe(take(1))
      .subscribe({
        next: () => {
          evt.editMode = false;
          this.loadEvents();
        },
        error: (err) => {
          this.errors.set(err.error?.errors || err.error);
        }
      });
  }

  deleteEvent(evt: TopicEvent) {
    const deleteDialog = this.dialog.open(ConfirmDialogComponent, {
      data: {
        level: 'delete',
        heading: 'MODALS.TOPIC_EVENT_DELETE_CONFIRM_HEADING',
        title: 'MODALS.TOPIC_EVENT_DELETE_CONFIRM_TXT_ARE_YOU_SURE',
        description: evt.subject,
        points: ['MODALS.TOPIC_EVENT_DELETE_CONFIRM_TXT_ARE_YOU_SURE'],
        confirmBtn: 'MODALS.TOPIC_EVENT_DELETE_CONFIRM_BTN_YES',
        closeBtn: 'MODALS.TOPIC_EVENT_DELETE_CONFIRM_BTN_NO'
      }
    });

    deleteDialog.afterClosed().subscribe((result: boolean | undefined) => {
      if (result === true) {
        this.topicEventService
          .delete({ ...evt, topicId: this.topic().id })
          .pipe(take(1))
          .subscribe(() => {
            this.loadEvents();
          });
      }
    });
  }
}
