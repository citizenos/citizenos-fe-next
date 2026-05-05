import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DIALOG_DATA, DialogRef, DialogCloseDirective } from '../../../dialog';
import { InputComponent } from '../../../components/input/input.component';

@Component({
  selector: 'app-markdown-link-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, TranslateModule, DialogCloseDirective, InputComponent],
  templateUrl: './markdown-link-dialog.component.html',
  styleUrl: './markdown-link-dialog.component.scss',
})
export class MarkdownLinkDialogComponent {
  private data = inject<{ selected?: string }>(DIALOG_DATA);
  private linkDialog = inject<DialogRef<MarkdownLinkDialogComponent>>(DialogRef);

  wWidth = window.innerWidth;
  form = new FormGroup({
    linktext: new FormControl(''),
    link: new FormControl(''),
  });

  constructor() {
    if (this.data.selected) {
      this.form.setValue({ linktext: this.data.selected, link: '' });
    }
  }

  save() {
    this.linkDialog.close(this.form.value);
  }
}
