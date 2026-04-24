import { Component, ChangeDetectionStrategy, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { DIALOG_DATA } from '../../../../shared/dialog/dialog-tokens';
import { DialogRef } from '../../../../shared/dialog/dialog-ref';
import { DialogCloseDirective } from '../../../../shared/dialog';
import { GroupDetailService } from '../../../../core/services/group-detail.service';
import { CountryService } from '../../../../core/services/country.service';
import { LanguageService } from '../../../../core/services/language.service';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { DropdownComponent } from '../../../../shared/components/dropdown/dropdown.component';
import { Group } from '../../../../core/interfaces/group';
import { take } from 'rxjs';

export interface GroupSettingsDialogData {
  group: Group;
}

@Component({
  selector: 'cos-group-settings-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, FormsModule, IconComponent, DropdownComponent, DialogCloseDirective],
  templateUrl: './group-settings-dialog.component.html',
  styleUrls: ['./group-settings-dialog.component.scss'],
})
export class GroupSettingsDialogComponent {
  private data = inject<GroupSettingsDialogData>(DIALOG_DATA);
  private dialogRef = inject(DialogRef);
  private groupDetailService = inject(GroupDetailService);
  private platformId = inject(PLATFORM_ID);
  private countryService = inject(CountryService);
  private languageService = inject(LanguageService);

  countries = this.countryService.countries.slice().sort((a, b) => a.name.localeCompare(b.name));
  languages = this.languageService.languages.slice().sort((a, b) => a.name.localeCompare(b.name));

  activeTab = signal<'info' | 'settings'>('info');

  group = signal<Partial<Group>>({ ...this.data.group });
  rules = signal<{ rule: string }[]>(
    (this.data.group.rules ?? []).map(r => ({ rule: r }))
  );
  errors = signal<any>(null);

  imageFile = signal<File | null>(null);
  uploadedImageUrl = signal<string | null>(null);
  readonly descriptionLength = 500;

  addRule() {
    this.rules.update(r => [...r, { rule: '' }]);
  }

  removeRule(index: number) {
    this.rules.update(r => r.filter((_, i) => i !== index));
  }

  updateRule(index: number, value: string) {
    this.rules.update(r => r.map((item, i) => i === index ? { rule: value } : item));
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.resizeImage(file).then(({ file: resized, imageUrl }) => {
      this.imageFile.set(resized);
      this.uploadedImageUrl.set(imageUrl);
    });
  }

  removeImage() {
    this.imageFile.set(null);
    this.uploadedImageUrl.set(null);
    this.group.update(g => ({ ...g, imageUrl: null }));
  }

  save() {
    const saveGroup: Partial<Group> = {
      ...this.group(),
      rules: this.rules().map(r => r.rule).filter(r => r.trim()),
    };

    this.groupDetailService.update(saveGroup).pipe(take(1)).subscribe({
      next: (updated) => {
        if (this.imageFile()) {
          this.groupDetailService.uploadGroupImage(this.imageFile()!, updated.id).pipe(
            take(1)
          ).subscribe(() => this.dialogRef.close(updated));
        } else {
          this.dialogRef.close(updated);
        }
      },
      error: (err) => this.errors.set(err?.error?.errors ?? err),
    });
  }

  private resizeImage(file: File): Promise<{ file: File; imageUrl: string }> {
    return new Promise(resolve => {
      if (!isPlatformBrowser(this.platformId)) {
        resolve({ file, imageUrl: '' });
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 320;
          canvas.height = 320;
          canvas.getContext('2d')!.drawImage(img, 0, 0, img.width, img.height, 0, 0, 320, 320);
          const imageUrl = canvas.toDataURL('image/jpeg', 1);
          canvas.toBlob(blob => {
            const resized = new File([blob!], 'profileimage.jpg', { type: 'image/jpeg' });
            canvas.remove();
            resolve({ file: resized, imageUrl });
          }, 'image/jpeg');
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
  }
}
