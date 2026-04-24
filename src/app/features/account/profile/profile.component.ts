import { Component, inject, signal, computed, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, PLATFORM_ID, DestroyRef } from '@angular/core';
import { isPlatformBrowser, KeyValuePipe, AsyncPipe, UpperCasePipe } from '@angular/common';
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
    AsyncPipe,
    UpperCasePipe,
    InitialsComponent,
    PaginationComponent
  ],
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
  private platformId = inject(PLATFORM_ID);
  private destroyRef = inject(DestroyRef);

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

  errors: any = {};
  resetPasswordMode = signal<boolean>(false);
  topicSearch = signal<string>('');
  imageFile: File | null = null;
  tmpImageUrl: string | null = null;

  languages: { [key: string]: string } = {
    en: 'English',
    et: 'Eesti',
    ru: 'Русский'
  };

  ngOnInit() {
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

    // Load initial notification topics
    // this.topicNotificationService.loadItems(); // Removed as it is protected and items$ is already initialized
  }

  selectTab(tab: ProfileTab) {
    this.router.navigate([], { fragment: tab });
  }

  toggleResetPassword() {
    this.resetPasswordMode.set(!this.resetPasswordMode());
  }

  async doUpdateProfile() {
    this.errors = {};
    const params: any = {
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
      params.password = this.form.password;
      params.newPassword = this.form.newPassword;
    }

    if (this.imageFile) {
      try {
        const res = await firstValueFrom(this.userService.uploadUserImage(this.imageFile));
        params.imageUrl = res.imageUrl; // The legacy component used res.link, but UserStore expects res.imageUrl or similar based on its logic. Let's check service.
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
      this.imageFile = null;
      this.tmpImageUrl = null;
    } catch (err: any) {
      this.errors = err.error?.errors || { general: 'ERRORS.GENERAL' };
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

  toggleTopicNotifications(topic: any) {
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

  async fileUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        const resized = await this.resizeImage(reader.result as string);
        this.tmpImageUrl = resized.imageUrl;
        this.imageFile = resized.file;
      };
      reader.readAsDataURL(file);
    }
  }

  private resizeImage(imageURL: string): Promise<{ file: File, imageUrl: string }> {
    return new Promise((resolve) => {
      if (!isPlatformBrowser(this.platformId)) {
        resolve({ file: new File([], 'profileimage.jpg'), imageUrl: '' });
        return;
      }
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 320;
        canvas.height = 320;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, 320, 320);
        }
        const data = canvas.toDataURL('image/jpeg', 1);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'profileimage.jpg', { type: 'image/jpeg' });
            resolve({ file, imageUrl: data });
          }
        }, 'image/jpeg');
      };
      image.src = imageURL;
    });
  }

  async deleteUserImage() {
    if (this.fileInput) {
      this.fileInput.nativeElement.value = null;
    }
    this.form.imageUrl = '';
    this.imageFile = null;
    this.tmpImageUrl = null;
    
    try {
      await this.store.updateProfile({ imageUrl: '' });
    } catch (err) {
      console.error('Failed to delete image', err);
    }
  }
}
