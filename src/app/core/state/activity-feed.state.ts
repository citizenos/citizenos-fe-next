import { Service, signal } from '@angular/core';

@Service()
export class ActivityFeedState {
  readonly isOpen = signal(false);
  readonly groupId = signal<string | undefined>(undefined);
  readonly topicId = signal<string | undefined>(undefined);

  open(ctx?: { groupId?: string; topicId?: string }): void {
    this.groupId.set(ctx?.groupId);
    this.topicId.set(ctx?.topicId);
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  toggle(ctx?: { groupId?: string; topicId?: string }): void {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open(ctx);
    }
  }
}
