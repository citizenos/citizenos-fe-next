import {
  Directive,
  ElementRef,
  Input,
  OnInit,
  OnChanges,
  OnDestroy,
  output,
  inject,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from '../dialog/dialog.service';
import { MarkdownLinkDialogComponent } from './components/markdown-link-dialog/markdown-link-dialog.component';
import EasyMDE from 'easymde';

@Directive({
  selector: '[cosMarkdown]',
  standalone: true,
})
export class MarkdownDirective implements OnInit, OnChanges, OnDestroy {
  @Input() item = '';
  @Input() initialValue?: string | null = null;
  itemChange = output<string>();
  @Input() limit = 100;
  @Input() placeholder?: string;
  @Input('cosmarkdowntranslatecharacterstatuskey')
  cosMarkdownTranslateCharacterStatusKey: any;

  private el = inject(ElementRef);
  private translate = inject(TranslateService);
  private dialog = inject(DialogService);

  private easymde: any;
  private readonly CHAR_COUNTER_ELEMENT_CLASS_NAME = 'charCounter';
  private curLength = 0;

  ngOnInit(): void {
    const placeholder =
      this.placeholder ??
      this.el.nativeElement.attributes.getNamedItem('placeholder')?.value;

    const config: any = {
      spellChecker: false,
      toolbar: [
        {
          name: 'write',
          text: this.translate.instant('MDEDITOR_TOOLTIP_WRITE'),
          className: 'no-disable tab-active tab-action',
          action: (editor: any) => {
            if (editor.isPreviewActive()) {
              EasyMDE.togglePreview(editor);
              editor.toolbarElements.write.classList.add('tab-active');
            }
          },
          title: this.translate.instant('MDEDITOR_TOOLTIP_WRITE'),
        },
        {
          name: 'preview',
          className: 'no-disable tab-action',
          text: this.translate.instant('MDEDITOR_TOOLTIP_PREVIEW'),
          action: (editor: any) => {
            if (!editor.isPreviewActive()) {
              EasyMDE.togglePreview(editor);
              editor.toolbarElements.write.classList.remove('tab-active');
            }
          },
          title: this.translate.instant('MDEDITOR_TOOLTIP_PREVIEW'),
        },
        {
          name: 'hyperlink',
          action: this.toggleLink(),
          className: 'fa md-right fa-link',
          title: this.translate.instant('MDEDITOR_TOOLTIP_HYPERLINK'),
        },
        '|',
        {
          name: 'unordered-list',
          action: EasyMDE.toggleUnorderedList,
          className: 'fa md-right fa-list-ul',
          title: this.translate.instant('MDEDITOR_TOOLTIP_UNORDERED_LIST'),
        },
        {
          name: 'ordered-list',
          action: EasyMDE.toggleOrderedList,
          className: 'fa md-right fa-list-ol',
          title: this.translate.instant('MDEDITOR_TOOLTIP_ORDERED_LIST'),
        },
        '|',
        {
          name: 'strikethrough',
          action: this.toggleStrikethrough(),
          className: 'fa md-right fa-strikethrough',
          title: this.translate.instant('MDEDITOR_TOOLTIP_STRIKETHROUGH'),
        },
        {
          name: 'italic',
          action: this.toggleItalic(),
          className: 'md-right fa fa-italic',
          title: this.translate.instant('MDEDITOR_TOOLTIP_ITALIC'),
        },
        {
          name: 'bold',
          action: this.toggleBold(),
          className: 'md-right fa fa-bold',
          title: this.translate.instant('MDEDITOR_TOOLTIP_BOLD'),
        },
      ],
      preview: true,
      blockStyles: { unorderedListStyle: '-', italic: '_' },
      status: [
        {
          className: this.CHAR_COUNTER_ELEMENT_CLASS_NAME,
          defaultValue: (el: any) => this.updateCharacterCount(el),
          onUpdate: (el: any) => this.updateCharacterCount(el),
        },
      ],
      minHeight: window.innerWidth < 560 ? '100px' : '100px',
      element: this.el.nativeElement,
      initialValue: this.initialValue ?? this.item,
    };

    if (placeholder) {
      config.placeholder = this.translate.instant(placeholder);
    }

    this.easymde = new EasyMDE(config);

    this.easymde.codemirror.on('beforeChange', (cm: any, change: any) => {
      const maxLength = cm.getOption('maxLength') || this.limit;
      if (maxLength && change?.update && change?.text.length) {
        let str = change.text.join('\n');
        let delta =
          str.length -
          (cm.indexFromPos(change.to) - cm.indexFromPos(change.from));
        if (delta <= 0) return true;
        delta = cm.getValue().length + delta - maxLength;
        if (delta > 0) {
          str = str.substr(0, str.length - delta);
          change.update(change.from, change.to, str.split('\n'));
        }
      }
      return true;
    });

    this.easymde.codemirror.on('change', () => {
      this.itemChange.emit(this.easymde.value());
    });
  }

  ngOnChanges(): void {
    if (this.easymde && this.item === this.initialValue) {
      this.easymde.value(this.initialValue);
    }
  }

  ngOnDestroy(): void {
    if (this.easymde) {
      this.easymde.toTextArea();
      this.easymde = null;
    }
  }

  private trimSelection() {
    const editor = this.easymde;
    if (!editor?.codemirror || editor.isPreviewActive()) return;
    const cm = editor.codemirror;
    const startPoint = cm.getCursor('start');
    const endPoint = cm.getCursor('end');
    const text = cm.getSelection().trim();
    cm.replaceSelection(text);
    endPoint.ch = startPoint.ch + text.length + 1;
    cm.setSelection(startPoint, endPoint);
    cm.focus();
  }

  private toggleStrikethrough() {
    return () => { this.trimSelection(); EasyMDE.toggleStrikethrough(this.easymde); };
  }

  private toggleItalic() {
    return () => { this.trimSelection(); EasyMDE.toggleItalic(this.easymde); };
  }

  private toggleBold() {
    return () => { this.trimSelection(); EasyMDE.toggleBold(this.easymde); };
  }

  private toggleLink() {
    return () => {
      const selected = this.easymde.codemirror.getSelection();
      this.dialog.open(MarkdownLinkDialogComponent, { data: { selected } })
        .afterClosed()
        .subscribe({
          next: (data: any) => {
            if (!data?.link) return;
            if (data.link.indexOf('http') === -1) data.link = `http://${data.link}`;
            const editor = this.easymde;
            if (!editor?.codemirror || editor.isPreviewActive()) return;
            const cm = editor.codemirror;
            const end = `](#url#)`.replace('#url#', data.link);
            const startPoint = cm.getCursor('start');
            const endPoint = cm.getCursor('end');
            const text = `[${data.linktext || cm.getSelection()}${end}`;
            cm.replaceSelection(text);
            endPoint.ch = startPoint.ch + text.length + 1;
            cm.setSelection(endPoint, endPoint);
            cm.focus();
          },
        });
    };
  }

  private getCharLength() {
    return this.item?.length ?? 0;
  }

  private updateCharacterCount(el: any) {
    if (this.cosMarkdownTranslateCharacterStatusKey && this.limit) {
      el.innerHTML =
        this.translate.instant(this.cosMarkdownTranslateCharacterStatusKey, {
          numberOfCharacters: this.limit,
        }) +
        ' (' +
        (this.limit - this.getCharLength()) +
        ')';
    }
  }
}
