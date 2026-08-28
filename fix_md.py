import re

file_path = 'src/app/shared/directives/markdown.directive.ts'
with open(file_path, 'r') as f:
    content = f.read()

replacement = """        {
          name: 'write',
          className: 'no-disable tab-active tab-action',
          text: this.translate.instant('MDEDITOR_TOOLTIP_WRITE'),
          action: (editor: any) => {
            if (editor.isPreviewActive()) {
              EasyMDE.togglePreview(editor);
              if (editor.toolbarElements?.write) editor.toolbarElements.write.classList.add('tab-active');
              if (editor.toolbarElements?.preview) editor.toolbarElements.preview.classList.remove('active');
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
              if (editor.toolbarElements?.write) editor.toolbarElements.write.classList.remove('tab-active');
              if (editor.toolbarElements?.preview) editor.toolbarElements.preview.classList.add('active');
            }
          },
          title: this.translate.instant('MDEDITOR_TOOLTIP_PREVIEW'),
        },"""

# Use regex to find and replace the toolbar array for write and preview
old_toolbar_section = r"""\s*{\s*name:\s*'write',[\s\S]*?title:\s*this\.translate\.instant\('MDEDITOR_TOOLTIP_WRITE'\),\s*},\s*{\s*name:\s*'preview',[\s\S]*?title:\s*this\.translate\.instant\('MDEDITOR_TOOLTIP_PREVIEW'\),\s*},"""

content = re.sub(old_toolbar_section, "\n" + replacement, content)

with open(file_path, 'w') as f:
    f.write(content)

