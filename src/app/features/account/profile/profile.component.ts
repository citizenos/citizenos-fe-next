import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { Subject, takeUntil, map, Observable, firstValueFrom } from 'rxjs';
import { RouterLink } from '@angular/router';

type ProfileTab = 'profile' | 'notifications';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ToggleComponent,
    DropdownComponent,
    InputComponent,
    RouterLink,
    TermsLinksComponent
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit, OnDestroy {
  store = inject(UserStore);
  configStore = inject(ConfigStore);
  userService = inject(UserService);
  topicNotificationService = inject(TopicNotificationService);
  translate = inject(TranslateService);

  activeTab = signal<ProfileTab>('profile');
  
  form = {
    name: '',
    email: '',
    company: '',
    language: '',
    password: '',
    newPassword: '',
    passwordConfirm: '',
    preferences: {
      showInSearch: false
    }
  };

  errors: any = {};
  resetPasswordMode = signal<boolean>(false);
  topicSearch = signal<string>('');
  
  languages: { [key: string]: string } = {
    en: 'English',
    ee: 'Eesti',
    ru: 'Русский'
  };

  private destroy$ = new Subject<void>();

  ngOnInit() {
    // Initialize form with user data
    const user = this.store.user();
    if (user) {
      this.form.name = user.name;
      this.form.email = user.email || '';
      this.form.company = user.company || '';
      this.form.language = user.language;
      this.form.preferences.showInSearch = user.preferences?.showInSearch || false;
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectTab(tab: ProfileTab) {
    this.activeTab.set(tab);
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
      preferences: this.form.preferences
    };

    if (this.resetPasswordMode()) {
      if (this.form.newPassword !== this.form.passwordConfirm) {
        this.errors.newPassword = 'MODALS.PASSWORD_MISMATCH';
        return;
      }
      params.password = this.form.password;
      params.newPassword = this.form.newPassword;
    }

    try {
      await this.store.updateProfile(params);
      this.resetPasswordMode.set(false);
      this.form.password = '';
      this.form.newPassword = '';
      this.form.passwordConfirm = '';
    } catch (err: any) {
      this.errors = err.error?.errors || { general: 'ERRORS.GENERAL' };
    }
  }

  async doDeleteAccount() {
    if (confirm(this.translate.instant('VIEWS.ACCOUNT.CONFIRM_DELETE'))) {
      try {
        await this.store.deleteAccount();
        // Redirect will happen via auth guard or manual navigation if needed
      } catch (err) {
        console.error('Failed to delete account', err);
      }
    }
  }

  setProfileLanguage(lang: string) {
    this.form.language = lang;
    this.configStore.setLanguage(lang);
  }

  searchTopics() {
    this.topicNotificationService.setParam('search', this.topicSearch());
  }

  toggleTopicNotifications(topic: any) {
    this.topicNotificationService.update(topic.topicId, {
      allowNotifications: !topic.allowNotifications
    }).subscribe();
  }

  triggerUploadImage() {
    const input = document.getElementById('profile_image_input') as HTMLInputElement;
    input.click();
  }

  async fileUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      try {
        await this.store.updateProfile({ imageUrl: await this.uploadImage(file) });
      } catch (err) {
        console.error('Image upload failed', err);
      }
    }
  }

  private async uploadImage(file: File): Promise<string> {
    const res = await firstValueFrom(this.userService.uploadUserImage(file));
    return res.imageUrl;
  }
}
