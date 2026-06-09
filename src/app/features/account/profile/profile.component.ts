import { IconComponent } from '../../../shared/components/icon/icon.component';
import { Component, inject, signal, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { KeyValuePipe, UpperCasePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UserStore } from '../../../core/state/user.store';
import { ConfigStore } from '../../../core/state/config.store';
import { UserService } from '../../../core/services/user.service';
import { TopicNotificationService } from '../../../core/services/topic-notification.service';
import { ToggleComponent } from '../../../shared/components/toggle/toggle.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { TermsLinksComponent } from '../../../shared/components/terms-links/terms-links.component';
import { firstValueFrom } from 'rxjs';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DialogService } from '../../../shared/dialog/dialog.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { InitialsComponent } from '../../../shared/components/initials/initials.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { ImageEditorComponent } from '../../../shared/components/image-editor/image-editor.component';
import { SeoService } from '../../../core/services/seo.service';

type ProfileTab = 'profile' | 'notifications';

@Component({
  selector: 'app-profile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ToggleComponent,
    DropdownComponent,
    InputComponent,
    RouterLink,
    TermsLinksComponent,
    KeyValuePipe,
    UpperCasePipe,
    InitialsComponent,
    PaginationComponent,
    ImageEditorComponent, IconComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  @ViewChild('imageUpload') fileInput?: ElementRef;

  store = inject(UserStore);
  configStore = inject(ConfigStore);
  userService = inject(UserService);
  topicNotificationService = inject(TopicNotificationService);
  translate = inject(TranslateService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  dialog = inject(DialogService);
  private seoService = inject(SeoService);
  private destroyRef = inject(DestroyRef);
  notificationParams = this.topicNotificationService.params;

  activeTab = signal<ProfileTab>('profile');

  form = {
    name: '',
    email: '',
    company: '',
    language: '',
    password: '',
    newPassword: '',
    passwordConfirm: '',
    imageUrl: '',
    preferences: {
      showInSearch: false
    }
  };

  errors: { name?: string; company?: string; email?: string; password?: string; newPassword?: string; general?: string } = {};
  resetPasswordMode = signal<boolean>(false);
  topicSearch = signal<string>('');
  imageFile = signal<File | null>(null);
  uploadedImage = signal<File | null>(null);

  languages: Record<string, string> = {
    en: 'English',
    et: 'Eesti',
    ru: 'Русский'
  };

  ngOnInit() {
    this.seoService.setPageTitle('VIEWS.ACCOUNT.HEADING');
    // Initialize form with user data
    const user = this.store.user();
    if (user) {
      this.form.name = user.name;
      this.form.email = user.email || '';
      this.form.company = user.company || '';
      this.form.language = user.language;
      this.form.imageUrl = user.imageUrl || '';
      this.form.preferences.showInSearch = user.preferences?.showInSearch || false;
    }

    // Handle tab fragments
    this.route.fragment.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(fragment => {
      if (fragment === 'notifications') {
        this.activeTab.set('notifications');
      } else {
        this.activeTab.set('profile');
      }
    });
  }

  selectTab(tab: ProfileTab) {
    this.router.navigate([], { fragment: tab });
  }

  toggleResetPassword() {
    this.resetPasswordMode.set(!this.resetPasswordMode());
  }

  async doUpdateProfile() {
    this.errors = {};
    const params: Record<string, unknown> = {
      name: this.form.name,
      email: this.form.email,
      company: this.form.company,
      language: this.form.language,
      preferences: this.form.preferences,
      imageUrl: this.form.imageUrl
    };

    if (this.resetPasswordMode()) {
      if (this.form.newPassword !== this.form.passwordConfirm) {
        this.errors.newPassword = 'MODALS.PASSWORD_MISMATCH';
        return;
      }
      params['password'] = this.form.password;
      params['newPassword'] = this.form.newPassword;
    }

    const currentImageFile = this.imageFile();
    if (currentImageFile) {
      try {
        const res = await firstValueFrom(this.userService.uploadUserImage(currentImageFile)) as { imageUrl: string };
        params['imageUrl'] = res.imageUrl;
      } catch (err) {
        console.error('Image upload failed', err);
      }
    }

    try {
      await this.store.updateProfile(params);
      this.resetPasswordMode.set(false);
      this.form.password = '';
      this.form.newPassword = '';
      this.form.passwordConfirm = '';
      this.imageFile.set(null);
      this.uploadedImage.set(null);
    } catch (err: unknown) {
      const error = err as { error?: { errors?: { name?: string; company?: string; email?: string; password?: string; newPassword?: string } } };
      this.errors = error.error?.errors || { general: 'ERRORS.GENERAL' };
    }
  }

  async doDeleteAccount() {
    const deleteDialog = this.dialog.open(ConfirmDialogComponent, {
      data: {
        level: 'delete',
        heading: 'MODALS.USER_DELETE_CONFIRM_HEADING',
        title: 'MODALS.USER_DELETE_CONFIRM_TXT_ARE_YOU_SURE',
        description: 'MODALS.USER_DELETE_CONFIRM_TXT_NO_UNDO',
        points: ['MODALS.USER_DELETE_CONFIRM_TXT_USER_DELETED', 'MODALS.USER_DELETE_CONFIRM_TXT_KEEP_DATA_ANONYMOUSLY'],
        confirmBtn: 'MODALS.USER_DELETE_CONFIRM_YES',
        closeBtn: 'MODALS.USER_DELETE_CONFIRM_NO'
      }
    });

    deleteDialog.afterClosed().subscribe(async (result) => {
      if (result === true) {
        try {
          await this.store.deleteAccount();
          this.router.navigate(['/']);
        } catch (err) {
          console.error('Failed to delete account', err);
        }
      }
    });
  }

  async setProfileLanguage(lang: string) {
    this.form.language = lang;
    this.configStore.setLanguage(lang);
    try {
      await this.store.updateProfile({ language: lang });
    } catch (err) {
      console.error('Failed to update language', err);
    }
  }

  searchTopics() {
    this.topicNotificationService.setParam('search', this.topicSearch());
  }

  toggleTopicNotifications(topic: { topicId: string, allowNotifications: boolean }) {
    if (!topic.allowNotifications) {
      const removeDialog = this.dialog.open(ConfirmDialogComponent, {
        data: {
          level: 'delete',
          heading: 'MODALS.REMOVE_TOPIC_NOTIFICATIONS_CONFIRM_TITLE',
          title: 'MODALS.REMOVE_TOPIC_NOTIFICATIONS_CONFIRM_ARE_YOU_SURE',
          confirmBtn: 'MODALS.REMOVE_TOPIC_NOTIFICATIONS_CONFIRM_YES',
          closeBtn: 'MODALS.REMOVE_TOPIC_NOTIFICATIONS_CONFIRM_NO'
        }
      });

      removeDialog.afterClosed().subscribe((result) => {
        if (result === true) {
          this.topicNotificationService.delete(topic.topicId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
        } else {
          topic.allowNotifications = true;
        }
      });
    } else {
      this.topicNotificationService.update(topic.topicId, {
        allowNotifications: true
      }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    }
  }

  triggerUploadImage() {
    this.fileInput?.nativeElement.click();
  }

  fileUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      this.uploadedImage.set(file);
    }
  }

  updateUserImage(file: File) {
    this.imageFile.set(file);
  }

  async deleteUserImage() {
    if (this.fileInput) {
      this.fileInput.nativeElement.value = null;
    }
    this.form.imageUrl = '';
    this.imageFile.set(null);
    this.uploadedImage.set(null);

    try {
      await this.store.updateProfile({ imageUrl: '' });
    } catch (err) {
      console.error('Failed to delete image', err);
    }
  }
}
