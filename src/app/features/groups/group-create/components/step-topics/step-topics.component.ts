import { Component, ChangeDetectionStrategy, input, output, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Topic } from '../../../../../core/interfaces/topic';
import { SearchService } from '../../../../../core/services/search.service';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { GroupCreateData } from '../../group-create.interface';

@Component({
  selector: 'cos-step-topics',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    TranslateModule,
    IconComponent,
    InputComponent,
    ButtonComponent
  ],
  templateUrl: './step-topics.component.html',
  styleUrl: './step-topics.component.scss'
})
export class StepTopicsComponent implements OnInit {
  group = input.required<GroupCreateData>();
  groupUpdate = output<GroupCreateData>();

  searchService = inject(SearchService);

  searchString = signal('');
  searchResults = signal<Topic[]>([]);
  selectedTopics = signal<Topic[]>([]);

  ngOnInit() {
    if (this.group().members?.topics?.rows) {
      this.selectedTopics.set(this.group().members?.topics?.rows || []);
    }
  }

  onSearch(str: string) {
    this.searchString.set(str);
    if (str.length >= 2) {
      this.searchService.search(str, {
        include: 'my.topic',
        'my.topic.level': 'admin'
      }).subscribe((res: unknown) => {
        const data = res as { results?: { my?: { topics?: { rows: Topic[] } } } };
        this.searchResults.set(data.results?.my?.topics?.rows ?? []);
      });
    } else {
      this.searchResults.set([]);
    }
  }

  addTopic(topic: Topic) {
    if (!this.selectedTopics().find(t => t.id === topic.id)) {
      this.selectedTopics.update(topics => [...topics, topic]);
      this.emitChange();
    }
    this.searchString.set('');
    this.searchResults.set([]);
  }

  removeTopic(topic: Topic) {
    this.selectedTopics.update(topics => topics.filter(t => t.id !== topic.id));
    this.emitChange();
  }

  private emitChange() {
    this.groupUpdate.emit({
      members: {
        ...this.group().members,
        topics: {
          rows: this.selectedTopics()
        }
      }
    });
  }
}
