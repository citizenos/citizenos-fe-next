import re

file_path = 'src/app/shared/directives/markdown.directive.ts'
with open(file_path, 'r') as f:
    content = f.read()

# Change initialValue = input<string>(''); to initialValue = input<string | undefined>(undefined);
content = content.replace("initialValue = input<string>('');", "initialValue = input<string | undefined>(undefined);")

# Change ngOnChanges logic:
# In the old code:
#   ngOnChanges(): void {
#     if (this.easymde && this.item() === this.initialValue()) {
#       this.easymde.value(this.initialValue());
#     }
#   }
# This is buggy if item() changes dynamically from outside.
# Let's fix ngOnChanges:
ngOnChanges_replacement = """  ngOnChanges(): void {
    if (this.easymde && this.item() !== this.easymde.value()) {
      this.easymde.value(this.item());
    }
  }"""
content = re.sub(r'  ngOnChanges\(\): void \{[\s\S]*?  \}', ngOnChanges_replacement, content)

with open(file_path, 'w') as f:
    f.write(content)

