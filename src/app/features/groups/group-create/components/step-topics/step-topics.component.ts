import { Component, input, output, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Group } from '../../../../../core/interfaces/group';
import { Topic } from '../../../../../core/interfaces/topic';
import { SearchService } from '../../../../../core/services/search.service';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { InputComponent } from '../../../../../shared/components/input/input.component';

@Component({
  selector: 'cos-step-topics',
  standalone: true,
  imports: [
    FormsModule,
    TranslateModule,
    IconComponent,
    InputComponent
  ],
  templateUrl: './step-topics.component.html',
  styleUrl: './step-topics.component.scss'
})
export class StepTopicsComponent {
  group = input.required<Partial<Group>>();
  groupUpdate = output<Partial<Group>>();

  searchService = inject(SearchService);

  searchString = signal('');
  searchResults = signal<Topic[]>([]);
  selectedTopics = signal<Topic[]>([]);

  ngOnInit() {
    if (this.group().members?.topics?.rows) {
      this.selectedTopics.set(this.group().members!.topics.rows);
    }
  }

  onSearch(str: string) {
    this.searchString.set(str);
    if (str.length >= 2) {
      this.searchService.search(str, {
        include: 'my.topic',
        'my.topic.level': 'admin'
      }).subscribe(res => {
        this.searchResults.set(res.results.my.topics.rows);
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
