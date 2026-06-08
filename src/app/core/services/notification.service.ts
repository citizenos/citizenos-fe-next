import { Service, signal } from '@angular/core';

export type NotificationLevel = 'success' | 'info' | 'warning' | 'error';

export interface Notification {
  id: string;
  level: NotificationLevel;
  titleKey?: string;
  messageKey?: string;
  message?: string;
}

@Service()
export class NotificationService {
  private _notifications = signal<Notification[]>([]);
  readonly notifications = this._notifications.asReadonly();

  private nextId = 0;

  show(level: NotificationLevel, messageKey: string, titleKey?: string, durationMs = 6000): string {
    const id = String(this.nextId++);
    this._notifications.update((list) => [
      ...list,
      { id, level, messageKey, titleKey },
    ]);
    if (durationMs > 0) {
      setTimeout(() => this.dismiss(id), durationMs);
    }
    return id;
  }

  showRaw(level: NotificationLevel, message: string, durationMs = 6000): string {
    const id = String(this.nextId++);
    this._notifications.update((list) => [
      ...list,
      { id, level, message },
    ]);
    if (durationMs > 0) {
      setTimeout(() => this.dismiss(id), durationMs);
    }
    return id;
  }

  success(messageKey: string, titleKey?: string) {
    return this.show('success', messageKey, titleKey);
  }

  error(messageKey: string, titleKey?: string) {
    return this.show('error', messageKey, titleKey);
  }

  warning(messageKey: string, titleKey?: string) {
    return this.show('warning', messageKey, titleKey);
  }

  info(messageKey: string, titleKey?: string) {
    return this.show('info', messageKey, titleKey);
  }

  dismiss(id: string) {
    this._notifications.update((list) => list.filter((n) => n.id !== id));
  }

  clear() {
    this._notifications.set([]);
  }
}
