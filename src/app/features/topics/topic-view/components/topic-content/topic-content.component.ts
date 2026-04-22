import { Component, input, signal, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TopicService } from '../../../../../core/services/topic.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Topic } from '../../../../../core/interfaces/topic';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-topic-content',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './topic-content.component.html',
  styleUrls: ['./topic-content.component.scss'],
  animations: [
    trigger('readMore', [
      state('open', style({
        maxHeight: '100%',
        transition: '0.1s max-height',
      })),
      state('closed', style({
        maxHeight: '384px',
        transition: '0.1s max-height',
      })),
      transition('closed <=> open', animate('100ms ease-in-out')),
    ])
  ]
})
export class TopicContentComponent implements AfterViewInit, OnDestroy {
  topic = input.required<Topic>();
  tabTablet = input<string>(''); // Determines if we are hiding content due to tablet layout
  
  @ViewChild('topicText') topicTextEl?: ElementRef<HTMLElement>;
  
  readMoreButton = signal(false);
  readMore = signal(false);

  private resizeObserver?: ResizeObserver;

  constructor(private sanitizer: DomSanitizer) {}

  ngAfterViewInit() {
    if (this.topicTextEl?.nativeElement) {
      this.resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          if (entry.target.scrollHeight >= 320) {
            this.readMoreButton.set(true);
          }
        }
      });
      this.resizeObserver.observe(this.topicTextEl.nativeElement);
      
      // Initial check just in case
      if (this.topicTextEl.nativeElement.scrollHeight >= 320) {
        this.readMoreButton.set(true);
      }
    }
  }

  ngOnDestroy() {
    this.resizeObserver?.disconnect();
  }

  toggleReadMore() {
    this.readMore.update(v => !v);
    if (!this.readMore()) {
      setTimeout(() => {
        this.topicTextEl?.nativeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
      }, 200);
    }
  }

  getSafeHtml(html: string | null): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html || '');
  }
}
