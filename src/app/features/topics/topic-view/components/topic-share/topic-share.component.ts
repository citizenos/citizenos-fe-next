import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { Component, ChangeDetectionStrategy, inject, signal, computed, ElementRef, ViewChild, OnInit, model, PLATFORM_ID } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UpperCasePipe, isPlatformBrowser } from '@angular/common';
import { QRCodeComponent } from 'angularx-qrcode';
import { Topic } from '../../../../../core/interfaces/topic';
import { TopicService } from '../../../../../core/services/topic.service';
import { TopicJoinService } from '../../../../../core/services/topic-join.service';
import { UserStore } from '../../../../../core/state/user.store';
import { DialogService } from '../../../../../shared/dialog/dialog.service';
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { DropdownComponent } from '../../../../../shared/components/dropdown/dropdown.component';
import { TooltipComponent } from '../../../../../shared/components/tooltip/tooltip.component';
import { take, timer } from 'rxjs';

@Component({
  selector: 'cos-topic-share',
  standalone: true,
  imports: [
    UpperCasePipe,
    TranslateModule,
    QRCodeComponent,
    ButtonComponent,
    DropdownComponent,
    TooltipComponent, IconComponent],
  templateUrl: './topic-share.component.html',
  styleUrls: ['./topic-share.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopicShareComponent implements OnInit {
  topic = model<Topic>();

  @ViewChild('linkInput') linkInput!: ElementRef;

  private translate = inject(TranslateService);
  private topicService = inject(TopicService);
  private topicJoinService = inject(TopicJoinService);
  private userStore = inject(UserStore);
  private dialog = inject(DialogService);
  private platformId = inject(PLATFORM_ID);

  readonly LEVELS = Object.keys(this.topicService.LEVELS);
  
  join = signal({
    level: this.topicService.LEVELS.read as string | null,
    token: null as string | null
  });

  joinDisabled = signal(true);
  joinUrl = computed(() => {
    const j = this.join();
    const t = this.topic();
    if (!t) return '';
    const baseUrl = isPlatformBrowser(this.platformId) ? window.location.origin : '';

    if (j.token && this.topicService.canShare(t)) {
      return `${baseUrl}/topics/join/${j.token}`;
    } else {
      return `${baseUrl}/topics/${t.id}`;
    }
  });
  showQR = signal(false);
  copySuccess = signal(false);

  ngOnInit(): void {
    const t = this.topic();
    if (t?.join) {
      this.join.set({
        level: t.join.level,
        token: t.join.token
      });
    }
  }

  canUpdate() {
    const t = this.topic();
    return t ? this.topicService.canUpdate(t) : false;
  }

  generateTokenJoin() {
    const t = this.topic();
    if (!t) return;
    const confirm = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'MODALS.TOPIC_INVITE_SHARE_LINK_GENERATE_CONFIRM_TXT_ARE_YOU_SURE',
        heading: 'MODALS.TOPIC_INVITE_SHARE_LINK_GENERATE_CONFIRM_HEADING',
        closeBtn: 'MODALS.TOPIC_INVITE_SHARE_LINK_GENERATE_CONFIRM_BTN_NO',
        confirmBtn: 'MODALS.TOPIC_INVITE_SHARE_LINK_GENERATE_CONFIRM_BTN_YES',
        points: [
          'MODALS.TOPIC_INVITE_SHARE_LINK_GENERATE_CONFIRM_TXT_POINT1',
          'MODALS.TOPIC_INVITE_SHARE_LINK_GENERATE_CONFIRM_TXT_POINT2'
        ]
      }
    });

    confirm.afterClosed().pipe(take(1)).subscribe(result => {
      if (result === true) {
        const user = this.userStore.user();
        if (user) {
          this.topicJoinService.save({
            topicId: t.id,
            userId: user.id,
            level: this.join().level
          }).pipe(take(1)).subscribe((res: Topic['join']) => {
            const t = this.topic();
            if (t && res) t.join = res;
            if (res) {
              this.join.set({
                token: res.token,
                level: res.level
              });
            }
          });
        }
      }
    });
  }

  doUpdateJoinToken(level: string) {
    const t = this.topic();
    if (!t || !this.canUpdate()) return;
    const user = this.userStore.user();
    if (user) {
      const topicJoin = {
        topicId: t.id,
        userId: user.id,
        level: level,
        token: this.join().token
      };

      this.topicJoinService.update(topicJoin).pipe(take(1)).subscribe(() => {
        this.join.update(j => ({ ...j, level }));
      });
    }
  }

  copyInviteLink() {
    this.joinDisabled.set(false);
    timer(0).pipe(take(1)).subscribe(() => {
      const urlInputElement = this.linkInput.nativeElement as HTMLInputElement;
      urlInputElement.focus();
      urlInputElement.select();
      urlInputElement.setSelectionRange(0, 99999);
      if (isPlatformBrowser(this.platformId)) {
        navigator.clipboard.writeText(urlInputElement.value).then(() => {
          this.copySuccess.set(true);
        });
      }
      
      timer(500).pipe(take(1)).subscribe(() => {
        this.copySuccess.set(false);
        this.joinDisabled.set(true);
      });
    });
  }
}
