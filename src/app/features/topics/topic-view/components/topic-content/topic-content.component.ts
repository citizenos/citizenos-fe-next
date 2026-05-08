import { Component, signal, ViewChild, ElementRef, AfterViewInit, OnDestroy, inject, ChangeDetectionStrategy, model } from '@angular/core';
import { NgClass, UpperCasePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TopicService } from '../../../../../core/services/topic.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Topic } from '../../../../../core/interfaces/topic';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-topic-content',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass, UpperCasePipe, TranslateModule, IconComponent],
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
  private sanitizer = inject(DomSanitizer);

  topic = model.required<Topic>();
  tabTablet = model<string>('');

  @ViewChild('topicText') topicTextEl?: ElementRef<HTMLElement>;

  readMoreButton = signal(false);
  readMore = signal(false);

  private resizeObserver?: ResizeObserver;

  ngAfterViewInit() {
    if (this.topicTextEl?.nativeElement) {
      this.resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
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
