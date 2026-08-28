import re

file_path = 'src/app/shared/directives/markdown.directive.ts'
with open(file_path, 'r') as f:
    content = f.read()

content = content.replace('''  ngOnChanges(): void {
    if (this.easymde && this.item() !== this.easymde.value()) {
      this.easymde.value(this.item());
    }
  }
  }''', '''  ngOnChanges(): void {
    if (this.easymde && this.item() !== this.easymde.value()) {
      this.easymde.value(this.item());
    }
  }''')

with open(file_path, 'w') as f:
    f.write(content)

